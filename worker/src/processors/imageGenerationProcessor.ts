import { Job } from 'bullmq';
import { prisma } from '@branvia/database';
import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import { toFile } from 'openai/uploads';
import { S3Client, GetObjectCommand, PutObjectCommand, DeleteObjectCommand, CopyObjectCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

dotenv.config();
// Initialize AI clients
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || ''
});
const s3Client = new S3Client({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
    }
});

export interface ImageGenerationJobData {
    productImageS3Key: string; // S3 key instead of base64
    productTitle: string;
    productDescription: string;
    selectedStyle: string;
    customStyle?: string;
    outputFormat: 'square' | 'portrait' | 'landscape';
    userId: string;
    campaignId: string;
}

export interface ImageGenerationResult {
    generatedImages: string[]; // Array of generated image S3 keys
    prompt: string; // The prompt used for generation
    metadata: {
        style: string;
        format: string;
        timestamp: string;
    };
}

async function deductCreditsOnceForCampaign(params: { userId: string; campaignId: string; jobId: string | number; amount: number }) {
    const { userId, campaignId, jobId, amount } = params;
    // Idempotency: if a transaction for this campaign already exists, skip
    const existing = await prisma.creditTransaction.findFirst({
        where: {
            userId,
            reason: 'image_generation',
            // Metadata equality match; stores campaignId for detection
            metadata: {
                equals: { campaignId },
            } as any,
        },
    });
    if (existing) {
        console.log(`ℹ️ Credits already deducted for campaign ${campaignId}, skipping.`);
        return;
    }

    await prisma.$transaction([
        prisma.user.update({
            where: { id: userId },
            data: { availableCredits: { decrement: amount } },
        }),
        prisma.creditTransaction.create({
            data: {
                userId,
                change: -amount,
                reason: 'image_generation',
                metadata: { campaignId, jobId },
            },
        }),
    ]);
    console.log(`💳 Deducted ${amount} credits from user ${userId} for campaign ${campaignId}`);
}

async function generatePromptWithGemini(productTitle: string, productDescription: string, style: string, format: 'square' | 'portrait' | 'landscape'): Promise<string> {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const promptTemplate = `You are an expert commercial product photographer.
    Generate a concise, detailed prompt (max 120 words) for image generation.
    The product is: ${productTitle}, ${productDescription}.
    **The product must remain identical** in shape, proportions, textures, colors, and branding — do not alter it in any way.
    Only change the environment and background to reflect the ${style} aesthetic.
    You must explicitly specify a realistic camera body and lens setup that best fits this product type (e.g., macro lens for small items, portrait lens for bottles, wide lens for furniture).
    Background should enhance the product — it may be clean, artistic, or contextually styled, but must not distract from the product.
    Ensure ultra-realistic quality, natural lighting, professional depth of field, and refined presentation for high-end marketing.
    Format: ${format}. Reference image provided for guidance.`;



    const result = await model.generateContent(promptTemplate);
    const response = await result.response;
    return response.text();
}

function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}


async function generateImagesWithResponsesAPI(
    prompt: string,
    referenceImageBase64: string,
    mime: string,
    options?: {
        model?: string;
        numberOfImages?: number;
        outputFormat?: 'square' | 'portrait' | 'landscape';
        maxRetries?: number;
    }
): Promise<Buffer[]> {
    const model = options?.model ?? 'gpt-4.1-mini';
    const numberOfImages = options?.numberOfImages ?? 3;
    const maxRetries = options?.maxRetries ?? 2;
    const outputFormat = options?.outputFormat ?? 'square';

    const sizeMap: Record<string, string> = {
        square: '1024x1024',
        portrait: '1024x1536',
        landscape: '1536x1024',
    };
    const size = sizeMap[outputFormat];

    const referenceDataUrl = `data:${mime};base64,${referenceImageBase64}`;

    // Create parallel calls for numberOfImages
    const generationPromises = Array.from({ length: numberOfImages }, () => {
        let attempt = 0;

        const attemptGeneration = async (): Promise<Buffer> => {
            try {
                const response = await openai.responses.create({
                    model,
                    input: [
                        {
                            role: 'user',
                            content: [
                                { type: 'input_text', text: `${prompt}\n\nGenerate the final image now. Do not ask clarifying questions.` },
                                { type: 'input_image', image_url: referenceDataUrl }
                            ],
                        },
                    ],
                    tools: [
                        {
                            type: 'image_generation',
                            size: `${size}`
                        }
                    ],
                    tool_choice: {
                        type: 'image_generation'
                    } as any
                } as any);


                const output = (response as any).output;
                const imageData = output
                    ?.filter((o: any) => o.type === 'image_generation_call')
                    ?.map((o: any) => o.result) as string[] | undefined;

                if (imageData && imageData.length > 0) {
                    const imageBase64 = imageData[0];
                    return Buffer.from(imageBase64, 'base64');
                }

                const fallback = output?.content?.[0]?.image_base64 as string | undefined;
                if (fallback) {
                    return Buffer.from(fallback, 'base64');
                }

                // If no image returned, trigger retry/exit via catch handler
                throw new Error('No image data received from OpenAI Responses API');
            } catch (err) {
                if (attempt < maxRetries) {
                    attempt++;
                    await new Promise((r) => setTimeout(r, 500 + attempt * 300));
                    return attemptGeneration();
                }
                throw err;
            }
        };

        return attemptGeneration();
    });

    // Wait for all images in parallel
    const results = await Promise.allSettled(generationPromises);

    const buffers = results
        .filter((r): r is PromiseFulfilledResult<Buffer> => r.status === 'fulfilled')
        .map(r => r.value);

    if (buffers.length === 0) throw new Error('All image generations failed');

    return buffers;
}



