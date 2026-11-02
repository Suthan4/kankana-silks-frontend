
/**
 * Shared stock policy for Cart, Mini Cart and Checkout.
 *
 * IMPORTANT:
 * Cart quantity does NOT reserve or deduct inventory.
 * Inventory is deducted only when an order is placed.
 */

export interface CartStockState {
  available: number;
  hasStockData: boolean;
  threshold: number;
  allowOutOfStockOrders: boolean;
  isBelowThreshold: boolean;
  isZeroStock: boolean;
  isThresholdBlocked: boolean;
  isOutOfStock: boolean;
  isLimited: boolean;
  isLastOne: boolean;
  maxAllowed: number;
}

export type StockMessage = {
  type: "error" | "warning" | "info";
  message: string;
};

const toStockNumber = (value: any): number => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return 0;
  }

  const number = Number(value);

  return Number.isFinite(number)
    ? Math.max(0, number)
    : 0;
};

/**
 * Resolve inventory rows for the selected variant.
 *
 * Empty relations are treated as missing data, not automatically
 * as confirmed zero inventory.
 */
const getStockRows = (item: any): any[] | null => {
  const variantId = item?.variantId ?? item?.variant?.id;

  const variantStock = Array.isArray(item?.variant?.stock)
    ? item.variant.stock
    : null;

  const productStock = Array.isArray(item?.product?.stock)
    ? item.product.stock
    : null;

  if (variantId != null) {
    // Prefer the selected variant's inventory.
    if (variantStock && variantStock.length > 0) {
      return variantStock;
    }

    // Fall back to matching product-level warehouse rows.
    if (productStock && productStock.length > 0) {
      const matchingRows = productStock.filter(
        (row: any) =>
          String(row?.variantId ?? "") === String(variantId)
      );

      if (matchingRows.length > 0) {
        return matchingRows;
      }
    }

    // No matching rows: allow direct stock fields to resolve inventory.
    return null;
  }

  // Simple product inventory.
  if (productStock && productStock.length > 0) {
    const matchingRows = productStock.filter(
      (row: any) => row?.variantId == null
    );

    if (matchingRows.length > 0) {
      return matchingRows;
    }
  }

  return null;
};

/**
 * Parse allowOutOfStockOrders safely.
 */
const getAllowOutOfStockOrders = (item: any): boolean => {
  const value =
    item?.product?.allowOutOfStockOrders ??
    item?.variant?.allowOutOfStockOrders ??
    item?.allowOutOfStockOrders;

  return [true, 1, "1", "true"].includes(value);
};

/**
 * Resolve the selected item's current inventory.
 */
export const getCartItemStockState = (
  item: any
): CartStockState => {
  const stockRows = getStockRows(item);

  const directAvailable = [
    item?.availableStock,
    item?.variant?.availableStock,
    item?.product?.availableStock,
    item?.stockQuantity,
    item?.variant?.stockQuantity,
    item?.product?.stockQuantity,
  ].find(
    (value) =>
      value !== null &&
      value !== undefined &&
      value !== "" &&
      Number.isFinite(Number(value))
  );

  const hasStockData =
    stockRows !== null ||
    directAvailable !== undefined;

  const available = stockRows !== null
    ? stockRows.reduce(
        (sum: number, row: any) =>
          sum + toStockNumber(row?.quantity),
        0
      )
    : directAvailable !== undefined
      ? toStockNumber(directAvailable)
      : 0;

  const threshold = stockRows !== null
    ? stockRows.reduce(
        (sum: number, row: any) =>
          sum + toStockNumber(row?.lowStockThreshold),
        0
      )
    : toStockNumber(
        item?.lowStockThreshold ??
        item?.variant?.lowStockThreshold ??
        item?.product?.lowStockThreshold
      );

  const allowOutOfStockOrders =
    getAllowOutOfStockOrders(item);

  const isBelowThreshold =
    hasStockData &&
    threshold > 0 &&
    available < threshold;

  // Physical stock zero ALWAYS blocks purchasing.
  const isZeroStock =
    hasStockData && available <= 0;

  // When backorders are disabled, enforce threshold.
  const isThresholdBlocked =
    hasStockData &&
    !allowOutOfStockOrders &&
    isBelowThreshold &&
    available > 0;

  const isOutOfStock =
    isZeroStock || isThresholdBlocked;

  // Backorders bypass threshold only with positive physical stock.
  const isLimited =
    hasStockData &&
    allowOutOfStockOrders &&
    isBelowThreshold &&
    available > 0;

  // Exactly one physical unit and purchasing is permitted.
  const isLastOne =
    hasStockData &&
    available === 1 &&
    !isOutOfStock;

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
    isZeroStock,
    isThresholdBlocked,
    isOutOfStock,
    isLimited,
    isLastOne,
    maxAllowed,
  };
};

