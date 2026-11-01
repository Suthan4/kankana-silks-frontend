/**
 * Shared stock policy for cart and checkout.
 * Missing stock data is unknown; only explicit zero stock is out of stock.
 */
export const getCartItemStockState = (item: any) => {
  let stockRows: any[] | null = null;

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
    ) ??
    Number(
      item?.lowStockThreshold ??
        item?.variant?.lowStockThreshold ??
        item?.product?.lowStockThreshold ??
        0,
    );

  const allowOutOfStockOrders =
    item?.product?.allowOutOfStockOrders === true;

  // The flag bypasses the threshold, not physical zero stock, and caps
  // the customer's total quantity at one.
  const isBelowThreshold =
    hasStockData && threshold > 0 && available < threshold;
  const isOutOfStock =
    hasStockData &&
    (available <= 0 || (!allowOutOfStockOrders && isBelowThreshold));
  const isLimited =
    hasStockData &&
    available > 0 &&
    allowOutOfStockOrders;
  const maxAllowed = !hasStockData
    ? Number.POSITIVE_INFINITY
    : isOutOfStock
      ? 0
      : isLimited
        ? 1
        : available;

  return {
    available,
    hasStockData,
    threshold,
    isBelowThreshold,
    allowOutOfStockOrders,
    isOutOfStock,
    isLastOne: hasStockData && available === 1,
    isLimited,
    maxAllowed,
  };
};

export const getCartItemStockQty = (item: any): number =>
  getCartItemStockState(item).available;
