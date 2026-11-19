import type { Product } from "@/lib/api/product.api";

export const SITE_URL = "https://www.kankanasilks.com";

/** Safe inline JSON-LD (escapes "<" so data can never close the script tag). */
export function JsonLd({
  data,
}: {
  data: Record<string, unknown> | Record<string, unknown>[];
}) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}

function totalStock(product: Product): number | null {
  const lists = [
    product.stock,
    ...(product.variants ?? []).map((v) => v.stock),
  ];
  const known = lists.filter((l): l is NonNullable<typeof l> =>
    Array.isArray(l),
  );
  if (known.length === 0) return null; // stock data not returned: do not guess
  return known.flat().reduce((sum, s) => sum + (Number(s.quantity) || 0), 0);
}

/**
 * Product + Offer schema built only from data shown on the page.
 * Ratings are intentionally omitted: the API exposes a review COUNT but no
 * average, and rating markup must reflect real, visible reviews.
 */
export function productJsonLd(product: Product, canonicalPath: string) {
  const images = (product.media ?? [])
    .filter((m) => m.type === "IMAGE" && m.url)
    .map((m) => m.url);

  const prices = [
    Number(product.sellingPrice),
    ...(product.variants ?? []).map((v) => Number(v.sellingPrice ?? v.price)),
  ].filter((n) => Number.isFinite(n) && n > 0);

  const stock = totalStock(product);
  const availability =
    stock === null
      ? undefined
      : stock > 0
        ? "https://schema.org/InStock"
        : product.allowOutOfStockOrders
          ? "https://schema.org/BackOrder"
          : "https://schema.org/OutOfStock";

  const url = `${SITE_URL}${canonicalPath}`;
  const description = product.description?.replace(/\s+/g, " ").trim();

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    ...(description ? { description } : {}),
    ...(images.length ? { image: images } : {}),
    sku: product.sku,
    url,
    brand: { "@type": "Brand", name: "Kankana Silks" },
    ...(product.category?.name ? { category: product.category.name } : {}),
    ...(prices.length
      ? {
          offers: {
            "@type": "Offer",
            url,
            priceCurrency: "INR",
            price: Math.min(...prices).toFixed(2),
            ...(availability ? { availability } : {}),
            itemCondition: "https://schema.org/NewCondition",
            seller: { "@type": "Organization", name: "Kankana Silks" },
          },
        }
      : {}),
  };
}
