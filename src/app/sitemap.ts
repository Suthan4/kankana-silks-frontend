import type { MetadataRoute } from "next";

const SITE_URL = "https://www.kankanasilks.com";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "");
const REVALIDATE_SECONDS = 60 * 60;
const MAX_PRODUCT_URLS = 45_000;
const PRODUCT_PAGE_SIZE = 100;

type ApiCategory = {
  slug?: string;
  isActive?: boolean;
  updatedAt?: string;
  children?: ApiCategory[];
  childPlacements?: Array<{ order?: number; child?: ApiCategory }>;
};

type ApiProduct = {
  slug?: string;
  category?: { slug?: string };
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  media?: Array<{ type?: string; url?: string }>;
};

function absoluteUrl(path: string): string {
  return new URL(path, SITE_URL).toString();
}

function validDate(value?: string): Date | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function flattenCategories(categories: ApiCategory[]): ApiCategory[] {
  const result: ApiCategory[] = [];
  const visited = new Set<string>();

  const visit = (category: ApiCategory) => {
    if (category.isActive === false) return;

    if (category.slug && !visited.has(category.slug)) {
      visited.add(category.slug);
      result.push(category);
    }

    const children =
      category.children ??
      (category.childPlacements ?? [])
        .slice()
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .map((placement) => placement.child)
        .filter((child): child is ApiCategory => Boolean(child));

    children.forEach(visit);
  };

  categories.forEach(visit);
  return result;
}

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const response = await fetch(url, {
      next: { revalidate: REVALIDATE_SECONDS },
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      console.error("Sitemap request failed:", response.status, url);
      return null;
    }

    return (await response.json()) as T;
  } catch (error) {
    console.error("Sitemap data fetch failed:", error);
    return null;
  }
}

async function getCategoryEntries(): Promise<MetadataRoute.Sitemap> {
  if (!API_BASE_URL) return [];

  const payload = await fetchJson<{ data?: ApiCategory[] }>(
    API_BASE_URL + "/categories/tree",
  );
  const categories = flattenCategories(
    Array.isArray(payload?.data) ? payload.data : [],
  );

  return categories.map((category) => ({
    url: absoluteUrl("/shop/" + encodeURIComponent(category.slug!)),
    ...(validDate(category.updatedAt)
      ? { lastModified: validDate(category.updatedAt) }
      : {}),
    changeFrequency: "weekly",
    priority: 0.75,
  }));
}

async function getProductEntries(): Promise<MetadataRoute.Sitemap> {
  if (!API_BASE_URL) return [];

  const entries: MetadataRoute.Sitemap = [];

  for (let page = 1; page <= 500 && entries.length < MAX_PRODUCT_URLS; page += 1) {
    const url = new URL(API_BASE_URL + "/products");
    url.searchParams.set("page", String(page));
    url.searchParams.set("limit", String(PRODUCT_PAGE_SIZE));
    url.searchParams.set("isActive", "true");

    const payload = await fetchJson<{
      data?: {
        products?: ApiProduct[];
        pagination?: { totalPages?: number; page?: number };
      };
    }>(url.toString());

    const products = payload?.data?.products ?? [];
    if (!products.length) break;

    for (const product of products) {
      if (!product.slug || !product.category?.slug || product.isActive === false) continue;

      const images = (product.media ?? [])
        .filter((media) => media.type === "IMAGE" && media.url)
        .slice(0, 5)
        .map((media) => media.url!);

      entries.push({
        url: absoluteUrl(
          "/" +
            encodeURIComponent(product.category.slug) +
            "/" +
            encodeURIComponent(product.slug),
        ),
        ...(validDate(product.updatedAt ?? product.createdAt)
          ? { lastModified: validDate(product.updatedAt ?? product.createdAt) }
          : {}),
        changeFrequency: "weekly",
        priority: 0.8,
        ...(images.length ? { images } : {}),
      });

      if (entries.length >= MAX_PRODUCT_URLS) break;
    }

    const totalPages = payload?.data?.pagination?.totalPages;
    if (totalPages ? page >= totalPages : products.length < PRODUCT_PAGE_SIZE) {
      break;
    }
  }

  return entries;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), changeFrequency: "daily", priority: 1 },
    { url: absoluteUrl("/shop"), changeFrequency: "daily", priority: 0.9 },
    { url: absoluteUrl("/mysore-sarees"), changeFrequency: "monthly", priority: 0.8 },
    { url: absoluteUrl("/bengaluru-sarees"), changeFrequency: "monthly", priority: 0.8 },
    { url: absoluteUrl("/chennai-sarees"), changeFrequency: "monthly", priority: 0.7 },
    { url: absoluteUrl("/hyderabad-sarees"), changeFrequency: "monthly", priority: 0.7 },
    { url: absoluteUrl("/about-us"), changeFrequency: "monthly", priority: 0.5 },
    { url: absoluteUrl("/contact-us"), changeFrequency: "monthly", priority: 0.5 },
    { url: absoluteUrl("/faq"), changeFrequency: "monthly", priority: 0.4 },
    { url: absoluteUrl("/product-details-appearance"), changeFrequency: "yearly", priority: 0.2 },
    { url: absoluteUrl("/shipping-policy"), changeFrequency: "yearly", priority: 0.2 },
    { url: absoluteUrl("/return-policy"), changeFrequency: "yearly", priority: 0.2 },
    { url: absoluteUrl("/cancellation-policy"), changeFrequency: "yearly", priority: 0.2 },
    { url: absoluteUrl("/privacy-policy"), changeFrequency: "yearly", priority: 0.1 },
    { url: absoluteUrl("/terms-and-conditions"), changeFrequency: "yearly", priority: 0.1 },
  ];

  const [categoryEntries, productEntries] = await Promise.all([
    getCategoryEntries(),
    getProductEntries(),
  ]);

  return [...staticEntries, ...categoryEntries, ...productEntries];
}
