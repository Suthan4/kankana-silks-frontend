import type { Product } from "@/lib/api/product.api";
import { getProductStockOverview } from "@/lib/utils/cartStock";

export function isProductUnavailable(product: Product): boolean {
  return getProductStockOverview(product).isOutOfStock;
}

export function isProductOutOfStock(product: Product): boolean {
  return getProductStockOverview(product).isOutOfStock;
}
