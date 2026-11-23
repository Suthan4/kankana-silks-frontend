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
        className="mx-auto max-w-[1450px] bg-white px-4 pb-7 pt-7 md:px-8 xl:px-10"
      >
        <nav aria-label="Breadcrumb" className="mb-3 text-xs text-neutral-500">
          <a href="/" className="hover:text-neutral-900">Home</a>
          <span className="mx-2" aria-hidden="true">/</span>
          <a href="/shop" className="hover:text-neutral-900">Shop</a>
          <span className="mx-2" aria-hidden="true">/</span>
          <span aria-current="page">{category.name}</span>
        </nav>
        <h1 id="category-page-heading" className="text-2xl font-semibold tracking-tight text-neutral-950 sm:text-3xl">
          {category.name} Collection
        </h1>
        <h2 className="mt-3 text-base font-semibold text-neutral-900">
          Explore {category.name} sarees online
        </h2>
        {category.description?.trim() ? (
          <p className="mt-2 max-w-4xl text-sm leading-6 text-neutral-600">{category.description}</p>
        ) : null}
        <p className="mt-2 max-w-4xl text-sm leading-6 text-neutral-600">
          Browse the products currently listed in this collection. Each product page provides its own photographs, description, displayed price and current availability, so review those details before adding an item to your cart.
        </p>
        <p className="mt-2 max-w-4xl text-sm leading-6 text-neutral-600">
          Use the filters and sorting controls to narrow the collection. Delivery availability, courier options and charges are confirmed after you enter your delivery pincode during checkout.
        </p>
        <h2 className="mt-5 text-base font-semibold text-neutral-900">
          Product information and availability
        </h2>
        <p className="mt-2 max-w-4xl text-sm leading-6 text-neutral-600">
          When comparing styles, review each product's photographs, description
          and displayed price. Material, colour, design, care and any weave
          information are specific to the individual listing. Product
          availability can change, so use the live product page as the source
          for current details before ordering.
        </p>
        <p className="mt-2 max-w-4xl text-sm leading-6 text-neutral-600">
          For help choosing a product or understanding its listed details,
          contact Kankana Silks before checkout. Once you have selected your
          items, enter your delivery pincode to check available service options
          and charges for your address.
        </p>
      </section>
      <CategoryProductsClient
        category={category}
        initialProducts={initialProducts ?? undefined}
      />
    </>
  );
}
