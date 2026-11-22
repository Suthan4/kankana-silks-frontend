import type { Product } from "@/lib/api/product.api";

export function isProductUnavailable(product: Product): boolean {
  const allowOutOfStockOrders = product.allowOutOfStockOrders ?? false;
  const variants = product.hasVariants ? (product.variants ?? []) : [];
  const allVariantsHaveInventory =
    variants.length > 0 &&
    variants.every((variant) => Array.isArray(variant.stock) && variant.stock.length > 0);

  if (allVariantsHaveInventory) {
    return variants.every((variant) => {
      const quantity = Number(variant.stock?.[0]?.quantity ?? 0);
      const threshold = Number(variant.stock?.[0]?.lowStockThreshold ?? 0);
      if (quantity <= 0) return true;
      if (allowOutOfStockOrders) return false;
      return quantity <= threshold;
    });
  }

  const quantity = Number(product.stock?.[0]?.quantity ?? 0);
  const threshold = Number(product.stock?.[0]?.lowStockThreshold ?? 0);
  if (quantity <= 0) return true;
  if (allowOutOfStockOrders) return false;
  return quantity <= threshold;
}

export function isProductOutOfStock(product: Product): boolean {
  if (product.hasVariants && product.variants?.length) {
    const everyVariantHasInventory = product.variants.every(
      (variant) => Array.isArray(variant.stock) && variant.stock.length > 0,
    );
    return (
      everyVariantHasInventory &&
      product.variants.every((variant) => {
        const quantity = Number(variant.stock?.[0]?.quantity ?? 0);
        return Number.isFinite(quantity) && quantity <= 0;
      })
    );
  }
  return Number(product.stock?.[0]?.quantity ?? 0) <= 0;
}
