import { Metadata } from "next";
import ShopClient from "@/components/sections/shopClient";
import { seoPageDescription } from "@/lib/seo/metadata";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: string;
  children?: Category[];
  isActive: boolean;
  order: number;
  _count?: {
    products: number;
  };
}

// Fetch categories (server-side)
async function getCategories(): Promise<Category[]> {
  try {
    if (!API_BASE_URL) {
      throw new Error("NEXT_PUBLIC_API_URL is not configured");
    }

    const response = await fetch(`${API_BASE_URL}/categories/tree`, {
      headers: {
        "Content-Type": "application/json",
      },
      next: {
        revalidate: 60,
        tags: ["category-tree"],
      },
    });

    if (!response.ok) {
      throw new Error(`Category request failed with status ${response.status}`);
    }

    const result = await response.json();
    return result?.data ?? [];
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

// Generate metadata for SEO
// Keep the route ISR interval aligned with its tagged category fetch cache.
export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Shop Silk Sarees Online",
    description: seoPageDescription(
      "Explore Kanchipuram, Banarasi, Paithani and handloom sarees at Kankana Silks, Mysore. Shop online from Bengaluru, Chennai, Hyderabad and across India.",
      "Shop Kanchipuram, Banarasi, Paithani and handloom sarees online at Kankana Silks, Mysore.",
    ),
    keywords: [
      "silk sarees",
      "traditional wear",
      "handloom sarees",
      "silk sarees in Mysore",
      "silk sarees in Bengaluru",
      "online saree shopping India",
      "Kankana Silks",
      "Kanchipuram silk sarees",
      "Banarasi sarees",
      "Paithani sarees",
      "bridal silk sarees",
      "ethnic wear",
      "shop sarees",
    ],
    openGraph: {
      title: "Shop Silk Sarees Online | Kankana Silks",
      description: seoPageDescription(
        "Shop curated silk and handloom saree collections from Kankana Silks, Mysore, with delivery across India.",
        "Shop curated silk and handloom saree collections from Kankana Silks, Mysore.",
      ),
      type: "website",
      url: "https://www.kankanasilks.com/shop",
      siteName: "Kankana Silks",
    },
    twitter: {
      card: "summary_large_image",
      title: "Shop Silk Sarees Online | Kankana Silks",
      description: seoPageDescription(
        "Shop silk and handloom sarees online from Kankana Silks, Mysore. We deliver to Bengaluru and across India.",
        "Shop silk and handloom sarees online from Kankana Silks, Mysore.",
      ),
    },
    alternates: {
      canonical: "/shop",
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

// Main page component
export default async function ShopPage() {
  const categories = await getCategories();

  return <ShopClient categories={categories} />;
}
