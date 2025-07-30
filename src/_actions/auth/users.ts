"use server"
import { auth } from "@/_lib/_auth/auth"
import { authClient } from "@/_lib/_auth/authClient"

export const signIn = async (email: string, password: string) => {
    await auth.api.signInEmail({
        body: {
            email: email,
            password: password
        }
    })
}

export const signUp = async (email: string, password: string, name: string) => {
    await auth.api.signUpEmail({
        body: {
            email: email,
            password: password,
            name: name
        }
    })
}
