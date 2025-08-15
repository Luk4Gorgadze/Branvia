"use server"

import { auth } from "@/_lib/_auth/auth"
import { SignInSchema, SignUpSchema } from "@/_lib/_schemas/auth"
import { z } from "zod"

export async function signIn(data: z.infer<typeof SignInSchema>) {
    try {
        await auth.api.signInEmail({
            body: {
                email: data.email,
                password: data.password
            }
        })
        return { success: true }
    } catch (error) {
        throw new Error("Invalid email or password")
    }
}

export async function signUp(data: z.infer<typeof SignUpSchema>) {
    try {
        await auth.api.signUpEmail({
            body: {
                email: data.email,
                password: data.password,
                name: data.name
            }
        })
        return { success: true }
    } catch (error) {
        throw new Error("Failed to create account. Please try again.")
    }
}
