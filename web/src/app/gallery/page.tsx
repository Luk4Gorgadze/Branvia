"use client"
import { useUser } from '@/_lib/_providers';
import { useGallery } from '@/_lib/_hooks/useGallery';
import { getS3Url } from '@/_lib/_utils/s3Utils';
import { Skeleton } from '@/_components/ui/Skeleton';
import { CampaignDiv } from '@/_components/ui/CampaignDiv';
import styles from './page.module.css';

const PAGE_SIZE = 16;

export default function GalleryPage() {
    const { user } = useUser();
    const {
        pageItems,
        loading,
        error,
        page,
        totalPages,
        paginationItems,
        setPage
    } = useGallery(user?.id);

    if (!user) {
        return null; // or redirect
    }

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <h1 className={styles.title}>Your Gallery</h1>
            </div>

            {error && (
                <div className={styles.error} style={{ color: '#ff6b6b', marginBottom: '20px', textAlign: 'center' }}>
                    {error}
                </div>
            )}

            <div className={styles.grid}>
                {loading
                    ? Array.from({ length: PAGE_SIZE }).map((_, i) => (
                        <div key={i} className={styles.skeletonCard}>
                            <Skeleton className={styles.skeletonImage} shimmer={true} />
                        </div>
                    ))
                    : pageItems.map((campaign) => {
                        const firstImageKey = campaign.generatedImages?.[0];
                        const imageUrl = firstImageKey ? getS3Url(firstImageKey) : undefined;

                        return (
                            <CampaignDiv
                                key={campaign.id}
                                href={`/campaign/${campaign.id}`}
                                imageUrl={imageUrl}
                                overlayText="See details"
                            />
                        );
                    })}
            </div>

            {totalPages > 1 && (
                <div className={styles.pagination}>
                    <button
                        className={styles.pageBtn}
                        disabled={page === 1}
                        onClick={() => setPage(Math.max(1, page - 1))}
                    >
                        Prev
                    </button>

                    {paginationItems.map((item, i) =>
                        item === '…' ? (
                            <span key={`ellipsis-${i}`} className={styles.ellipsis}>…</span>
                        ) : (
                            <button
                                key={item}
                                className={`${styles.pageBtn} ${page === item ? styles.active : ''}`}
                                onClick={() => setPage(item as number)}
                            >
                                {item}
                            </button>
                        )
                    )}

                    <button
                        className={styles.pageBtn}
                        disabled={page === totalPages}
                        onClick={() => setPage(Math.min(totalPages, page + 1))}
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}