/**
 * Customer-facing messages.
 */
export const getCartItemStockMessage = (
  item: any
): StockMessage | null => {
  const stock = getCartItemStockState(item);

  if (!stock.hasStockData) return null;

  const quantity = Math.max(
    0,
    Number(item?.quantity) || 0
  );

  // Actual physical stock is zero.
  if (stock.isZeroStock) {
    return {
      type: "error",
      message:
        "This item is currently out of stock. Please remove it from your cart to continue.",
    };
  }

  // Threshold restriction.
  if (stock.isThresholdBlocked) {
    return {
      type: "error",
      message:
        "This item is currently unavailable. Please check back later.",
    };
  }

  // Customer requested more than available.
  if (quantity > stock.maxAllowed) {
    return {
      type: "error",
      message:
        `Only ${stock.maxAllowed} item(s) are available. Please update your quantity.`,
    };
  }

  // Customer has successfully added the final available unit.
  if (stock.isLastOne && quantity === 1) {
    return {
      type: "warning",
      message:
        "Last one available — order now to make it yours!",
    };
  }

  if (stock.isLimited) {
    return {
      type: "warning",
      message:
        "Only one item can be ordered at this time.",
    };
  }

  return null;
};

/**
 * Validate one item before checkout.
 */
export const validateCartItemForCheckout = (
  item: any
) => {
  const stock = getCartItemStockState(item);

  const quantity = Math.max(
    0,
    Number(item?.quantity) || 0
  );

  // Missing inventory data must be verified by backend.
  if (!stock.hasStockData) {
    return {
      valid: true,
      requiresServerValidation: true,
      message: null as string | null,
    };
  }

  if (stock.isZeroStock) {
    return {
      valid: false,
      requiresServerValidation: false,
      message:
        "This item is currently out of stock. Please remove it from your cart.",
    };
  }

  if (stock.isThresholdBlocked) {
    return {
      valid: false,
      requiresServerValidation: false,
      message:
        "This item is currently unavailable.",
    };
  }

  if (quantity <= 0) {
    return {
      valid: false,
      requiresServerValidation: false,
      message: "Please select a valid quantity.",
    };
  }

  if (quantity > stock.maxAllowed) {
    return {
      valid: false,
      requiresServerValidation: false,
      message:
        `Only ${stock.maxAllowed} item(s) are available. Please update your cart.`,
    };
  }

  return {
    valid: true,
    requiresServerValidation: true,
    message: null as string | null,
  };
};

/**
 * Validate complete cart.
 */
export const validateCartForCheckout = (
  items: any[]
) => {
  const errors = items.flatMap((item) => {
    const result = validateCartItemForCheckout(item);

    if (result.valid) return [];

    return [
      {
        productId: item.productId ?? item.product?.id,
        variantId: item.variantId ?? item.variant?.id,
        productName:
          item.product?.name ??
          item.productName ??
          "Product",
        message: result.message,
      },
    ];
  });

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Backward-compatible helper.
 */
export const getCartItemStockQty = (
  item: any
): number => getCartItemStockState(item).available;
