import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/_lib/_auth/auth';
import { headers } from 'next/headers';
import { CampaignService } from '@/_lib/_services/campaignService';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Get user session (optional for public campaigns)
        const session = await auth.api.getSession({
            headers: await headers()
        });

        const { id: campaignId } = await params;

        // Get campaign with access control
        const campaign = await CampaignService.getCampaign(campaignId, session?.user?.id);

        if (!campaign) {
            return NextResponse.json(
                { error: 'Campaign not found or access denied' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            campaign
        });

    } catch (error) {
        console.error('Error fetching campaign:', error);
        return NextResponse.json(
            { error: 'Failed to fetch campaign' },
            { status: 500 }
        );
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
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

        const { id: campaignId } = await params;
        const body = await request.json();

        // Update campaign
        const campaign = await CampaignService.updateCampaign(campaignId, body);

        return NextResponse.json({
            success: true,
            campaign
        });

    } catch (error) {
        console.error('Error updating campaign:', error);
        return NextResponse.json(
            { error: 'Failed to update campaign' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
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

        const { id: campaignId } = await params;

        // Delete campaign
        await CampaignService.deleteCampaign(campaignId);

        return NextResponse.json({
            success: true,
            message: 'Campaign deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting campaign:', error);
        return NextResponse.json(
            { error: 'Failed to delete campaign' },
            { status: 500 }
        );
    }
} 