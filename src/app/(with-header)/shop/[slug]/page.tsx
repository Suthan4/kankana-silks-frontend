import type { Metadata } from "next";
import { notFound } from "next/navigation";

import CategoryProductsClient from "@/components/categoryProductsClient";

import { getCategoryBySlug, getCategoryProducts } from "@/lib/seo/server-api";

import type { Category } from "@/lib/api/category.api";

import { JsonLd, SITE_URL, breadcrumbJsonLd } from "@/lib/seo/json-ld";

import {
  seoPageTitle,
  brandedSeoTitle,
  seoPageDescription,
} from "@/lib/seo/metadata";

type Props = {
  params: Promise<{ slug: string }>;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * SEO metadata is intentionally kept in the document <head>.
 * It does not render a category title or description in the shopping UI.
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  const category = await getCategoryBySlug(slug);

  if (!category) {
    return {
      title: "Category Not Found",
      description: "The requested collection could not be found.",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const title = seoPageTitle(category.metaTitle, `${category.name} Sarees`);

  const description = seoPageDescription(
    category.metaDesc || category.description,
    `Explore ${category.name.toLowerCase()} at Kankana Silks, Mysore. Shop online with delivery across India.`,
  );

  const canonical = `${SITE_URL}/shop/${encodeURIComponent(slug)}`;

  return {
    title,
    description,

    keywords: [
      category.name,
      "silk saree",
      "handloom saree",
      "traditional saree",
      "Kankana Silks",
      "pure silk",
      "handcrafted saree",
    ],

    alternates: {
      canonical,
    },

    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
      },
    },

    openGraph: {
      title: brandedSeoTitle(title),
      description,
      type: "website",
      url: canonical,
      siteName: "Kankana Silks",
      images: category.image
        ? [
            {
              url: category.image,
              width: 1200,
              height: 630,
              alt: `${category.name} collection at Kankana Silks`,
            },
          ]
        : [],
    },

    twitter: {
      card: "summary_large_image",
      title: brandedSeoTitle(title),
      description,
      images: category.image ? [category.image] : [],
    },
  };
}

/**
 * Generate known category routes at build time.
 */
export async function generateStaticParams() {
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
      },
    });

    if (!response.ok) {
      throw new Error(`Category tree request failed: ${response.status}`);
    }

    const result = await response.json();

    const categories: Category[] = result.data ?? [];

    const flattenCategories = (items: Category[]): string[] => {
      return items.reduce((slugs: string[], category: Category) => {
        slugs.push(category.slug);

        if (category.children?.length) {
          slugs.push(...flattenCategories(category.children));
        }

        return slugs;
      }, []);
    };

    return flattenCategories(categories).map((slug) => ({
      slug,
    }));
  } catch (error) {
    console.error("Error generating category static params:", error);

    return [];
  }
}

/**
 * Category shopping page.
 *
 * Products are the primary visible content.
 * SEO metadata stays in <head>.
 */
export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;

  const [category, initialProducts] = await Promise.all([
    getCategoryBySlug(slug),
    getCategoryProducts(slug),
  ]);

  if (!category) {
    notFound();
  }

  const listed = initialProducts?.data?.products ?? [];

  // Accessible page heading; not displayed visually.
  const categoryDisplayName = category.name
    .trim()
    .toLowerCase()
    .replace(/\b[a-z]/g, (letter) => letter.toUpperCase());

  return (
    <>
      {/* Structured data for search engines */}
      <JsonLd
        data={[
          breadcrumbJsonLd([
            {
              name: "Home",
              path: "/",
            },
            {
              name: "Shop",
              path: "/shop",
            },
            {
              name: category.name,
              path: `/shop/${slug}`,
            },
          ]),

          {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: category.name,
            url: `${SITE_URL}/shop/${slug}`,

            ...(listed.length > 0
              ? {
                  mainEntity: {
                    "@type": "ItemList",
                    itemListElement: listed.map((product, index) => ({
                      "@type": "ListItem",
                      position: index + 1,

                      url: `${SITE_URL}/${encodeURIComponent(
                        product.category?.slug ?? slug,
                      )}/${encodeURIComponent(product.slug)}`,

                      name: product.name,
                    })),
                  },
                }
              : {}),
          },
        ]}
      />

      {/*
        Accessible heading for screen-reader users.
        Visual shoppers go directly to the category shopping interface.
      */}
      <h1 className="sr-only">{categoryDisplayName} Collection</h1>

      {/*
        Product listing is the first visible page content.
        Keep the server-rendered initial product data.
      */}
      <CategoryProductsClient
        category={category}
        initialProducts={initialProducts ?? undefined}
      />
    </>
  );
}
