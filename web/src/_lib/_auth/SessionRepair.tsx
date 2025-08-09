"use client"
import { useEffect } from 'react'
import { signOut } from './authClient'

interface SessionRepairProps {
    shouldSignOut: boolean
}

export default function SessionRepair({ shouldSignOut }: SessionRepairProps) {
    useEffect(() => {
        if (shouldSignOut) {
            // Fire and forget; we don't block render
            signOut().catch(() => { })
        }
    }, [shouldSignOut])

    return null
}


