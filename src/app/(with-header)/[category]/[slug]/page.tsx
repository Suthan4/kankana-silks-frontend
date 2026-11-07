import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductDetailsClient from "@/components/sections/productDetialClient";

type Props = {
  params: Promise<{ category: string; slug: string }>;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

async function getProductBySlug(slug: string) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/products/slug/${encodeURIComponent(slug)}`,
      {
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
      },
    );

    if (!response.ok) return null;

    const result = await response.json();
    return result.data ?? null;
  } catch (error) {
    console.error("Error fetching product:", error);
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, category } = await params;
  const product = await getProductBySlug(slug);

  if (!product || product.category?.slug !== category) {
    return {
      title: "Product Not Found | Kankana Silks",
      description: "The product you're looking for could not be found.",
      robots: { index: false, follow: false },
    };
  }

  const canonicalPath = `/${encodeURIComponent(category)}/${encodeURIComponent(slug)}`;
  const images =
    product.media
      ?.filter(
        (media: { type?: string; url?: string; altText?: string | null }) =>
          media.type === "IMAGE" && media.url,
      )
      .slice(0, 4)
      .map((media: { url?: string; altText?: string | null }) => ({
        url: media.url!,
        width: 1200,
        height: 630,
        alt: media.altText || product.name,
      })) ?? [];

  const title = product.metaTitle || `${product.name} | Kankana Silks`;
  const description =
    product.metaDesc ||
    product.description?.replace(/\s+/g, " ").trim().slice(0, 160) ||
    `Explore ${product.name} at Kankana Silks. View product details and availability online.`;

  return {
    title,
    description,
    keywords: [
      product.name,
      product.category?.name,
      product.category?.name ? `${product.category.name} saree` : undefined,
      "silk saree",
      "traditional saree",
      "Kankana Silks",
      product.artisanName,
    ].filter((keyword): keyword is string => Boolean(keyword)),
    openGraph: {
      title,
      description,
      images,
      type: "website",
      url: `https://www.kankanasilks.com${canonicalPath}`,
      siteName: "Kankana Silks",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(images[0]?.url ? { images: [images[0].url] } : {}),
    },
    alternates: { canonical: canonicalPath },
    robots: { index: true, follow: true },
  };
}

export default async function ProductDetailsPage({ params }: Props) {
  const { slug, category } = await params;
  const product = await getProductBySlug(slug);

  if (!product || product.category?.slug !== category) {
    notFound();
  }

  return <ProductDetailsClient initialProduct={product} />;
}
