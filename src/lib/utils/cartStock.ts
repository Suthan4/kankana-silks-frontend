
/**
 * Shared stock policy for cart, mini-cart and checkout.
 *
 * Rules:
 * 1. Stock = 0: Out of stock.
 * 2. Stock below threshold + allowOutOfStockOrders = false:
 *    Out of stock.
 * 3. Stock below threshold + allowOutOfStockOrders = true:
 *    Allow maximum quantity 1.
 * 4. Stock = 1: Last one available.
 * 5. Stock >= threshold: Allow available quantity.
 */
export const getCartItemStockState = (item: any) => {
  let stockRows: any[] | null = null;

  // An empty stock array is meaningful: the API has checked the selected
  // pickup warehouse and there is no inventory there. Do not treat it as
  // "unknown stock", otherwise checkout sends a request that will be rejected.
  if (Array.isArray(item?.variant?.stock)) {
    stockRows = item.variant.stock;
  } else if (Array.isArray(item?.product?.stock)) {
    const variantId = item?.variantId ?? item?.variant?.id;
    stockRows = variantId
      ? item.product.stock.filter(
          (stock: any) =>
            String(stock.variantId ?? "") === String(variantId),
        )
      : item.product.stock.filter((stock: any) => stock.variantId == null);
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

  const hasStockData =
    stockRows !== null || directAvailable !== undefined;

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
    stockRows !== null
      ? stockRows.reduce(
          (sum: number, row: any) =>
            sum +
            Math.max(0, Number(row?.lowStockThreshold) || 0),
          0,
        )
      : Math.max(
          0,
          Number(
            item?.lowStockThreshold ??
              item?.variant?.lowStockThreshold ??
              item?.product?.lowStockThreshold ??
              0,
          ) || 0,
        );

const rawAllowOutOfStock =
  item?.product?.allowOutOfStockOrders ??
  item?.variant?.allowOutOfStockOrders ??
  item?.allowOutOfStockOrders;

const allowOutOfStockOrders =
  rawAllowOutOfStock === true ||
  rawAllowOutOfStock === "true" ||
  rawAllowOutOfStock === 1;

  const isBelowThreshold =
    hasStockData &&
    threshold > 0 &&
    available < threshold;

  // Physical zero stock is ALWAYS unavailable.
  const isOutOfStock =
    hasStockData &&
    (
      available <= 0 ||
      (!allowOutOfStockOrders && isBelowThreshold)
    );

  // Backorder setting bypasses threshold restriction,
  // but allows a maximum of ONE item when below threshold.
  const isLimited =
    hasStockData &&
    allowOutOfStockOrders &&
    isBelowThreshold &&
    available > 0;

  const isLastOne =
    hasStockData && available === 1 && !isOutOfStock;

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
    allowOutOfStockOrders,
    isBelowThreshold,
    isOutOfStock,
    isLimited,
    isLastOne,
    maxAllowed,
  };
};

export const getCartItemStockQty = (item: any): number =>
  getCartItemStockState(item).available;
