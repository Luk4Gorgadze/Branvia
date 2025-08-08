import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/_lib/_auth/auth';
import { headers } from 'next/headers';
import { CampaignService } from '@/_lib/_services/campaignService';
import { ProductUploadService } from '@/_lib/_services/productUploadService';
import {
    CampaignCreationRequestSchema,
    CampaignResponseSchema,
    CampaignsListResponseSchema,
    ErrorResponseSchema
} from '@/_lib/_schemas/imageGeneration';

export async function POST(request: NextRequest) {
    try {
        // Get user session
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session?.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();

        // Validate request body with Zod
        const validationResult = CampaignCreationRequestSchema.safeParse(body);
        if (!validationResult.success) {
            const errorResponse = ErrorResponseSchema.parse({
                error: `Validation failed: ${validationResult.error.errors.map((e: any) => e.message).join(', ')}`
            });
            return NextResponse.json(errorResponse, { status: 400 });
        }

        const {
            productTitle,
            productDescription,
            selectedStyle,
            customStyle,
            outputFormat,
            productImageS3Key,
        } = validationResult.data;

        // Create campaign
        const campaign = await CampaignService.createCampaign({
            userId: session.user.id,
            productTitle,
            productDescription,
            selectedStyle,
            customStyle,
            outputFormat,
            productImageS3Key,
        });

        // Link the upload to the campaign
        await ProductUploadService.linkToCampaign(productImageS3Key, campaign.id);

        // Validate response with Zod
        const response = CampaignResponseSchema.parse({
            success: true,
            campaignId: campaign.id,
            message: 'Campaign created successfully'
        });

        return NextResponse.json(response);

    } catch (error) {
        console.error('Error creating campaign:', error);
        return NextResponse.json(
            { error: 'Failed to create campaign' },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        // Get user session
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session?.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Get user campaigns
        const campaigns = await CampaignService.getUserCampaigns(session.user.id);

        // Validate response with Zod
        const response = CampaignsListResponseSchema.parse({
            success: true,
            campaigns
        });

        return NextResponse.json(response);

    } catch (error) {
        console.error('Error fetching campaigns:', error);
        return NextResponse.json(
            { error: 'Failed to fetch campaigns' },
            { status: 500 }
        );
    }
} 