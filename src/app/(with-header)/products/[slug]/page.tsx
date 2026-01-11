import { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductDetailsClient from "@/components/sections/productDetialClient";

type Props = {
  params: { slug: string };
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

// Fetch product data (server-side)
async function getProductBySlug(slug: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/products/slug/${slug}`, {
      cache: "no-store", // Always get fresh data for product details
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      return null;
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error("Error fetching product:", error);
    return null;
  }
}

// Generate dynamic metadata for SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: "Product Not Found | Kankana Silks",
      description: "The product you're looking for could not be found.",
    };
  }

  const images =
    product.media
      ?.filter((m: any) => m.type === "IMAGE")
      .map((m: any) => ({
        url: m.url,
        width: 1200,
        height: 630,
        alt: m.altText || product.name,
      })) || [];

  const title = product.metaTitle || `${product.name} | Kankana Silks`;
  const description =
    product.metaDesc ||
    product.description.substring(0, 160) ||
    `Shop ${product.name} at Kankana Silks. Premium handloom sarees with traditional craftsmanship.`;

  return {
    title,
    description,
    keywords: [
      product.name,
      product.category?.name || "",
      "silk saree",
      "handloom",
      "traditional saree",
      "Kankana Silks",
      product.artisanName || "",
    ].filter(Boolean),
    openGraph: {
      title,
      description,
      images: images.slice(0, 4),
      type: "website",
      url: `https://kankanasilks.com/products/${slug}`,
      siteName: "Kankana Silks",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: images[0]?.url ? [images[0].url] : [],
    },
    alternates: {
      canonical: `/products/${slug}`,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

// Main page component
export default async function ProductDetailsPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return <ProductDetailsClient initialProduct={product} />;
}
