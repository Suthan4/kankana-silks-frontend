import { cache } from "react";
import { unstable_cache } from "next/cache";
import type { Product } from "@/lib/api/product.api";
import type { Category } from "@/lib/api/category.api";
import type { HomeSection } from "@/lib/api/home-section.api";
import type { Banner } from "@/lib/api/banner.api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const CATEGORY_PAGE_LIMIT = 12;
const CATALOG_REVALIDATE_SECONDS = 60;

async function apiGet<T>(
  path: string,
  tags: string[],
): Promise<T | null> {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      headers: { "Content-Type": "application/json" },
      next: {
        revalidate: CATALOG_REVALIDATE_SECONDS,
        tags,
      },
    });

    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch (error) {
    console.error(`Error fetching ${path}:`, error);
    return null;
  }
}

export const getProductBySlug = cache(
  async (slug: string): Promise<Product | null> => {
    const result = await apiGet<{ data?: Product }>(
      `/products/slug/${encodeURIComponent(slug)}`,
      ["products", `product:${slug}`],
    );

    return result?.data ?? null;
  },
);

export type CategoryProductsPayload = {
  success: boolean;
  data: {
    products: Product[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
};

export const getCategoryProducts = cache(
  async (categorySlug: string): Promise<CategoryProductsPayload | null> => {
    const query = new URLSearchParams({
      page: "1",
      limit: String(CATEGORY_PAGE_LIMIT),
      isActive: "true",
      categorySlug,
      sortBy: "price",
      sortOrder: "desc",
    });

    return apiGet<CategoryProductsPayload>(
      `/products?${query}`,
      ["products", `category-products:${categorySlug}`],
    );
  },
);

export const getCategoryBySlug = cache(
  async (slug: string): Promise<Category | null> => {
    const result = await apiGet<{ data?: Category }>(
      `/categories/slug/${encodeURIComponent(slug)}`,
      ["categories", `category:${slug}`],
    );

    return result?.data ?? null;
  },
);

/* ------------------------------------------------------------------ */
/* Home page: cached for 60 s across all visitors.                     */
/* ------------------------------------------------------------------ */

/**
 * Home page data is cached for 5mins (shared across all visitors) so the HTML
 * doesn't wait on the backend for every request. Admin edits show up within a
 * minute; to show them instantly, call revalidateTag("home") after saving.
 */
const HOME_REVALIDATE_SECONDS = 300;

/** Throws on failure so a failed request is never stored in the cache. */
async function fetchHome(path: string): Promise<{ data?: unknown }> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) throw new Error(`${path} responded ${response.status}`);
  return response.json();
}

const getCachedHomeSections = unstable_cache(
  () => fetchHome("/home-sections/active"),
  ["home-sections-active"],
  { revalidate: HOME_REVALIDATE_SECONDS, tags: ["home"] },
);

const getCachedBanners = unstable_cache(
  () => fetchHome("/banners/active"),
  ["banners-active"],
  { revalidate: HOME_REVALIDATE_SECONDS, tags: ["home"] },
);

export const getActiveHomeSections = cache(
  async (): Promise<HomeSection[] | undefined> => {
    try {
      const result = await getCachedHomeSections();
      return Array.isArray(result?.data)
        ? (result.data as HomeSection[])
        : undefined;
    } catch (error) {
      console.error("Error fetching /home-sections/active:", error);
      return undefined;
    }
  },
);

export const getActiveBanners = cache(
  async (): Promise<Banner[] | undefined> => {
    try {
      const result = await getCachedBanners();
      return Array.isArray(result?.data)
        ? (result.data as Banner[])
        : undefined;
    } catch (error) {
      console.error("Error fetching /banners/active:", error);
      return undefined;
    }
  },
);