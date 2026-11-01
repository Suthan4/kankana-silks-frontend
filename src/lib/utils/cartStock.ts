/**
 * Shared stock lookup and purchase limit used by wishlist, cart and checkout.
 * Stock rows are summed in the same way as the backend cart validation.
 */
export const getCartItemStockState = (item: any) => {
  let stockRows: any[] = [];

  if (Array.isArray(item?.variant?.stock) && item.variant.stock.length > 0) {
    stockRows = item.variant.stock;
  } else if (Array.isArray(item?.product?.stock)) {
    const variantId = item?.variantId ?? item?.variant?.id;
    stockRows = variantId
      ? item.product.stock.filter(
          (stock: any) => String(stock.variantId ?? "") === String(variantId),
        )
      : item.product.stock.filter((stock: any) => stock.variantId == null);
  }

  const available = stockRows.reduce(
    (sum: number, row: any) =>
      sum + Math.max(0, Number(row?.quantity) || 0),
    0,
  );
  const threshold = stockRows.reduce(
    (sum: number, row: any) =>
      sum + Math.max(0, Number(row?.lowStockThreshold) || 0),
    0,
  );
  const isBelowThreshold =
    available > 0 && threshold > 0 && available <= threshold;
  const allowOutOfStockOrders = item?.product?.allowOutOfStockOrders === true;
  // lowStockThreshold is only a merchandising warning. It must never
  // turn physically available stock into an out-of-stock state or reduce
  // the customer's purchase limit.
  const isOutOfStock = available <= 0;
  const maxAllowed = available;

  return {
    available,
    threshold,
    isBelowThreshold,
    allowOutOfStockOrders,
    isOutOfStock,
    isLimited: false,
    maxAllowed,
  };
};

export const getCartItemStockQty = (item: any): number =>
  getCartItemStockState(item).available;
