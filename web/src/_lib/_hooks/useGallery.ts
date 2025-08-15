import { useState, useEffect, useMemo } from 'react';
import { getUserCampaigns } from '@/_actions/campaigns';

interface Campaign {
    id: string;
    productTitle: string;
    outputFormat: string;
    generatedImages: string[];
    createdAt: Date;
}

interface TransformedCampaign {
    id: string;
    productTitle: string;
    outputFormat: string;
    generatedImages: string[];
    createdAt: string;
}

interface UseGalleryReturn {
    campaigns: TransformedCampaign[];
    loading: boolean;
    error: string | null;
    page: number;
    totalPages: number;
    pageItems: TransformedCampaign[];
    setPage: (page: number) => void;
    paginationItems: (number | '…')[];
    isLoading: boolean;
}

const PAGE_SIZE = 16;

export const useGallery = (userId: string | undefined): UseGalleryReturn => {
    const [campaigns, setCampaigns] = useState<TransformedCampaign[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);

    // Load campaigns
    useEffect(() => {
        async function loadCampaigns() {
            if (!userId) return;

            try {
                setLoading(true);
                setError(null);

                const result = await getUserCampaigns({});

                if (result.success && result.data) {
                    const transformedCampaigns = result.data.map((campaign: any) => ({
                        ...campaign,
                        createdAt: campaign.createdAt.toISOString()
                    }));
                    setCampaigns(transformedCampaigns);
                } else {
                    throw new Error(result.error || 'Failed to load campaigns');
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load campaigns');
            } finally {
                setLoading(false);
            }
        }

        loadCampaigns();
    }, [userId]);

    // Calculate pagination
    const totalPages = Math.max(1, Math.ceil(campaigns.length / PAGE_SIZE));

    const pageItems = useMemo(() => {
        const start = (page - 1) * PAGE_SIZE;
        return campaigns.slice(start, start + PAGE_SIZE);
    }, [campaigns, page]);

    // Generate pagination items
    const paginationItems = useMemo(() => {
        const pages: (number | '…')[] = [];
        const clamp = (n: number) => Math.max(1, Math.min(totalPages, n));
        const add = (p: number) => { if (!pages.includes(p)) pages.push(p) };

        add(1);
        add(clamp(page - 1));
        add(clamp(page));
        add(clamp(page + 1));
        add(totalPages);

        // Sort and insert ellipsis
        const uniqueSorted = Array.from(new Set(pages.filter(p => typeof p === 'number')))
            .sort((a, b) => (a as number) - (b as number)) as number[];

        const result: (number | '…')[] = [];
        for (let i = 0; i < uniqueSorted.length; i++) {
            const p = uniqueSorted[i];
            if (i === 0) {
                result.push(p);
            } else {
                const prev = uniqueSorted[i - 1];
                if (p - prev === 1) {
                    result.push(p);
                } else {
                    result.push('…', p);
                }
            }
        }

        return result;
    }, [page, totalPages]);

    return {
        campaigns,
        loading,
        error,
        page,
        totalPages,
        pageItems,
        setPage,
        paginationItems,
        isLoading: loading
    };
}; 