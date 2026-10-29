export interface CartLineLike {
  id: string | number;
  productId?: string | number | null;
  variantId?: string | number | null;
  quantity?: number | string | null;
  product?: { id?: string | number | null } | null;
  variant?: { id?: string | number | null } | null;
}

export type MergedCartLine<T extends CartLineLike> = T & {
  /** IDs for every persisted/local line merged into this visible row. */
  _duplicateIds: string[];
};

const normalizeId = (value: unknown): string => {
  if (value === null || value === undefined || value === "") return "";
  return String(value);
};

const cartLineKey = (item: CartLineLike): string => {
  const productId = normalizeId(item.productId ?? item.product?.id);
  if (!productId) return `invalid:${normalizeId(item.id)}`;

  // null and undefined both mean the simple-product line.
  const variantId = normalizeId(item.variantId ?? item.variant?.id);
  return `${productId}::${variantId}`;
};

/**
 * Display duplicate server/local lines as one product row with a summed quantity.
 * The original row's ID stays primary; duplicate IDs are retained so callers can
 * update/remove old duplicate records safely until the backend consolidates them.
 */
export function mergeCartLines<T extends CartLineLike>(
  items: readonly T[],
): Array<MergedCartLine<T>> {
  const merged = new Map<string, MergedCartLine<T>>();

  for (const rawItem of items) {
    if (!rawItem || typeof rawItem !== "object") continue;

    const item = rawItem as T;
    const key = cartLineKey(item);
    const id = normalizeId(item.id);
    const quantityNumber = Number(item.quantity);
    const quantity =
      Number.isFinite(quantityNumber) && quantityNumber > 0
        ? quantityNumber
        : 1;
    const current = merged.get(key);

    if (!current) {
      merged.set(key, {
        ...item,
        quantity,
        _duplicateIds: id ? [id] : [],
      } as MergedCartLine<T>);
      continue;
    }

    current.quantity = Number(current.quantity || 0) + quantity;
    if (id && !current._duplicateIds.includes(id)) {
      current._duplicateIds.push(id);
    }
  }

  return Array.from(merged.values());
}

/** Remove the UI-only duplicate-ID metadata before persisting cart lines. */
export function mergeCartLinesForStorage<T extends CartLineLike>(items: readonly T[]): T[] {
  return mergeCartLines(items).map(
    ({ _duplicateIds: _ignored, ...item }) => item as unknown as T,
  );
}

