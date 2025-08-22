import type { Metadata } from "next";
import "@/app/globals.css";
import Navbar from "@/_components/ui/Navbar";
import FooterSection from "@/_components/main/FooterSection";
import { UserProvider } from "@/_lib/_providers";
import { auth } from "@/_lib/_auth/auth";
import { headers } from "next/headers";
import SessionRepair from "@/_lib/_auth/SessionRepair";

export const metadata: Metadata = {
  title: {
    default: "Branvia",
    template: "%s | Branvia",
  },
  description: "Branvia",
  icons: {
    icon: "/BLogo.ico",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let user: { id: string; name?: string; email?: string; emailVerified?: boolean; createdAt?: Date; updatedAt?: Date; image?: string | null } | undefined = undefined;
  let sessionErrored = false;
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    user = session?.user ?? undefined;
  } catch (error) {
    console.error("Failed to resolve session, continuing as logged out.", error);
    sessionErrored = true;
  }

  const isProd = process.env.NEXT_PUBLIC_APP_URL === "https://branvia.art";

  return (
    <html lang="en">
      <head>
        {isProd && (
          <script
            defer
            src="https://umami.branvia.art/script.js"
            data-website-id="cb758827-defa-4983-b16e-c6baf616b5a4"
          />
        )}
      </head>
      <body>
        {/* If session lookup failed, trigger a client-side signOut to clear bad cookies */}
        <SessionRepair shouldSignOut={sessionErrored} />
        <UserProvider initialUser={user}>
          <Navbar />
          {children}
          <FooterSection />
        </UserProvider>
      </body>
    </html>
  );
}
