import { cache } from "react";
import type { Product } from "@/lib/api/product.api";
import type { Category } from "@/lib/api/category.api";
import type { HomeSection } from "@/lib/api/home-section.api";
import type { Banner } from "@/lib/api/banner.api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * Safety net only. Real updates arrive instantly through on-demand
 * revalidation (POST /api/revalidate -> revalidateTag). If the backend
 * signal is ever missed, data still refreshes within this window.
 */
const REVALIDATE_SECONDS = 60;

/** Default first page of a category; must match the client's default query. */
export const CATEGORY_PAGE_LIMIT = 12;

/**
 * Tag names. The backend must send these in its revalidate call.
 *  - "products"           any product create/update/delete/stock change
 *  - "product:<slug>"     one product page
 *  - "categories"         any category create/update/delete/reorder
 *  - "category:<slug>"    one category page
 *  - "home-sections"      any home section change
 *  - "banners"            any banner change
 */
export const CACHE_TAGS = {
  products: "products",
  product: (slug: string) => `product:${slug}`,
  categories: "categories",
  category: (slug: string) => `category:${slug}`,
  homeSections: "home-sections",
  banners: "banners",
} as const;

async function apiGet<T>(path: string, tags: string[]): Promise<T | null> {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      next: { revalidate: REVALIDATE_SECONDS, tags },
      headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch (error) {
    console.error(`Error fetching ${path}:`, error);
    return null;
  }
}

/**
 * React `cache` dedupes within one request (generateMetadata + page share ONE
 * call). Next `revalidate` + `tags` handle caching across requests.
 */

export const getProductBySlug = cache(
  async (slug: string): Promise<Product | null> => {
    const result = await apiGet<{ data?: Product }>(
      `/products/slug/${encodeURIComponent(slug)}`,
      [CACHE_TAGS.products, CACHE_TAGS.product(slug)],
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
    return apiGet<CategoryProductsPayload>(`/products?${query}`, [
      CACHE_TAGS.products,
      CACHE_TAGS.categories,
      CACHE_TAGS.category(categorySlug),
    ]);
  },
);

export const getCategoryBySlug = cache(
  async (slug: string): Promise<Category | null> => {
    const result = await apiGet<{ data?: Category }>(
      `/categories/slug/${encodeURIComponent(slug)}`,
      [CACHE_TAGS.categories, CACHE_TAGS.category(slug)],
    );
    return result?.data ?? null;
  },
);

export const getActiveHomeSections = cache(
  async (): Promise<HomeSection[] | undefined> => {
    // "products" and "categories" tags too: sections embed product and
    // category data (price, sold-out state, names, images).
    const result = await apiGet<{ data?: unknown }>("/home-sections/active", [
      CACHE_TAGS.homeSections,
      CACHE_TAGS.products,
      CACHE_TAGS.categories,
    ]);
    return Array.isArray(result?.data)
      ? (result.data as HomeSection[])
      : undefined;
  },
);

export const getActiveBanners = cache(
  async (): Promise<Banner[] | undefined> => {
    const result = await apiGet<{ data?: unknown }>("/banners/active", [
      CACHE_TAGS.banners,
    ]);
    return Array.isArray(result?.data) ? (result.data as Banner[]) : undefined;
  },
);