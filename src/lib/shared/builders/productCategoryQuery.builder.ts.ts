import { ProductQueryParams } from "@/lib/api/product.api";

/**
 * Default query for category landing
 * Header navigation
 * Initial page load
 * SEO-safe defaults
 */
export const buildCategoryQuery = (slug: string): ProductQueryParams => ({
  categorySlug: slug,
  isActive: true,

  // pagination defaults
  page: 1,
  limit: 12,

  // sorting defaults
  sortBy: "createdAt",
  sortOrder: "desc",

  // optional filters (keep undefined unless needed)
  search: undefined,
  minPrice: undefined,
  maxPrice: undefined,
  color: undefined,
  fabric: undefined,
  size: undefined,
  artisan: undefined,
  inStock: undefined,
  hasVariants: undefined,
});

type FilterState = {
  page: number;
  limit: number;
  searchQuery: string;
  priceRange: [number, number];
  sortBy: "createdAt-desc" | "price-asc" | "price-desc";
};

/**
 * Build query params from filter UI state
 */

export const buildFilterQuery = (
  base: ProductQueryParams,
  filters: FilterState
): ProductQueryParams => {
  const [sortField, sortOrder] = filters.sortBy.split("-") as [
    ProductQueryParams["sortBy"],
    ProductQueryParams["sortOrder"]
  ];

  return {
    ...base,

    page: filters.page,
    limit: filters.limit,

    // search
    search: filters.searchQuery || undefined,

    // price
    minPrice: filters.priceRange[0] > 0 ? filters.priceRange[0] : undefined,
    maxPrice:
      filters.priceRange[1] < 100000 ? filters.priceRange[1] : undefined,

    // sorting
    sortBy: sortField,
    sortOrder,
  };
};