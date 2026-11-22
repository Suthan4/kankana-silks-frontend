import type { Category } from "@/lib/api/category.api";
import type { Product, ProductsResponse } from "@/lib/api/product.api";

export type CategorySortValue =
  | "createdAt-desc"
  | "price-asc"
  | "price-desc"
  | "popularity-desc"
  | "name-asc";

export interface CategoryProductsClientProps {
  category: Category;
  /** Server-fetched first page (default sort, no filters). */
  initialProducts?: ProductsResponse;
}

export interface CategoryProductAction {
  product: Product;
  variant: import("@/lib/api/product.api").ProductVariant | null;
}
