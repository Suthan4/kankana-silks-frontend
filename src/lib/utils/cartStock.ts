
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

    // Some product APIs include variant inventory on product.stock
    // instead of nesting it under product.variants[].stock.
    if (productStock && productStock.length > 0) {
      const matchingRows = productStock.filter(
        (row: any) =>
          String(row?.variantId ?? "") === String(variantId)
      );

      if (matchingRows.length > 0) {
        return matchingRows;
      }
    }

    return null;
  }

  if (productStock && productStock.length > 0) {
    // Simple-product inventory is stored with a null variantId.
    const simpleProductRows = productStock.filter(
      (row: any) => row?.variantId == null
    );

    if (simpleProductRows.length > 0) {
      return simpleProductRows;
    }

    // Category and product-list APIs may return variant-linked stock rows
    // at product.stock level even when variant details are not embedded.
    // Aggregate these rows until the customer selects a specific variant.
    const variantRows = productStock.filter(
      (row: any) => row?.variantId != null
    );

    if (variantRows.length > 0) {
      return variantRows;
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

  // Threshold equality is blocked when out-of-stock ordering is disabled.
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

  // When enabled, allow at most one unit whenever physical stock is positive,
  // regardless of whether the stock is below the configured threshold.
  const isLimited =
    hasStockData &&
    allowOutOfStockOrders &&
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
 * Resolve aggregate product availability while keeping variable-product stock
 * rows isolated per variant. A single purchasable variant keeps the product
 * selectable even when another variant is below its own threshold.
 */
export interface ProductStockOverview {
  item: any;
  state: CartStockState;
  hasStockData: boolean;
  isOutOfStock: boolean;
  purchasableVariantCount: number;
}

export const getProductStockOverview = (product: any): ProductStockOverview => {
  const productVariants = Array.isArray(product?.variants)
    ? product.variants
    : [];
  let variantsToCheck = productVariants;

  // Home-section payloads include stock rows but may omit nested variant
  // objects. Group those rows by variantId and evaluate each variant separately.
  if (
    product?.hasVariants &&
    variantsToCheck.length === 0 &&
    Array.isArray(product?.stock)
  ) {
    const stockByVariant = new Map<string, any[]>();
    for (const row of product.stock) {
      if (row?.variantId == null) continue;
      const variantKey = String(row.variantId);
      const rows = stockByVariant.get(variantKey) ?? [];
      rows.push(row);
      stockByVariant.set(variantKey, rows);
    }
    variantsToCheck = Array.from(stockByVariant.entries()).map(
      ([id, rows]) => ({ id, stock: rows }),
    );
  }

  if (product?.hasVariants && variantsToCheck.length > 0) {
    const variantResults = variantsToCheck.map((variant: any) => {
      const item = {
        product,
        variant,
        variantId: variant?.id,
        quantity: 1,
        allowOutOfStockOrders: product?.allowOutOfStockOrders,
      };
      return { item, state: getCartItemStockState(item) };
    });
    const known = variantResults.filter((result) => result.state.hasStockData);
    const purchasable = known.filter((result) => !result.state.isOutOfStock);

    if (known.length > 0) {
      const representative = (purchasable.length > 0 ? purchasable : known)
        .slice()
        .sort((left, right) => {
          // Prefer a variant with normal ordering, then the largest allowed
          // quantity. A low-stock variant is only representative when all
          // purchasable variants are limited.
          return (
            Number(left.state.isLimited) - Number(right.state.isLimited) ||
            right.state.maxAllowed - left.state.maxAllowed
          );
        })[0];

      return {
        ...representative,
        hasStockData: true,
        isOutOfStock: purchasable.length === 0,
        purchasableVariantCount: purchasable.length,
      };
    }
  }

  const item = {
    product,
    quantity: 1,
    allowOutOfStockOrders: product?.allowOutOfStockOrders,
  };
  const state = getCartItemStockState(item);
  return {
    item,
    state,
    hasStockData: state.hasStockData,
    isOutOfStock: state.isOutOfStock,
    purchasableVariantCount: state.isOutOfStock ? 0 : 1,
  };
};

/**
 * Return whether the next quantity increase is allowed by the current stock
 * snapshot. Unknown stock is not treated as unlimited for increments.
 */
export const canIncreaseCartItemQuantity = (
  item: any,
  nextQuantity = (Number(item?.quantity) || 0) + 1,
): boolean => {
  const stock = getCartItemStockState(item);

  return (
    stock.hasStockData &&
    !stock.isOutOfStock &&
    Number.isInteger(nextQuantity) &&
    nextQuantity > (Number(item?.quantity) || 0) &&
    nextQuantity <= stock.maxAllowed
  );
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