async function downloadImageFromS3(s3Key: string): Promise<Buffer> {
    const command = new GetObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME || '',
        Key: s3Key
    });

    const response = await s3Client.send(command);
    if (!response.Body) {
        throw new Error('No image data received from S3');
    }

    return Buffer.from(await response.Body.transformToByteArray());
}

function guessMimeTypeFromKey(s3Key: string): string {
    const lower = s3Key.toLowerCase();
    if (lower.endsWith('.png')) return 'image/png';
    if (lower.endsWith('.webp')) return 'image/webp';
    if (lower.endsWith('.gif')) return 'image/gif';
    return 'image/jpeg';
}

async function downloadImageBase64FromS3(s3Key: string): Promise<{ base64: string; mime: string; buffer: Buffer }> {
    const command = new GetObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME || '',
        Key: s3Key
    });

    const response = await s3Client.send(command);
    if (!response.Body) {
        throw new Error('No image data received from S3');
    }
    const buffer = Buffer.from(await response.Body.transformToByteArray());
    const mime = response.ContentType || guessMimeTypeFromKey(s3Key);
    return { base64: buffer.toString('base64'), mime, buffer };
}

async function uploadImageToS3(imageBuffer: Buffer, fileName: string, contentType: string = 'image/jpeg', testing: boolean = false): Promise<string> {
    const s3Key = testing ? `testing-images/${fileName}` : `generated-images/${fileName}`;

    const command = new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME || '',
        Key: s3Key,
        Body: imageBuffer,
        ContentType: contentType
    });

    await s3Client.send(command);
    return s3Key;
}

async function copyImageToPermanentLocationFromKey(sourceKey: string, userId: string, campaignId: string, fileName: string): Promise<string> {
    const destinationKey = `permanent-uploads/${userId}/${campaignId}/${fileName}`;
    const bucket = process.env.AWS_S3_BUCKET_NAME || '';
    const copy = new CopyObjectCommand({
        Bucket: bucket,
        CopySource: `${bucket}/${sourceKey}`,
        Key: destinationKey,
    });
    await s3Client.send(copy);
    return destinationKey;
}

async function deleteImageFromS3(s3Key: string): Promise<void> {
    const command = new DeleteObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME || '',
        Key: s3Key
    });

    try {
        await s3Client.send(command);
        console.log(`🗑️ Deleted temporary image: ${s3Key}`);
    } catch (error) {
        console.error(`❌ Failed to delete temporary image ${s3Key}:`, error);
        // Don't throw error - we don't want cleanup failure to break the main process
    }
}

