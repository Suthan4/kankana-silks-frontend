import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CategoryProductsClient from "@/components/categoryProductsClient";
import { getCategoryBySlug, getCategoryProducts } from "@/lib/seo/server-api";
import type { Category } from "@/lib/api/category.api";
import { JsonLd, SITE_URL, breadcrumbJsonLd } from "@/lib/seo/json-ld";
import { seoPageTitle, brandedSeoTitle, seoPageDescription } from "@/lib/seo/metadata";

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
      title: "Category Not Found",
      description: "The category you're looking for could not be found.",
    };
  }

  const title = seoPageTitle(category.metaTitle, `${category.name} Sarees`);
  const description = seoPageDescription(
    category.metaDesc || category.description,
    `Explore ${category.name.toLowerCase()} at Kankana Silks, Mysore. Shop online with delivery to Bengaluru, Chennai, Hyderabad and across India.`,
  );

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
      title: brandedSeoTitle(title),
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
      title: brandedSeoTitle(title),
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
      <section
        aria-labelledby="category-page-heading"
        className="mx-auto max-w-[1450px] bg-white px-4 pb-3 pt-4 md:px-8 md:pb-4 md:pt-5 xl:px-10"
      >
        <nav aria-label="Breadcrumb" className="mb-2 text-[11px] text-neutral-500">
          <a href="/" className="hover:text-neutral-900">Home</a>
          <span className="mx-2" aria-hidden="true">/</span>
          <a href="/shop" className="hover:text-neutral-900">Shop</a>
          <span className="mx-2" aria-hidden="true">/</span>
          <span aria-current="page">{category.name}</span>
        </nav>
        <h1
          id="category-page-heading"
          className="text-xl font-semibold tracking-tight text-neutral-950 sm:text-2xl"
        >
          {category.name.trim().replace(/\b[a-z]/g, (letter) => letter.toUpperCase())} Collection
        </h1>
        <p className="mt-1 max-w-4xl line-clamp-2 text-xs leading-5 text-neutral-600 sm:text-sm sm:leading-6">
          {category.description?.trim() ||
            `Browse the current ${category.name.toLowerCase()} collection at Kankana Silks. Review individual product details and availability before ordering.`}
        </p>
      </section>
      <CategoryProductsClient
        category={category}
        initialProducts={initialProducts ?? undefined}
      />
      <section
        aria-labelledby="category-seo-heading"
        className="border-t border-neutral-100 bg-[#faf7f2] px-4 py-9 md:px-8 md:py-12 xl:px-10"
      >
        <div className="mx-auto max-w-[1200px]">
          <h2
            id="category-seo-heading"
            className="text-xl font-semibold tracking-tight text-neutral-950 sm:text-2xl"
          >
            About the {category.name.toLowerCase()} collection
          </h2>
          <p className="mt-3 max-w-4xl text-sm leading-7 text-neutral-700">
            Browse the products currently listed in this collection. Each
            product page provides its own photographs, description, displayed
            price and current availability, so review those details before
            adding an item to your cart.
          </p>
          <h3 className="mt-6 text-base font-semibold text-neutral-900">
            Product information and availability
          </h3>
          <p className="mt-2 max-w-4xl text-sm leading-7 text-neutral-700">
            When comparing styles, review each product's photographs,
            description and displayed price. Material, colour, design, care and
            weave information are specific to the individual listing. Product
            availability can change, so use the live product page as the source
            for current details before ordering.
          </p>
          <h3 className="mt-6 text-base font-semibold text-neutral-900">
            Delivery and assistance
          </h3>
          <p className="mt-2 max-w-4xl text-sm leading-7 text-neutral-700">
            Delivery serviceability, courier options and applicable charges are
            confirmed after you enter your delivery pincode during checkout.
            For help choosing a product or understanding its listed details,
            contact Kankana Silks before placing your order.
          </p>
        </div>
      </section>

    </>
  );
}
