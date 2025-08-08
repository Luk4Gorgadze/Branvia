import { NextRequest, NextResponse } from 'next/server';
import { CampaignService } from '@/_lib/_services/campaignService';

export async function GET(request: NextRequest) {
    try {
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