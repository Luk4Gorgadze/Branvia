"use client"
import { useEffect, useMemo, useState } from 'react'
import styles from './page.module.css'
import { useUser } from '@/_lib/_providers'
import { Skeleton } from '@/_components/ui/Skeleton'
import { CampaignDiv } from '@/_components/ui/CampaignDiv'

type Campaign = {
    id: string
    productTitle: string
    outputFormat: string
    generatedImages: string[]
    createdAt: string
}

const PAGE_SIZE = 16

const getS3Url = (s3Key: string) => {
    const bucketName = process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME
    const region = process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1'
    if (!bucketName || !s3Key) return ''
    return `https://${bucketName}.s3.${region}.amazonaws.com/${s3Key}`
}

export default function GalleryPage() {
    const { user } = useUser()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [campaigns, setCampaigns] = useState<Campaign[]>([])
    const [page, setPage] = useState(1)

    useEffect(() => {
        async function load() {
            try {
                setLoading(true)
                const res = await fetch('/api/campaigns')
                if (!res.ok) throw new Error('Failed to load campaigns')
                const data = await res.json()
                setCampaigns((data?.campaigns || []) as Campaign[])
            } catch (e) {
                setError(e instanceof Error ? e.message : 'Failed to load')
            } finally {
                setLoading(false)
            }
        }
        if (user) load()
    }, [user])

    const totalPages = Math.max(1, Math.ceil(campaigns.length / PAGE_SIZE))

    function getPagination(current: number, total: number): (number | '…')[] {
        const pages: (number | '…')[] = []
        const clamp = (n: number) => Math.max(1, Math.min(total, n))
        const add = (p: number) => { if (!pages.includes(p)) pages.push(p) }
        add(1)
        add(clamp(current - 1))
        add(clamp(current))
        add(clamp(current + 1))
        add(total)
        // sort and insert ellipsis
        const uniqueSorted = Array.from(new Set(pages.filter(p => typeof p === 'number'))).sort((a, b) => (a as number) - (b as number)) as number[]
        const result: (number | '…')[] = []
        for (let i = 0; i < uniqueSorted.length; i++) {
            const p = uniqueSorted[i]
            if (i === 0) result.push(p)
            else {
                const prev = uniqueSorted[i - 1]
                if (p - prev === 1) result.push(p)
                else { result.push('…', p) }
            }
        }
        return result
    }
    const pageItems = useMemo(() => {
        const start = (page - 1) * PAGE_SIZE
        return campaigns.slice(start, start + PAGE_SIZE)
    }, [campaigns, page])

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
                        <div key={i} className={styles.card}>
                            <div className={styles.image} style={{ aspectRatio: 1 }}>
                                <Skeleton />
                            </div>
                            <Skeleton style={{ height: 18 }} />
                        </div>
                    ))
                    : pageItems.map((c) => {
                        const firstKey = c.generatedImages?.[0]
                        const url = firstKey ? getS3Url(firstKey) : undefined
                        return (
                            <CampaignDiv key={c.id} href={`/campaign/${c.id}`} imageUrl={url} overlayText="See details" />
                        )
                    })}
            </div>

            {totalPages > 1 && (
                <div className={styles.pagination}>
                    <button className={styles.pageBtn} disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}>
                        Prev
                    </button>
                    {getPagination(page, totalPages).map((p, i) =>
                        p === '…' ? (
                            <span key={`e-${i}`} className={styles.ellipsis}>…</span>
                        ) : (
                            <button
                                key={p}
                                className={`${styles.pageBtn} ${page === p ? styles.active : ''}`}
                                onClick={() => setPage(p)}
                            >
                                {p}
                            </button>
                        )
                    )}
                    <button className={styles.pageBtn} disabled={page === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>
                        Next
                    </button>
                </div>
            )}
        </div>
    )
}


