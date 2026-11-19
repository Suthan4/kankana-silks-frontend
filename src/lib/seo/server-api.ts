import { cache } from "react";
import type { Product } from "@/lib/api/product.api";
import type { HomeSection } from "@/lib/api/home-section.api";
import type { Banner } from "@/lib/api/banner.api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

/** Product pages change rarely; availability is refreshed at most every minute. */
const PRODUCT_REVALIDATE_SECONDS = 60;

/**
 * Cached per request (React `cache`) so generateMetadata() and the page share
 * ONE API call, and cached across requests (Next `revalidate`) so crawlers
 * do not hit the backend each time.
 */
export const getProductBySlug = cache(
  async (slug: string): Promise<Product | null> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/products/slug/${encodeURIComponent(slug)}`,
        {
          next: { revalidate: PRODUCT_REVALIDATE_SECONDS },
          headers: { "Content-Type": "application/json" },
        },
      );
      if (!response.ok) return null;
      const result = await response.json();
      return (result.data as Product) ?? null;
    } catch (error) {
      console.error("Error fetching product:", error);
      return null;
    }
  },
);

/** Default first page of a category; must match the client's default query. */
export const CATEGORY_PAGE_LIMIT = 12;

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
    try {
      const query = new URLSearchParams({
        page: "1",
        limit: String(CATEGORY_PAGE_LIMIT),
        isActive: "true",
        categorySlug,
        sortBy: "price",
        sortOrder: "desc",
      });
      const response = await fetch(`${API_BASE_URL}/products?${query}`, {
        next: { revalidate: PRODUCT_REVALIDATE_SECONDS },
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) return null;
      return (await response.json()) as CategoryProductsPayload;
    } catch (error) {
      console.error("Error fetching category products:", error);
      return null;
    }
  },
);

export const getActiveHomeSections = cache(
  async (): Promise<HomeSection[] | undefined> => {
    try {
      const response = await fetch(`${API_BASE_URL}/home-sections/active`, {
        next: { revalidate: 300 },
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) return undefined;
      const result = await response.json();
      return Array.isArray(result.data) ? (result.data as HomeSection[]) : undefined;
    } catch (error) {
      console.error("Error fetching home sections:", error);
      return undefined;
    }
  },
);

export const getActiveBanners = cache(async (): Promise<Banner[] | undefined> => {
  try {
    const response = await fetch(`${API_BASE_URL}/banners/active`, {
      next: { revalidate: 300 },
      headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) return undefined;
    const result = await response.json();
    return Array.isArray(result.data) ? (result.data as Banner[]) : undefined;
  } catch (error) {
    console.error("Error fetching banners:", error);
    return undefined;
  }
});