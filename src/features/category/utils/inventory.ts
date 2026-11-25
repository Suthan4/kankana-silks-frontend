import type { Product } from "@/lib/api/product.api";
import { getProductStockOverview } from "@/lib/utils/cartStock";

export function isProductUnavailable(product: Product): boolean {
  return getProductStockOverview(product).isOutOfStock;
}

export function isProductOutOfStock(product: Product): boolean {
  // "Sold Out" refers to zero physical inventory; threshold-blocked items
  // still have stock and should display the separate unavailable message.
  return getProductStockOverview(product).isZeroStock;
}
