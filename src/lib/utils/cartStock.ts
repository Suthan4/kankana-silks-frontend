/**
 * Shared stock lookup and purchase limit used by cart and checkout.
 *
 * A missing stock relation is UNKNOWN, not zero. This matters because some
 * cart responses/optimistic rows do not carry the stock relation. Only an
 * explicit stock quantity of zero should be presented as out of stock.
 */
export const getCartItemStockState = (item: any) => {
  let stockRows: any[] | null = null;

  // Prefer the selected variant's stock. If that relation is unavailable,
  // fall back to the product stock rows filtered to the selected variant.
  if (Array.isArray(item?.variant?.stock) && item.variant.stock.length > 0) {
    stockRows = item.variant.stock;
  } else if (Array.isArray(item?.product?.stock)) {
    const variantId = item?.variantId ?? item?.variant?.id;
    stockRows = variantId
      ? item.product.stock.filter(
          (stock: any) => String(stock.variantId ?? "") === String(variantId),
        )
      : item.product.stock.filter((stock: any) => stock.variantId == null);
  } else if (Array.isArray(item?.variant?.stock)) {
    // An explicitly returned empty stock relation means no stock rows exist.
    stockRows = item.variant.stock;
  }

  const directAvailable = [
    item?.availableStock,
    item?.stockQuantity,
    item?.variant?.availableStock,
    item?.variant?.stockQuantity,
    item?.product?.availableStock,
    item?.product?.stockQuantity,
  ].find(
    (value) =>
      value !== null &&
      value !== undefined &&
      value !== "" &&
      Number.isFinite(Number(value)),
  );

  const hasStockData = stockRows !== null || directAvailable !== undefined;
  const available =
    stockRows !== null
      ? stockRows.reduce(
          (sum: number, row: any) =>
            sum + Math.max(0, Number(row?.quantity) || 0),
          0,
        )
      : directAvailable !== undefined
        ? Math.max(0, Number(directAvailable))
        : 0;

  const threshold =
    stockRows?.reduce(
      (sum: number, row: any) =>
        sum + Math.max(0, Number(row?.lowStockThreshold) || 0),
      0,
    ) ?? 0;

  const isBelowThreshold =
    hasStockData && available > 0 && threshold > 0 && available <= threshold;
  const allowOutOfStockOrders = item?.product?.allowOutOfStockOrders === true;

  // Never infer out-of-stock from a missing stock relation.
  const isOutOfStock = hasStockData && available <= 0;
  const isLastOne = hasStockData && available === 1;
  const maxAllowed = hasStockData ? available : Number.POSITIVE_INFINITY;

  return {
    available,
    hasStockData,
    threshold,
    isBelowThreshold,
    allowOutOfStockOrders,
    isOutOfStock,
    isLastOne,
    isLimited: false,
    maxAllowed,
  };
};

export const getCartItemStockQty = (item: any): number =>
  getCartItemStockState(item).available;
