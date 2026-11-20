import { cache } from "react";
import { unstable_cache } from "next/cache";
import type { Product } from "@/lib/api/product.api";
import type { Category } from "@/lib/api/category.api";
import type { HomeSection } from "@/lib/api/home-section.api";
import type { Banner } from "@/lib/api/banner.api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

/** Default first page of a category; must match the client's default query. */
export const CATEGORY_PAGE_LIMIT = 12;

/**
 * No Next.js data cache: every request fetches fresh data from the backend,
 * so admin changes (create / update / delete) show up on the next page load.
 * React `cache` below only dedupes calls inside ONE request
 * (generateMetadata + page share one fetch); it never persists across requests.
 */
async function apiGet<T>(path: string): Promise<T | null> {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch (error) {
    console.error(`Error fetching ${path}:`, error);
    return null;
  }
}

/* ------------------------------------------------------------------ */
/* NOT cached across visitors: product and category data stays fresh.  */
/* (prices and stock must never be stale)                              */
/* ------------------------------------------------------------------ */

export const getProductBySlug = cache(
  async (slug: string): Promise<Product | null> => {
    const result = await apiGet<{ data?: Product }>(
      `/products/slug/${encodeURIComponent(slug)}`,
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
    return apiGet<CategoryProductsPayload>(`/products?${query}`);
  },
);

export const getCategoryBySlug = cache(
  async (slug: string): Promise<Category | null> => {
    const result = await apiGet<{ data?: Category }>(
      `/categories/slug/${encodeURIComponent(slug)}`,
    );
    return result?.data ?? null;
  },
);

/* ------------------------------------------------------------------ */
/* Home page: cached for 60 s across all visitors.                     */
/* ------------------------------------------------------------------ */

/**
 * Home page data is cached for 60 s (shared across all visitors) so the HTML
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