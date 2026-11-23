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
  const categoryDisplayName =
    category.name.trim() === category.name.trim().toUpperCase()
      ? category.name
          .trim()
          .toLowerCase()
          .replace(/(^|[\\s-])([a-z])/g, (_match, separator: string, letter: string) => separator + letter.toUpperCase())
      : category.name.trim();

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
        className="relative isolate overflow-hidden border-b border-[#eadde0] bg-gradient-to-r from-[#fbf6f0] via-white to-[#f8eff2] px-4 py-4 sm:py-5 md:px-8 xl:px-10"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-[#d9b8c2]/20 blur-3xl"
        />
        <div className="relative mx-auto max-w-[1450px]">
          <nav aria-label="Breadcrumb" className="mb-3 flex flex-wrap items-center gap-2 text-[11px] text-neutral-500">
            <a href="/" className="transition-colors hover:text-[#75495a]">Home</a>
            <span aria-hidden="true">/</span>
            <a href="/shop" className="transition-colors hover:text-[#75495a]">Shop</a>
            <span aria-hidden="true">/</span>
            <span aria-current="page" className="font-medium text-[#75495a]">{categoryDisplayName}</span>
          </nav>
          <div className="flex items-center gap-2">
            <span className="h-px w-6 bg-[#b58b69]" />
            <p className="text-[9px] font-semibold uppercase tracking-[0.24em] text-[#966e58] sm:text-[10px]">
              Kankana Silks · Curated collection
            </p>
          </div>
          <h1
            id="category-page-heading"
            className="mt-1.5 text-xl font-semibold tracking-tight text-[#593847] sm:text-2xl md:text-3xl"
          >
            {categoryDisplayName} Collection
          </h1>
          <p className="mt-1.5 max-w-4xl line-clamp-2 text-xs leading-5 text-[#75656a] sm:text-sm sm:leading-6">
            {category.description?.trim() ||
              `Browse the current ${categoryDisplayName.toLowerCase()} collection at Kankana Silks. Review individual product details and availability before ordering.`}
          </p>
          <div className="mt-3 h-[2px] w-14 rounded-full bg-gradient-to-r from-[#875467] to-[#c6a07c]" />
        </div>
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
            About the {categoryDisplayName.toLowerCase()} collection
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