export async function imageGenerationProcessor(job: Job<ImageGenerationJobData>): Promise<ImageGenerationResult> {
    const { productImageS3Key, productTitle, productDescription, selectedStyle, customStyle, outputFormat, userId, campaignId } = job.data;
    const isTesting = (job.data as any).testing === true || (process.env.IMAGE_GEN_TESTING === 'true');

    console.log(`🎨 Processing image generation job ${job.id} for user ${userId}`);
    console.log(`📁 Using product image from S3: ${productImageS3Key}`);

    try {
        if (isTesting) {
            console.log('🧪 Testing mode enabled: returning mock images instead of real generations');
            const mockPngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8Xw8AAoMBgT1xV6UAAAAASUVORK5CYII=';
            const mockBuffer = Buffer.from(mockPngBase64, 'base64');
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

            // Upload mock images to testing folder
            const testGeneratedImages: string[] = [];
            for (let i = 1; i <= 3; i++) {
                const testKey = await uploadImageToS3(
                    mockBuffer,
                    `test-mock-generated-${i}-${timestamp}.png`,
                    'image/png',
                    true
                );
                testGeneratedImages.push(testKey);
            }

            // Move product image to permanent storage via S3 copy
            const permanentProductImageKey = await copyImageToPermanentLocationFromKey(
                productImageS3Key,
                userId,
                campaignId,
                `product-image-${timestamp}.jpg`
            );

            // Clean up temporary files
            await deleteImageFromS3(productImageS3Key);

            const prompt = `MOCK_PROMPT for ${productTitle}: style=${customStyle || selectedStyle}, format=${outputFormat}`;
            const result: ImageGenerationResult = {
                generatedImages: testGeneratedImages,
                prompt,
                metadata: {
                    style: customStyle || selectedStyle,
                    format: outputFormat,
                    timestamp: new Date().toISOString()
                }
            };

            await prisma.campaign.update({
                where: { id: campaignId },
                data: {
                    productImageS3Key: permanentProductImageKey,
                    generatedImages: testGeneratedImages,
                    prompt,
                    status: 'completed'
                }
            });
            console.log(`✅ [TEST] Mock images stored in permanent location for campaign ${campaignId}`);
            // Deduct credits after successful completion (test mode too)
            try {
                await deductCreditsOnceForCampaign({ userId, campaignId, jobId: job.id!, amount: 50 });
            } catch (e) {
                console.error('❌ Failed to deduct credits (test mode):', e);
            }
            return result;
        }
        // Step 1: Generate prompt using Gemini
        console.log(`🤖 Generating prompt with Gemini...`);
        const prompt = await generatePromptWithGemini(
            productTitle,
            productDescription,
            customStyle || selectedStyle,
            outputFormat
        );
        console.log(`📝 Generated prompt: ${prompt}`);

        // Step 2: Read reference image and generate images using OpenAI (image-to-image)
        console.log(`📥 Downloading reference product image from S3...`);
        const { base64: referenceImageBase64, mime } = await downloadImageBase64FromS3(productImageS3Key);

        console.log(`🎨 Generating 3 images with a single OpenAI call (image-to-image)...`);
        const imageBuffers = await generateImagesWithResponsesAPI(prompt, referenceImageBase64, mime, { outputFormat, numberOfImages: 3 });

        console.log(`☁️ Uploading generated images to S3...`);
        const uploadSettled = await Promise.allSettled(
            imageBuffers.map((buffer, idx) => {
                const imageIndex = idx + 1;
                const ts = new Date().toISOString().replace(/[:.]/g, '-');
                const fileName = `generated-${campaignId}-${imageIndex}-${ts}.jpg`;
                return uploadImageToS3(buffer, fileName, 'image/jpeg', false);
            })
        );
        const generatedImages = uploadSettled
            .filter((r): r is PromiseFulfilledResult<string> => r.status === 'fulfilled')
            .map(r => r.value);

        if (generatedImages.length === 0) {
            throw new Error('All parallel image generations failed');
        }

        const result: ImageGenerationResult = {
            generatedImages,
            prompt,
            metadata: {
                style: customStyle || selectedStyle,
                format: outputFormat,
                timestamp: new Date().toISOString()
            }
        };

        console.log(`✅ Generated ${generatedImages.length} images for job ${job.id}`);

        // Step 3: Move product image to permanent storage
        console.log(`🔄 Moving product image to permanent storage...`);
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const permanentProductImageKey = await copyImageToPermanentLocationFromKey(
            productImageS3Key,
            userId,
            campaignId,
            `product-image-${timestamp}.jpg`
        );
        console.log(`💾 Product image moved to: ${permanentProductImageKey}`);

        // Step 4: Clean up temporary product image only
        console.log(`🗑️ Cleaning up temporary product image...`);
        await deleteImageFromS3(productImageS3Key);
        console.log(`✅ Temporary product image cleaned up`);

        // Step 5: Update database and deduct credits (only after everything is done)
        console.log(`💾 Updating campaign ${campaignId} in database...`);
        await prisma.campaign.update({
            where: { id: campaignId },
            data: {
                productImageS3Key: permanentProductImageKey, // Update with permanent product image
                generatedImages: generatedImages,   // Keep generated images in their original location
                prompt: prompt,
                status: 'completed'
            }
        });
        console.log(`✅ Campaign ${campaignId} updated successfully`);

        // Deduct credits after successful completion
        try {
            await deductCreditsOnceForCampaign({ userId, campaignId, jobId: job.id!, amount: 50 });
        } catch (e) {
            console.error('❌ Failed to deduct credits:', e);
        }

        return result;
    } catch (error) {
        console.error(`❌ Error in image generation job ${job.id}:`, error);

        // Update campaign status to failed
        await prisma.campaign.update({
            where: { id: campaignId },
            data: {
                status: 'failed'
            }
        });

        throw error;
    }
} 