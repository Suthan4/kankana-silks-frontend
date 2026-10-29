/**
 * Shared inventory lookup used by cart and checkout.
 * Keep variant-first behavior aligned with the existing checkout validation.
 */
export const getCartItemStockQty = (item: any): number => {
  if (Array.isArray(item?.variant?.stock) && item.variant.stock.length > 0) {
    const quantity = Number(item.variant.stock[0].quantity);
    return Number.isFinite(quantity) && quantity >= 0 ? quantity : 0;
  }

  if (Array.isArray(item?.product?.stock) && item.product.stock.length > 0) {
    if (item.variantId) {
      const matchingStock = item.product.stock.find(
        (stock: any) => String(stock.variantId ?? "") === String(item.variantId),
      );
      if (!matchingStock) return 0;

      const quantity = Number(matchingStock.quantity);
      return Number.isFinite(quantity) && quantity >= 0 ? quantity : 0;
    }

    const quantity = Number(item.product.stock[0].quantity);
    return Number.isFinite(quantity) && quantity >= 0 ? quantity : 0;
  }

  return 0;
};
