import type { Metadata } from "next";
import { JsonLd, breadcrumbJsonLd, SITE_URL } from "@/lib/seo/json-ld";
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
  const title = "Shop Silk Sarees Online";
  const description = seoPageDescription(
    "Explore Kanchipuram, Banarasi, Paithani, Mysore silk and handloom sarees at Kankana Silks, Mysore. Browse the current collection online with delivery options across India.",
    "Shop traditional silk and handloom sarees online at Kankana Silks, Mysore.",
  );

  return {
    title,
    description,
    keywords: [
      "silk sarees online",
      "Kanchipuram silk sarees",
      "Banarasi sarees",
      "Paithani sarees",
      "Mysore silk sarees",
      "handloom sarees",
      "bridal silk sarees",
      "traditional Indian sarees",
      "saree collections online India",
      "Kankana Silks",
    ],
    alternates: {
      canonical: "/shop",
    },
    openGraph: {
      title: "Shop Silk Sarees Online | Kankana Silks",
      description,
      type: "website",
      url: `${SITE_URL}/shop`,
      siteName: "Kankana Silks",
      locale: "en_IN",
      images: [
        {
          url: "/kankana-silks-logo.png",
          width: 1200,
          height: 630,
          alt: "Kankana Silks silk saree collections",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Shop Silk Sarees Online | Kankana Silks",
      description,
      images: ["/kankana-silks-logo.png"],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

function getCategoryItems(categories: Category[]): Category[] {
  const items: Category[] = [];
  const visited = new Set<string>();

  const visit = (category: Category) => {
    if (category.isActive === false || !category.slug || visited.has(category.slug)) {
      return;
    }

    visited.add(category.slug);
    items.push(category);
    category.children?.forEach(visit);
  };

  categories.forEach(visit);
  return items;
}

// Main page component
export default async function ShopPage() {
  const categories = await getCategories();
  const categoryItems = getCategoryItems(categories);

  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Shop", path: "/shop" },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: "Shop Silk Sarees Online",
            description:
              "Browse Kankana Silks' current silk, traditional and handloom saree collections.",
            url: `${SITE_URL}/shop`,
            isPartOf: {
              "@type": "WebSite",
              name: "Kankana Silks",
              url: SITE_URL,
            },
            mainEntity: {
              "@type": "ItemList",
              itemListOrder: "https://schema.org/ItemListUnordered",
              numberOfItems: categoryItems.length,
              itemListElement: categoryItems.map((category, index) => ({
                "@type": "ListItem",
                position: index + 1,
                name: category.name,
                url: `${SITE_URL}/shop/${encodeURIComponent(category.slug)}`,
              })),
            },
          },
        ]}
      />
      <ShopClient categories={categories} />
    </>
  );
}
