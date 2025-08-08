import { NextRequest, NextResponse } from 'next/server';
import { addImageGenerationJob, getJobStatus } from '@/_lib/_queues/imageGenerationQueue';
import {
    ImageGenerationRequestSchema,
    JobStatusResponseSchema,
    ImageGenerationResponseSchema,
    ErrorResponseSchema,
    type ImageGenerationRequest
} from '@/_lib/_schemas/imageGeneration';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate request body with Zod
        const validationResult = ImageGenerationRequestSchema.safeParse(body);

        if (!validationResult.success) {
            const errors = validationResult.error.errors.map((err: any) =>
                `${err.path.join('.')}: ${err.message}`
            ).join(', ');

            console.error('Validation failed:', {
                receivedBody: body,
                errors: validationResult.error.errors
            });

            return NextResponse.json(
                { error: `Validation failed: ${errors}` },
                { status: 400 }
            );
        }

        const validatedData: ImageGenerationRequest = validationResult.data;

        // Add job to queue
        const job = await addImageGenerationJob(validatedData);

        const response = {
            success: true,
            jobId: job.id,
            message: 'Image generation job added to queue'
        };

        // Validate response with Zod
        const responseValidation = ImageGenerationResponseSchema.safeParse(response);
        if (!responseValidation.success) {
            throw new Error('Invalid response format');
        }

        return NextResponse.json(responseValidation.data);

    } catch (error) {
        console.error('Error adding image generation job:', error);

        const errorResponse = {
            error: 'Failed to add job to queue'
        };

        // Validate error response with Zod
        const errorValidation = ErrorResponseSchema.safeParse(errorResponse);
        if (!errorValidation.success) {
            throw new Error('Invalid error response format');
        }

        return NextResponse.json(errorValidation.data, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const jobId = searchParams.get('jobId');

        if (!jobId) {
            const errorResponse = { error: 'Job ID is required' };
            const errorValidation = ErrorResponseSchema.safeParse(errorResponse);

            return NextResponse.json(
                errorValidation.success ? errorValidation.data : { error: 'Invalid error format' },
                { status: 400 }
            );
        }

        const jobStatus = await getJobStatus(jobId);

        // Validate job status response with Zod
        const statusValidation = JobStatusResponseSchema.safeParse(jobStatus);
        if (!statusValidation.success) {
            throw new Error('Invalid job status response format');
        }

        return NextResponse.json(statusValidation.data);

    } catch (error) {
        console.error('Error getting job status:', error);

        const errorResponse = {
            error: 'Failed to get job status'
        };

        const errorValidation = ErrorResponseSchema.safeParse(errorResponse);

        return NextResponse.json(
            errorValidation.success ? errorValidation.data : { error: 'Invalid error format' },
            { status: 500 }
        );
    }
} 