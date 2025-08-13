import { NextResponse } from 'next/server';
import { CampaignService } from '@/_lib/_services/campaignService';

// Force dynamic rendering - prevents build-time execution
export const dynamic = "force-dynamic";

export async function GET() {
    try {
        // Additional build-time safety check
        if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) {
            return NextResponse.json({
                success: true,
                campaigns: [],
                message: 'Build time - using mock data'
            });
        }

        // Get public campaigns (no authentication required)
        const campaigns = await CampaignService.getPublicCampaigns();

        return NextResponse.json({
            success: true,
            campaigns
        });

    } catch (error) {
        console.error('Error fetching public campaigns:', error);
        return NextResponse.json(
            { error: 'Failed to fetch public campaigns' },
            { status: 500 }
        );
    }
} 