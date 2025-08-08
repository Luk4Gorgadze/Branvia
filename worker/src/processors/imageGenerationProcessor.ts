import { Job } from 'bullmq';
import { prisma } from '@branvia/database';
import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';
import FormData from 'form-data';
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import dotenv from 'dotenv';

dotenv.config();
// Initialize AI clients
console.log('🔑 GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? `${process.env.GEMINI_API_KEY.substring(0, 10)}...` : 'NOT FOUND');
console.log('🪣 AWS_S3_BUCKET_NAME:', process.env.AWS_S3_BUCKET_NAME || 'NOT FOUND');
console.log('🔑 AWS_ACCESS_KEY_ID:', process.env.AWS_ACCESS_KEY_ID ? `${process.env.AWS_ACCESS_KEY_ID.substring(0, 10)}...` : 'NOT FOUND');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
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
    outputFormat: string;
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

async function generatePromptWithGemini(productTitle: string, productDescription: string, style: string, format: string): Promise<string> {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const promptTemplate = `You are an expert creative director and commercial product photographer. 
    Write a single-paragraph, highly detailed image generation prompt (max 120 words) based on this product: 
    ${productTitle}, ${productDescription}. The prompt must strictly preserve all visual details, textures, colors, 
    and proportions of the original reference image — the product must remain unchanged. 
    Enhance only the environment: adapt the background, lighting, and ambiance to match the ${style} aesthetic 
    and elevate the product’s premium appeal. Use realistic studio photography language — describe lighting setup 
    (e.g., soft diffused light with octabox), camera settings, background tone (e.g., clean gradient or rich texture), 
    and depth of field. The final image should look editorial, refined, and suitable for high-end marketing. 
    Avoid generic repetition. Format: ${format}.`;

    const result = await model.generateContent(promptTemplate);
    const response = await result.response;
    return response.text();
}

async function generateImageWithStabilityAI(prompt: string, outputFormat: string, referenceImageBuffer: Buffer): Promise<Buffer> {
    console.log('🔑 STABILITY_API_KEY:', process.env.STABILITY_API_KEY ? `${process.env.STABILITY_API_KEY.substring(0, 10)}...` : 'NOT FOUND');

    const formData = new FormData();
    formData.append('prompt', prompt);
    formData.append('output_format', outputFormat === 'jpeg' ? 'jpeg' : 'png');
    formData.append('image', referenceImageBuffer, {
        filename: 'reference.jpg',
        contentType: 'image/jpeg'
    });
    formData.append('mode', 'image-to-image');
    formData.append('strength', '.7'); // Controls how much influence the reference image has
    formData.append('model', 'sd3.5-large-turbo'); // Specify the model explicitly

    const url = `https://api.stability.ai/v2beta/stable-image/generate/sd3`;
    console.log('🌐 Calling Stability AI URL:', url);

    const response = await axios.post(
        url,
        formData,
        {
            validateStatus: undefined,
            responseType: "arraybuffer",
            headers: {
                Authorization: `Bearer ${process.env.STABILITY_API_KEY}`,
                Accept: "image/*",
                ...formData.getHeaders()
            },
        },
    );

    console.log('📡 Stability AI Response Status:', response.status);

    if (response.status === 200) {
        return Buffer.from(response.data);
    } else {
        console.error('❌ Stability AI Error Response:', response.data.toString());
        throw new Error(`${response.status}: ${response.data.toString()}`);
    }
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

async function uploadImageToS3(imageBuffer: Buffer, fileName: string): Promise<string> {
    const s3Key = `generated-images/${fileName}`;

    const command = new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME || '',
        Key: s3Key,
        Body: imageBuffer,
        ContentType: 'image/jpeg'
    });

    await s3Client.send(command);
    return s3Key;
}

export async function imageGenerationProcessor(job: Job<ImageGenerationJobData>): Promise<ImageGenerationResult> {
    const { productImageS3Key, productTitle, productDescription, selectedStyle, customStyle, outputFormat, userId, campaignId } = job.data;

    console.log(`🎨 Processing image generation job ${job.id} for user ${userId}`);
    console.log(`📁 Using product image from S3: ${productImageS3Key}`);

    try {
        // Step 1: Generate prompt using Gemini
        console.log(`🤖 Generating prompt with Gemini...`);
        const prompt = await generatePromptWithGemini(
            productTitle,
            productDescription,
            customStyle || selectedStyle,
            outputFormat
        );
        console.log(`📝 Generated prompt: ${prompt}`);

        // Step 2: Download reference product image from S3
        console.log(`📥 Downloading reference product image from S3...`);
        const referenceImageBuffer = await downloadImageFromS3(productImageS3Key);

        // Step 3: Generate 3 images using Stability AI with reference image
        console.log(`🎨 Generating 3 images with Stability AI...`);
        const generatedImages: string[] = [];

        for (let i = 0; i < 3; i++) {
            console.log(`🎨 Generating image ${i + 1}/3...`);
            const imageBuffer = await generateImageWithStabilityAI(prompt, outputFormat, referenceImageBuffer);

            // Step 4: Upload generated image to S3
            console.log(`☁️ Uploading generated image ${i + 1}/3 to S3...`);
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const fileName = `generated-${campaignId}-${i + 1}-${timestamp}.jpg`;
            const generatedImageS3Key = await uploadImageToS3(imageBuffer, fileName);

            generatedImages.push(generatedImageS3Key);
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

        // Update the campaign with generated images, prompt, and mark as completed
        await prisma.campaign.update({
            where: { id: campaignId },
            data: {
                generatedImages: generatedImages,
                prompt: prompt,
                status: 'completed'
            }
        });
        console.log(`💾 Updated campaign ${campaignId} with generated images`);

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