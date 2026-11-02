
/**
 * Shared stock policy for Cart, Mini Cart and Checkout.
 *
 * BUSINESS RULES
 *
 * 1. Physical stock = 0:
 *    Always unavailable, regardless of backorder setting.
 *
 * 2. allowOutOfStockOrders = false:
 *    Enforce low-stock threshold.
 *    Stock below threshold is unavailable.
 *
 * 3. allowOutOfStockOrders = true:
 *    Bypass threshold restriction.
 *    Positive stock below threshold allows maximum quantity 1.
 *
 * 4. Physical stock = 1:
 *    Display last-one availability message,
 *    provided the threshold rule permits purchasing.
 *
 * 5. Cart quantity exceeding maxAllowed:
 *    Block checkout.
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
  const number = Number(value);

  return Number.isFinite(number)
    ? Math.max(0, number)
    : 0;
};

/**
 * Resolve stock rows for the selected variant.
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
    if (variantStock && variantStock.length > 0) {
      return variantStock;
    }

    if (productStock !== null) {
      return productStock.filter(
        (row: any) =>
          String(row?.variantId ?? "") === String(variantId)
      );
    }

    return variantStock;
  }

  if (productStock !== null) {
    return productStock.filter(
      (row: any) => row?.variantId == null
    );
  }

  return variantStock;
};

/**
 * Resolve allowOutOfStockOrders safely.
 */
const getAllowOutOfStockOrders = (item: any): boolean => {
  const value =
    item?.product?.allowOutOfStockOrders ??
    item?.variant?.allowOutOfStockOrders ??
    item?.allowOutOfStockOrders;

  return [true, 1, "1", "true"].includes(value);
};

/**
 * Resolve stock and purchasing restrictions.
 */
export const getCartItemStockState = (
  item: any
): CartStockState => {
  const stockRows = getStockRows(item);

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
      Number.isFinite(Number(value))
  );

  const hasStockData =
    stockRows !== null ||
    directAvailable !== undefined;

  const available =
    stockRows !== null
      ? stockRows.reduce(
          (sum: number, row: any) =>
            sum + toStockNumber(row?.quantity),
          0
        )
      : directAvailable !== undefined
        ? toStockNumber(directAvailable)
        : 0;

  const threshold =
    stockRows !== null
      ? stockRows.reduce(
          (sum: number, row: any) =>
            sum + toStockNumber(row?.lowStockThreshold),
          0
        )
      : toStockNumber(
          item?.lowStockThreshold ??
          item?.variant?.lowStockThreshold ??
          item?.product?.lowStockThreshold ??
          0
        );

  const allowOutOfStockOrders =
    getAllowOutOfStockOrders(item);

  const isBelowThreshold =
    hasStockData &&
    threshold > 0 &&
    available < threshold;

  // Rule 1: Physical zero stock is always unavailable.
  const isZeroStock =
    hasStockData && available <= 0;

  // Rule 2: Enforce threshold when backorders are disabled.
  const isThresholdBlocked =
    hasStockData &&
    !allowOutOfStockOrders &&
    isBelowThreshold &&
    available > 0;

  // Both zero stock and threshold restrictions block purchasing.
  const isOutOfStock =
    isZeroStock || isThresholdBlocked;

  // Backorder setting bypasses threshold only for positive stock.
  const isLimited =
    hasStockData &&
    allowOutOfStockOrders &&
    isBelowThreshold &&
    available > 0;

  // Exactly one physical item remains and purchasing is permitted.
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
 * Customer-facing stock messages.
 *
 * Messaging is separate from validation.
 */
export const getCartItemStockMessage = (
  item: any,
): StockMessage | null => {
  const stock = getCartItemStockState(item);

  if (!stock.hasStockData) return null;

  const quantity = Math.max(
    0,
    Number(item?.quantity) || 0,
  );

  // Physical stock is genuinely zero.
  if (stock.available <= 0) {
    return {
      type: "error",
      message:
        "This item is now out of stock. Please remove it from your cart to continue.",
    };
  }

  // Customer successfully has the last available unit.
  if (stock.available === 1 && quantity === 1) {
    return {
      type: "warning",
      message:
        "Last one available — order now to make it yours!",
    };
  }

  // Requested quantity exceeds available inventory.
  if (quantity > stock.maxAllowed) {
    return {
      type: "error",
      message:
        `Only ${stock.maxAllowed} item(s) available. Please update your quantity.`,
    };
  }

  if (stock.isLimited) {
    return {
      type: "warning",
      message: "Only one item can be ordered at this time.",
    };
  }

  return null;
};

/**
 * Validate one cart item before checkout.
 */
export const validateCartItemForCheckout = (
  item: any
) => {
  const stock = getCartItemStockState(item);

  const quantity = Math.max(
    0,
    Number(item?.quantity) || 0
  );

  // Unknown stock must be verified by backend.
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
        "This item is out of stock. Please remove it from your cart.",
    };
  }

  if (stock.isThresholdBlocked) {
    return {
      valid: false,
      requiresServerValidation: false,
      message:
        "This item is currently unavailable. Please check back later.",
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
        `Only ${stock.maxAllowed} item(s) are available. ` +
        "Please update your cart to continue.",
    };
  }

  return {
    valid: true,
    requiresServerValidation: true,
    message: null as string | null,
  };
};

/**
 * Validate the complete cart.
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
 * Backward-compatible stock quantity helper.
 */
export const getCartItemStockQty = (
  item: any
): number => getCartItemStockState(item).available;
