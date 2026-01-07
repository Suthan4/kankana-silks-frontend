import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/header";
import AuthModalProvider from "@/components/authModalProvider";
import ClientLayout from "@/components/clientLayout";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Kankana Silks - Timeless Heritage | Authentic Silk Sarees",
    template: "%s | Kankana Silks",
  },
  description:
    "Kankana Silks celebrates India's timeless textile heritage with authentic Kanchipuram, Banarasi, Paithani, and handloom silk sarees. Founded by Shobha and Soumya in Mysuru, we curate premium silk sarees for weddings, festivities, and cherished moments.",
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
  metadataBase: new URL("https://kankanasilks.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Kankana Silks - Timeless Heritage | Authentic Silk Sarees",
    description:
      "Discover authentic Kanchipuram, Banarasi, and handloom silk sarees at Kankana Silks, Mysuru. Each saree tells a story of heritage, craftsmanship, and timeless beauty.",
    url: "https://kankanasilks.com",
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
      "Celebrating India's timeless textile heritage with authentic handloom and silk sarees from Kanchipuram, Banaras, and beyond.",
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
  // verification: {
  //   google: "your-google-verification-code",
  //   // yandex: "your-yandex-verification-code",
  //   // bing: "your-bing-verification-code",
  // },
  // },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} "bg-[#faf7f2] text-neutral-900 antialiased overflow-x-hidden`}
      >
        <ClientLayout>{children}</ClientLayout>
        <AuthModalProvider />
        <div id="portal-root" />
      </body>
    </html>
  );
}
