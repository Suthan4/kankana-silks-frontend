/**
 * Shared stock lookup and purchase limit used by wishlist, cart and checkout.
 * Keeps the existing variant-first inventory selection.
 */
export const getCartItemStockState = (item: any) => {
  let stockRow: any = null;

  if (Array.isArray(item?.variant?.stock) && item.variant.stock.length > 0) {
    stockRow = item.variant.stock[0];
  } else if (Array.isArray(item?.product?.stock) && item.product.stock.length > 0) {
    if (item.variantId ?? item.variant?.id) {
      stockRow = item.product.stock.find(
        (stock: any) =>
          String(stock.variantId ?? "") ===
          String(item.variantId ?? item.variant?.id),
      ) ?? null;
    } else {
      stockRow = item.product.stock.find(
        (stock: any) => stock.variantId == null,
      ) ?? item.product.stock[0];
    }
  }

  const available = Math.max(0, Number(stockRow?.quantity) || 0);
  const threshold = Math.max(0, Number(stockRow?.lowStockThreshold) || 0);
  const isBelowThreshold =
    available > 0 && threshold > 0 && available <= threshold;
  const allowOutOfStockOrders = item?.product?.allowOutOfStockOrders === true;
  const isOutOfStock =
    available <= 0 || (isBelowThreshold && !allowOutOfStockOrders);
  const maxAllowed = isOutOfStock ? 0 : isBelowThreshold ? 1 : available;

  return {
    available,
    threshold,
    isBelowThreshold,
    allowOutOfStockOrders,
    isOutOfStock,
    isLimited: isBelowThreshold && allowOutOfStockOrders,
    maxAllowed,
  };
};

export const getCartItemStockQty = (item: any): number =>
  getCartItemStockState(item).available;
