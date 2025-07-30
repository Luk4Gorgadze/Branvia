import { createAuthClient } from "better-auth/client"
export const authClient = createAuthClient({
    baseURL: "http://localhost:3000"
})

export const signInGoogle = async () => {
    await authClient.signIn.social({
        provider: "google"
    })
}

export const signOut = async () => {
    await authClient.signOut()
}