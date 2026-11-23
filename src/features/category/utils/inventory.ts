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
  const variants = product.variants ?? [];

  if (product.hasVariants && variants.length > 0) {
    const states = variants.map((variant) =>
      getProductStockState(product, variant)
    );
    const statesWithInventory = states.filter(
      (state) => state.hasStockData
    );

    // Do not show Add to Cart when every variant with known inventory
    // is blocked. A variant's stock may be returned on product.stock
    // rather than nested under variants[].stock.
    if (statesWithInventory.length > 0) {
      return statesWithInventory.every(
        (state) => state.isOutOfStock
      );
    }
  }

  return getProductStockState(product).isOutOfStock;
}

export function isProductOutOfStock(product: Product): boolean {
  const variants = product.variants ?? [];

  if (product.hasVariants && variants.length > 0) {
    const states = variants.map((variant) =>
      getProductStockState(product, variant)
    );
    const statesWithInventory = states.filter(
      (state) => state.hasStockData
    );

    return (
      statesWithInventory.length > 0 &&
      statesWithInventory.every((state) => state.isZeroStock)
    );
  }

  return getProductStockState(product).isZeroStock;
}
