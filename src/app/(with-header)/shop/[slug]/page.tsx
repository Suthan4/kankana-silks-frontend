import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CategoryProductsClient from "@/components/categoryProductsClient";
import { getCategoryBySlug, getCategoryProducts } from "@/lib/seo/server-api";
import type { Category } from "@/lib/api/category.api";
import { JsonLd, SITE_URL, breadcrumbJsonLd } from "@/lib/seo/json-ld";

type Props = {
  params: Promise<{ slug: string }>;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// Generate dynamic metadata for SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    return {
      title: "Category Not Found | Kankana Silks",
      description: "The category you're looking for could not be found.",
    };
  }

  const title =
    category.metaTitle ||
    `${category.name} - Premium Silk Sarees | Kankana Silks`;
  const description =
    category.metaDesc ||
    category.description ||
    `Explore ${category.name.toLowerCase()} at Kankana Silks, Mysore. Shop online with delivery to Bengaluru, Chennai, Hyderabad and across India.`;

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
    ].filter(Boolean),
    openGraph: {
      title,
      description,
      images: category.image
        ? [
            {
              url: category.image,
              width: 1200,
              height: 630,
              alt: category.name,
            },
          ]
        : [],
      type: "website",
      url: `https://www.kankanasilks.com/shop/${slug}`,
      siteName: "Kankana Silks",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: category.image ? [category.image] : [],
    },
    alternates: {
      canonical: `/shop/${slug}`,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

// Generate static params for known category routes at build time.
export async function generateStaticParams() {
  try {
    const response = await fetch(`${API_BASE_URL}/categories/tree`, {
      headers: { "Content-Type": "application/json" },
      next: { revalidate: 60 },
    });
    if (!response.ok) {
      throw new Error(`Category tree request failed: ${response.status}`);
    }

    const result = await response.json();
    const categories: Category[] = result.data;

    // Flatten the category tree to get all slugs
    const flattenCategories = (cats: Category[]): string[] => {
      return cats.reduce((acc: string[], cat: Category) => {
        acc.push(cat.slug);
        if (cat.children && cat.children.length > 0) {
          acc.push(...flattenCategories(cat.children));
        }
        return acc;
      }, []);
    };

    const slugs = flattenCategories(categories);

    return slugs.map((slug) => ({
      slug,
    }));
  } catch (error) {
    console.error("Error generating static params:", error);
    return [];
  }
}

// Main page component
export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;

  // Category details and the first product page are independent backend reads.
  // Fetch them concurrently while retaining the shared 60-second server cache.
  const [category, initialProducts] = await Promise.all([
    getCategoryBySlug(slug),
    getCategoryProducts(slug),
  ]);

  if (!category) {
    notFound();
  }

  // The first page remains server-rendered so crawlers see product links in
  // the initial HTML. The client component handles filters and interactions.
  const listed = initialProducts?.data?.products ?? [];

  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Shop", path: "/shop" },
            { name: category.name, path: `/shop/${slug}` },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: category.name,
            url: `${SITE_URL}/shop/${slug}`,
            ...(listed.length
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
      <CategoryProductsClient
        category={category}
        initialProducts={initialProducts ?? undefined}
      />
    </>
  );
}
