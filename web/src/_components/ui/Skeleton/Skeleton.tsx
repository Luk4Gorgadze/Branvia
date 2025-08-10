"use client"
import React from 'react'
import styles from './Skeleton.module.css'

type Props = {
    className?: string
    shimmer?: boolean
    style?: React.CSSProperties
}

export function Skeleton({ className = '', shimmer = true, style }: Props) {
    return (
        <div className={`${styles.skeleton} ${shimmer ? styles.shimmer : ''} ${className}`} style={style} />
    )
}

type TextProps = {
    lines?: number
    className?: string
    style?: React.CSSProperties
}

export function SkeletonText({ lines = 3, className = '', style }: TextProps) {
    return (
        <div className={className} style={style}>
            {Array.from({ length: lines }).map((_, i) => (
                <div key={i} className={styles.skeletonLine} />
            ))}
        </div>
    )
}


