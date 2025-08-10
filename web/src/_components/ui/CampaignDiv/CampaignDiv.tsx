"use client"
import Link from 'next/link'
import Image from 'next/image'
import { Skeleton } from '../Skeleton'
import styles from './CampaignDiv.module.css'

type Props = {
    href: string
    imageUrl?: string
    alt?: string
    overlayText?: string
}

export default function CampaignDiv({ href, imageUrl, alt = 'Campaign', overlayText = 'See details' }: Props) {
    return (
        <Link href={href} className={styles.card} style={{ cursor: 'pointer' }}>
            {imageUrl ? (
                <Image src={imageUrl} alt={alt} fill className={styles.image} />
            ) : (
                <Skeleton />
            )}
            <div className={styles.overlay}>{overlayText}</div>
        </Link>
    )
}


