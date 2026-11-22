import type { Product, ProductVariant } from "@/lib/api/product.api";
import { getCartItemStockState } from "@/lib/utils/cartStock";

const getProductStockState = (product: Product, variant?: ProductVariant | null) =>
  getCartItemStockState({
    product,
    variant: variant ?? undefined,
    variantId: variant?.id,
    allowOutOfStockOrders: product.allowOutOfStockOrders,
  });

export function isProductUnavailable(product: Product): boolean {
  const variants = product.hasVariants ? (product.variants ?? []) : [];
  return variants.length > 0
    ? variants.every((variant) => getProductStockState(product, variant).isOutOfStock)
    : getProductStockState(product).isOutOfStock;
}

export function isProductOutOfStock(product: Product): boolean {
  const variants = product.hasVariants ? (product.variants ?? []) : [];
  return variants.length > 0
    ? variants.every((variant) => getProductStockState(product, variant).isZeroStock)
    : getProductStockState(product).isZeroStock;
}
