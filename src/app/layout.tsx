import type React from "react";
import type { Metadata } from "next";
import "./globals.css";
import AuthModalProvider from "@/components/authModalProvider";
import ClientLayout from "@/components/clientLayout";
import Providers from "@/components/provider/tanstackProvider";
import { Toaster } from "sonner";
import MiniCartDrawer from "@/components/miniCartDrawer";

export const metadata: Metadata = {
  title: {
    default: "Kankana Silks | Premium Silk Sarees Online in Mysore & Bengaluru",
    template: "%s | Kankana Silks",
  },
  description:
    "Shop authentic Kanchipuram, Banarasi, Paithani and handloom silk sarees online at Kankana Silks, Mysore. Discover timeless sarees with delivery across Bengaluru, Chennai, Hyderabad and all India.",
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
    "Indian silk sarees",
    "handwoven sarees",
    "bridal sarees",
    "National Award winning artisan sarees",
  ],
  authors: [{ name: "Kankana Silks" }],
  creator: "Kankana Silks",
  publisher: "Kankana Silks",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://www.kankanasilks.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Kankana Silks | Premium Silk Sarees Online in Mysore & Bengaluru",
    description:
      "Shop authentic Kanchipuram, Banarasi and handloom silk sarees from Mysore. Explore premium sarees online with delivery across Bengaluru, Chennai, Hyderabad and India.",
    url: "https://www.kankanasilks.com",
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
    title: "Kankana Silks - Timeless Heritage | Authentic Silk Sarees",
    description:
      "Shop authentic Kanchipuram, Banarasi and handloom silk sarees online from Mysore, Karnataka. Delivery available across Bengaluru, Chennai, Hyderabad and all India.",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://use.typekit.net/gmp5qfk.css" />
      </head>

      <body className="bg-[#faf7f2] text-neutral-900 antialiased overflow-x-hidden">
        <Providers>
          <ClientLayout>{children}</ClientLayout>
          <MiniCartDrawer />
          <AuthModalProvider />
        </Providers>
        <div id="portal-root" />
        <Toaster position="bottom-center" richColors />
      </body>
    </html>
  );
}
