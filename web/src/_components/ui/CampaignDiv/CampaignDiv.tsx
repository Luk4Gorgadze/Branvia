"use client"
import Link from 'next/link'
import Image from 'next/image'
import { Skeleton } from '../Skeleton'
import styles from './CampaignDiv.module.css'
import { useUmami } from '@/_lib/_hooks/useUmami'

type Props = {
    href: string
    imageUrl?: string
    alt?: string
    overlayText?: string
}

export default function CampaignDiv({ href, imageUrl, alt = 'Campaign', overlayText = 'See details' }: Props) {
    const { trackButtonClick } = useUmami();

    return (
        <Link
            href={href}
            className={styles.card}
            style={{ cursor: 'pointer' }}
            onClick={() => trackButtonClick('campaign example', 'gallery', {
                campaign_id: href.split('/').pop() || 'unknown',
                overlay_text: overlayText
            })}
        >
            {imageUrl ? (
                <Image src={imageUrl} alt={alt} fill className={styles.image} />
            ) : (
                <Skeleton />
            )}
            <div className={styles.overlay}>{overlayText}</div>
        </Link>
    )
}


