import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "../_db/prismaClient";
import { nextCookies } from "better-auth/next-js";
import { headers } from "next/headers";

// Get the base URL for the current environment
const getBaseURL = () => {
    return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
}

const getTrustedOrigins = (): string[] => {
    const configured = process.env.TRUSTED_ORIGINS;
    if (configured && configured.trim().length > 0) {
        return configured.split(',').map((o) => o.trim()).filter(Boolean);
    }
    return [getBaseURL()];
};

export const auth = betterAuth({
    baseURL: getBaseURL(),
    trustedOrigins: getTrustedOrigins(),
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    emailAndPassword: {
        enabled: true,
    },
    socialProviders: {
        google: {
            enabled: true,
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            redirect: true,
        },
    },
    plugins: [nextCookies()],
});

// Function to get authenticated user from server-side session
export async function getServerUser() {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        return session?.user || null;
    } catch (error) {
        console.error('Failed to get server user:', error);
        return null;
    }
}