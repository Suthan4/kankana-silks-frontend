import { Metadata } from "next";
import ShopClient from "@/components/sections/shopClient";
import axios from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

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
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Shop All Categories - Kankana Silks",
    description:
      "Browse our complete collection of premium silk sarees, traditional wear, and handcrafted textiles. Explore categories including women's wear, men's wear, and exclusive collections.",
    keywords: [
      "silk sarees",
      "traditional wear",
      "handloom sarees",
      "Kankana Silks",
      "women's wear",
      "men's wear",
      "ethnic wear",
      "shop sarees",
    ],
    openGraph: {
      title: "Shop All Categories - Kankana Silks",
      description:
        "Browse our complete collection of premium silk sarees and traditional wear.",
      type: "website",
      url: "https://kankanasilks.com/shop",
      siteName: "Kankana Silks",
    },
    twitter: {
      card: "summary_large_image",
      title: "Shop All Categories - Kankana Silks",
      description:
        "Browse our complete collection of premium silk sarees and traditional wear.",
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
