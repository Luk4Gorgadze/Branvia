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
    default: "Branvia - AI-Powered Product Image Generation for Small Brands",
    template: "%s | Branvia - AI Product Image Generation"
  },
  description: "Transform your product photos with AI-powered image generation. Create stunning, professional product images for your small brand or business. Upload a photo, get multiple style variations instantly.",
  keywords: [
    "AI image generation",
    "product photography",
    "AI product images",
    "small business marketing",
    "brand photography",
    "AI photo editing",
    "product image enhancement",
    "e-commerce photography",
    "AI marketing tools",
    "brand visual identity",
    "product visualization",
    "AI design tools",
    "marketing automation",
    "visual content creation",
    "AI business solutions"
  ],
  authors: [{ name: "Branvia Team" }],
  creator: "Branvia",
  publisher: "Branvia",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://branvia.art'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://branvia.art',
    siteName: 'Branvia',
    title: 'Branvia - AI-Powered Product Image Generation for Small Brands',
    description: 'Transform your product photos with AI-powered image generation. Create stunning, professional product images for your small brand or business.',
    images: [
      {
        url: '/opengraph-image.png',
        width: 1200,
        height: 600,
        alt: 'Branvia - AI Product Image Generation Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Branvia - AI-Powered Product Image Generation',
    description: 'Transform your product photos with AI. Create stunning, professional product images for your small brand instantly.',
    images: ['/opengraph-image.png'],
    creator: '@branvia_art',
    site: '@branvia_art',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'xiBQE9tq85RFA01fZiuPZpp6C_k8uQkgGFvu3ySEnuk',
  },
  category: 'technology',
  classification: 'AI Image Generation Platform',
  other: {
    'application-name': 'Branvia',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'apple-mobile-web-app-title': 'Branvia',
    'format-detection': 'telephone=no',
    'mobile-web-app-capable': 'yes',
    'msapplication-config': '/browserconfig.xml',
    'msapplication-TileColor': '#000000',
    'msapplication-tap-highlight': 'no',
    'theme-color': '#000000',
    'color-scheme': 'dark',
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
        {/* Structured Data for Rich Snippets */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "Branvia",
              "description": "AI-powered product image generation platform for small brands and businesses",
              "url": "https://branvia.art",
              "applicationCategory": "DesignApplication",
              "operatingSystem": "Web Browser",
              "offers": {
                "@type": "Offer",
                "price": "29",
                "priceCurrency": "USD",
                "description": "AI image generation starting from $29/month with premium plans available"
              },
              "creator": {
                "@type": "Organization",
                "name": "Branvia",
                "url": "https://branvia.art"
              },
              "featureList": [
                "AI-powered image generation",
                "Product photo enhancement",
                "Multiple style variations",
                "Professional quality output",
                "Small business focused"
              ]
            })
          }}
        />

        {/* Additional SEO Meta Tags */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="theme-color" content="#000000" />
        <meta name="msapplication-TileColor" content="#000000" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="color-scheme" content="dark" />

        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

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
