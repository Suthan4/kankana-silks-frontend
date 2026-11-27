import { Suspense } from "react";
import type React from "react";
import type { Metadata } from "next";
import { GoogleAnalytics } from "@next/third-parties/google";

// @ts-ignore Next.js processes this stylesheet import during the build.
import "./globals.css";

import AuthModalProvider from "@/components/authModalProvider";
import ClientLayout from "@/components/clientLayout";
import Providers from "@/components/provider/tanstackProvider";
import { Toaster } from "sonner";
import MiniCartDrawer from "@/components/miniCartDrawerProvider";
import { SkipLink } from "@/components/ui/SkipLink";
import { NavigationProgress } from "@/components/ui/NavigationProgress";
import DeferredBrandFonts from "@/components/DeferredBrandFonts";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});


// --------------------------------------------------
// Site Configuration
// --------------------------------------------------

const SITE_URL = "https://www.kankanasilks.com";
const SITE_LOGO = SITE_URL + "/kankana-silks-logo.png";

// Google Analytics Configuration
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim();

const isValidGAId = /^G-[A-Z0-9]+$/i.test(GA_MEASUREMENT_ID ?? "");

// --------------------------------------------------
// SEO Metadata
// --------------------------------------------------

export const metadata: Metadata = {
  title: {
    default: "Kankana Silks | Silk Sarees in Mysore & Bengaluru",
    template: "%s | Kankana Silks",
  },
  description:
    "Shop Kanchipuram, Banarasi, Paithani and handloom sarees online at Kankana Silks, Mysore, with delivery across India.",
  keywords: [
    "Kankana Silks",
    "silk sarees",
    "Kanchipuram silk sarees",
    "Banarasi sarees",
    "handloom sarees",
    "Paithani sarees",
    "Mysore silk sarees",
    "pure silk sarees",
    "wedding sarees",
    "traditional sarees",
    "authentic silk sarees Mysuru",
    "silk sarees in Mysore",
    "Mysore saree shop",
    "silk saree shop Mysore",
    "silk sarees in Bengaluru",
    "silk sarees in Bangalore",
    "online silk saree store Karnataka",
    "silk sarees Chennai",
    "silk sarees Hyderabad",
    "silk saree delivery across India",
    "Indian silk sarees",
    "handwoven sarees",
    "bridal sarees",
  ],
  authors: [{ name: "Kankana Silks" }],
  creator: "Kankana Silks",
  publisher: "Kankana Silks",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Kankana Silks | Premium Silk Sarees Online in Mysore & Bengaluru",
    description:
      "Explore Kanchipuram, Banarasi, Paithani and handloom sarees from Kankana Silks, Mysore, with delivery across India.",
    url: SITE_URL,
    siteName: "Kankana Silks",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "/kankana-silks-logo.png",
        width: 1200,
        height: 630,
        alt: "Kankana Silks - Authentic Indian Silk Sarees",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Premium Silk Sarees in Mysore & Bengaluru | Kankana Silks",
    description:
      "Shop Kanchipuram, Banarasi, Paithani and handloom sarees online from Kankana Silks, Mysore.",
    images: ["/kankana-silks-logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      {
        url: "/kankana-silks-logo.png?v=2",
        type: "image/png",
        sizes: "32x32",
      },
      {
        url: "/kankana-silks-logo.png?v=2",
        type: "image/png",
        sizes: "16x16",
      },
    ],
    apple: [
      {
        url: "/kankana-silks-logo.png?v=2",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
  verification: {
    google: "LOBCN_AXXBSJCm0vx8QIIls3kO3IITZGFat5IXAQb1g",
  },
};

// --------------------------------------------------
// Structured Data
// --------------------------------------------------

const storeStructuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": SITE_URL + "/#organization",
      name: "Kankana Silks",
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: SITE_LOGO,
      },
    },
    {
      "@type": "ClothingStore",
      "@id": SITE_URL + "/#store",
      name: "Kankana Silks",
      url: SITE_URL,
      image: SITE_LOGO,
      description:
        "A Mysuru (Mysore)-based silk saree store offering Kanchipuram, Banarasi, Paithani and handloom sarees with online delivery across India.",
      email: "support@kankanasilks.com",
      ...(process.env.NEXT_PUBLIC_STORE_PHONE
        ? { telephone: process.env.NEXT_PUBLIC_STORE_PHONE }
        : {}),
      address: {
        "@type": "PostalAddress",
        streetAddress:
          "464, First Floor, Jayachamarajendra Road, 1st Stage, Vijayanagar",
        addressLocality: "Mysuru",
        addressRegion: "Karnataka",
        postalCode: "570017",
        addressCountry: "IN",
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: 12.3292222,
        longitude: 76.6154278,
      },
      sameAs: [
        "https://instagram.com/kankanasilks",
        "https://youtube.com/@kankanasilks",
      ],
      areaServed: [
        { "@type": "City", name: "Mysuru" },
        { "@type": "City", name: "Bengaluru" },
        { "@type": "City", name: "Chennai" },
        { "@type": "City", name: "Hyderabad" },
        { "@type": "Country", name: "India" },
      ],
      parentOrganization: {
        "@id": SITE_URL + "/#organization",
      },
    },
    {
      "@type": "WebSite",
      "@id": SITE_URL + "/#website",
      url: SITE_URL,
      name: "Kankana Silks",
      publisher: {
        "@id": SITE_URL + "/#organization",
      },
      inLanguage: "en-IN",
    },
  ],
};

// --------------------------------------------------
// Root Layout
// --------------------------------------------------

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-IN" className={cn("font-sans", geist.variable)}>
      <head>
        <link rel="ard" href="/.well-known/ard.json" type="application/json" />
        <link rel="preconnect" href="https://use.typekit.net" crossOrigin="" />
        <link
          rel="preload"
          as="style"
          href="https://use.typekit.net/gmp5qfk.css"
          data-deferred-brand-font="kankana-adobe-fonts"
        />
        <link
          rel="preload"
          as="style"
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600&family=Jost:wght@400;500;600&display=swap"
          data-deferred-brand-font="kankana-editorial-fonts"
        />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(storeStructuredData).replace(
              /</g,
              "\\u003c",
            ),
          }}
        />
      </head>

      <body className="bg-[#faf7f2] text-neutral-900 antialiased overflow-x-clip">
        <DeferredBrandFonts />
        <SkipLink />

        {/* Navigation Progress */}
        <Suspense fallback={null}>
          <NavigationProgress />
        </Suspense>

        <Providers>
          <ClientLayout>{children}</ClientLayout>

          <MiniCartDrawer />
          <AuthModalProvider />
        </Providers>

        <div id="portal-root" />

        <Toaster position="bottom-center" richColors />

        {/* Google Analytics 4 */}
        {isValidGAId && GA_MEASUREMENT_ID && (
          <GoogleAnalytics gaId={GA_MEASUREMENT_ID} />
        )}
      </body>
    </html>
  );
}
