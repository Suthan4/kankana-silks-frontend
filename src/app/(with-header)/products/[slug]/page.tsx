import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import ProductDetailsClient from "@/components/sections/productDetialClient";
import { getProductBySlug } from "@/lib/seo/server-api";
import { seoPageTitle, seoPageDescription } from "@/lib/seo/metadata";

type Props = {
  params: Promise<{ slug: string }>;
};

/**
 * Legacy URL. Products with a category permanently redirect to the canonical
 * /{category}/{slug} route. Do not emit a canonical for a URL that redirects.
 * Products without a category remain available on this legacy route.
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: "Product Not Found",
      robots: { index: false, follow: true },
    };
  }

  if (product.category?.slug) {
    return {
      title: seoPageTitle(product.metaTitle, `${product.name} Saree`),
      robots: { index: false, follow: true },
    };
  }

  return {
    title: seoPageTitle(product.metaTitle, `${product.name} Saree`),
    description: seoPageDescription(
      product.metaDesc || product.description,
      `Shop ${product.name} at Kankana Silks.`,
    ),
    alternates: { canonical: `/products/${encodeURIComponent(slug)}` },
    robots: { index: true, follow: true },
  };
}

export default async function LegacyProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  if (product.category?.slug) {
    permanentRedirect(
      `/${encodeURIComponent(product.category.slug)}/${encodeURIComponent(slug)}`,
    );
  }

  return <ProductDetailsClient initialProduct={product} />;
}
