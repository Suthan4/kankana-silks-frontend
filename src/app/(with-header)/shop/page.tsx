import { Metadata } from "next";
import ShopClient from "@/components/sections/shopClient";
import axios from "axios";

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
    const response = await axios.get(`${API_BASE_URL}/categories/tree`, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    return response.data.data || [];
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

// Generate metadata for SEO
// Categories are fetched with axios, which Next's data cache can't see. Without
// this the page would be frozen at build time now that the layout is no longer
// force-dynamic. 60s keeps admin edits visible quickly.
export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Shop Silk Sarees Online | Mysore & Bengaluru",
    description:
      "Explore Kanchipuram, Banarasi, Paithani and handloom sarees at Kankana Silks, Mysore. Shop online from Bengaluru, Chennai, Hyderabad and across India.",
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
      title: "Shop Silk Sarees Online | Mysore & Bengaluru",
      description:
        "Shop curated silk and handloom saree collections from Kankana Silks, Mysore, with delivery across India.",
      type: "website",
      url: "https://www.kankanasilks.com/shop",
      siteName: "Kankana Silks",
    },
    twitter: {
      card: "summary_large_image",
      title: "Shop Silk Sarees Online | Mysore & Bengaluru",
      description:
        "Shop silk and handloom sarees online from Kankana Silks, Mysore. We deliver to Bengaluru and across India.",
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
