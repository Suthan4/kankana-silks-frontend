import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import ProductDetailsClient from "@/components/sections/productDetialClient";
import { getProductBySlug } from "@/lib/seo/server-api";

type Props = {
  params: Promise<{ slug: string }>;
};

/**
 * Legacy URL. The canonical product URL is /{category}/{slug}; this route
 * permanently redirects there so the same product is never served twice.
 * Products without a category keep rendering here as a fallback.
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: "Product Not Found | Kankana Silks",
      robots: { index: false, follow: false },
    };
  }

  return {
    title: product.metaTitle || `${product.name} | Kankana Silks`,
    description:
      product.metaDesc ||
      product.description?.replace(/\s+/g, " ").trim().slice(0, 160) ||
      `Shop ${product.name} at Kankana Silks.`,
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
