import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductDetailsClient from "@/components/sections/productDetialClient";
import { getProductBySlug } from "@/lib/seo/server-api";
import { seoPageTitle, brandedSeoTitle, seoPageDescription } from "@/lib/seo/metadata";
import { JsonLd, breadcrumbJsonLd, productJsonLd } from "@/lib/seo/json-ld";

type Props = {
  params: Promise<{ category: string; slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, category } = await params;
  const product = await getProductBySlug(slug);

  if (!product || product.category?.slug !== category) {
    return {
      title: "Product Not Found",
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

  const title = seoPageTitle(product.metaTitle, `${product.name} Saree`);
  const description = seoPageDescription(
    product.metaDesc || product.description,
    `Explore ${product.name} at Kankana Silks. View product details and availability online.`,
  );

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
      title: brandedSeoTitle(title),
      description,
      images,
      type: "website",
      url: `https://www.kankanasilks.com${canonicalPath}`,
      siteName: "Kankana Silks",
    },
    twitter: {
      card: "summary_large_image",
      title: brandedSeoTitle(title),
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

  const canonicalPath = `/${encodeURIComponent(category)}/${encodeURIComponent(slug)}`;

  return (
    <>
      <JsonLd
        data={[
          productJsonLd(product, canonicalPath),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            {
              name: product.category?.name ?? "Shop",
              path: `/shop/${encodeURIComponent(category)}`,
            },
            { name: product.name, path: canonicalPath },
          ]),
        ]}
      />
      <ProductDetailsClient initialProduct={product} />
    </>
  );
}
