"use server"

import { auth } from "@/_lib/_auth/auth"
import { createPublicServerAction } from "@/_lib/_utils/createServerAction"
import { SignInSchema, SignUpSchema } from "@/_lib/_schemas/auth"

export const signIn = createPublicServerAction(
    SignInSchema,
    async (data) => {
        await auth.api.signInEmail({
            body: {
                email: data.email,
                password: data.password
            }
        })
        return { success: true }
    },
    { maxRequests: 5, windowMs: 60 * 1000 } // 5 sign-in attempts per minute
)

export const signUp = createPublicServerAction(
    SignUpSchema,
    async (data) => {
        await auth.api.signUpEmail({
            body: {
                email: data.email,
                password: data.password,
                name: data.name
            }
        })
        return { success: true }
    },
    { maxRequests: 3, windowMs: 60 * 1000 } // 3 sign-up attempts per minute
)
