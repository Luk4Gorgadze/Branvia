import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/_lib/_auth/auth';
import { headers } from 'next/headers';
import { CampaignService } from '@/_lib/_services/campaignService';
import { ProductUploadService } from '@/_lib/_services/productUploadService';

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
        const {
            productTitle,
            productDescription,
            selectedStyle,
            customStyle,
            outputFormat,
            productImageS3Key,
        } = body;

        // Validate required fields
        if (!productTitle || !productDescription || !outputFormat || !productImageS3Key) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

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

        return NextResponse.json({
            success: true,
            campaignId: campaign.id,
            message: 'Campaign created successfully'
        });

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

        return NextResponse.json({
            success: true,
            campaigns
        });

    } catch (error) {
        console.error('Error fetching campaigns:', error);
        return NextResponse.json(
            { error: 'Failed to fetch campaigns' },
            { status: 500 }
        );
    }
} 