import { createAuthClient } from "better-auth/client"

// Dynamic base URL that works in both development and production
const getBaseURL = () => {
    if (typeof window !== 'undefined') {
        // Client-side: use current origin
        return window.location.origin
    }
    // Server-side: use environment variable or default
    return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
}

export const authClient = createAuthClient({
    baseURL: getBaseURL()
})

export const signInGoogle = async () => {
    await authClient.signIn.social({
        provider: "google"
    })
}

export const signOut = async () => {
    await authClient.signOut()
}