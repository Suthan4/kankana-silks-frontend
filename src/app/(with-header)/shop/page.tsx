import { Metadata } from "next";
import ShopClient from "@/components/sections/shopClient";
import axios from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL

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
      "women's wear",
      "men's wear",
      "bridal's wear",
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
