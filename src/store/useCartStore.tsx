import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type VariantStock = {
  id: string;
  lowStockThreshold?: number;
  productId: string;
  quantity: number;
  updatedAt?: string; // ✅ MAKE OPTIONAL
  variantId?: string | null; // ✅ MAKE OPTIONAL
  warehouseId: string;
};

export interface CartItemAPIShape {
  id: string;
  cartId?: string;
  productId: string;
  variantId?: string | null;
  quantity: number;

  product: {
    id: string;
    name: string;
    slug?: string;
    sellingPrice: string | number;
    basePrice: string | number;
    categoryId: string;
    isActive?: boolean;
    hasVariants?: boolean;
    allowOutOfStockOrders?: boolean;

    media?: { url: string; altText?: string; isActive?: boolean }[];
    stock?: { quantity: number }[];
  };

  variant?: {
    id: string;
    sellingPrice: number;
    basePrice: number;
    size?: string;
    color?: string;
    fabric?: string;
    attributes?: Record<string, string>;
    stock?: VariantStock[];
  } | null;
}

export interface Coupon {
  code: string;

  // from backend coupon object
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number; // ex: 19.99 or 500

  minOrderValue?: number;
  maxDiscountAmount?: number | null;

  validFrom?: string;
  validUntil?: string;
  isActive?: boolean;

  // calculated from validateCoupon API
  discountAmount?: number; // ex: 10994.5 (amount reduced)
  finalAmount?: number; // ex: 44005.5 (after discount)
}

interface CartState {
  items: CartItemAPIShape[];
  appliedCoupon: Coupon | null;

  // Actions
  addItem: (item: CartItemAPIShape) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  applyCoupon: (coupon: Coupon) => void;
  removeCoupon: () => void;

  // Computed values
  getTotalItems: () => number;
  getSubtotal: () => number;
  getDiscount: () => number;
  getTotal: () => number;

  // Sync with server after login
  syncWithServer: (serverItems: CartItemAPIShape[]) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      appliedCoupon: null,

      addItem: (item) => {
        if (!item?.product?.categoryId || !item.productId) {
          console.error("Cannot add an invalid product to the cart.");
          return;
        }

        const incomingQuantity = Number(item.quantity);
        if (!Number.isInteger(incomingQuantity) || incomingQuantity <= 0) {
          console.error("Cart quantity must be a positive integer.");
          return;
        }

        set((state) => {
          const normalizedItems = mergeCartLinesForStorage(state.items);
          const normalizeId = (value: unknown) =>
            value === null || value === undefined || value === ""
              ? ""
              : String(value);
          const incomingProductId = normalizeId(item.productId ?? item.product?.id);
          const incomingVariantId = normalizeId(item.variantId ?? item.variant?.id);
          const sameLine = (candidate: CartItemAPIShape) =>
            normalizeId(candidate.productId ?? candidate.product?.id) === incomingProductId &&
            normalizeId(candidate.variantId ?? candidate.variant?.id) === incomingVariantId;
          const existing = normalizedItems.filter(sameLine);
          const primary = existing[0];

          if (primary) {
            const nextQuantity =
              existing.reduce((total, candidate) => total + Number(candidate.quantity || 0), 0) +
              incomingQuantity;
            const nextItem = {
              ...primary,
              ...item,
              id: primary.id,
              variantId: item.variantId ?? item.variant?.id ?? null,
              quantity: nextQuantity,
            };
            const remaining = normalizedItems.filter((candidate) => !sameLine(candidate));
            return { items: [...remaining, nextItem] };
          }

          return {
            items: [...normalizedItems, { ...item, id: item.id || crypto.randomUUID() }],
          };
        });
      },

      removeItem: (id) => {
        set((state) => {
          const normalizeId = (value: unknown) =>
            value === null || value === undefined || value === ""
              ? ""
              : String(value);
          const target = state.items.find((item) => normalizeId(item.id) === normalizeId(id));
          if (!target) return { items: state.items.filter((item) => normalizeId(item.id) !== normalizeId(id)) };

          const targetProductId = normalizeId(target.productId ?? target.product?.id);
          const targetVariantId = normalizeId(target.variantId ?? target.variant?.id);
          return {
            items: state.items.filter((item) =>
              normalizeId(item.productId ?? item.product?.id) !== targetProductId ||
              normalizeId(item.variantId ?? item.variant?.id) !== targetVariantId,
            ),
          };
        });
      },

      updateQuantity: (id, quantity) => {
        if (!Number.isInteger(quantity) || quantity <= 0) return;
        set((state) => {
          const normalizeId = (value: unknown) =>
            value === null || value === undefined || value === ""
              ? ""
              : String(value);
          const target = state.items.find((item) => normalizeId(item.id) === normalizeId(id));
          if (!target) return { items: state.items };

          const targetProductId = normalizeId(target.productId ?? target.product?.id);
          const targetVariantId = normalizeId(target.variantId ?? target.variant?.id);
          let kept = false;
          const items = state.items.flatMap((item) => {
            const isSameLine =
              normalizeId(item.productId ?? item.product?.id) === targetProductId &&
              normalizeId(item.variantId ?? item.variant?.id) === targetVariantId;
            if (!isSameLine) return [item];
            if (kept) return [];
            kept = true;
            return [{ ...item, quantity }];
          });
          return { items: mergeCartLinesForStorage(items) };
        });
      },

      clearCart: () => {
        set({ items: [], appliedCoupon: null });
      },

      applyCoupon: (coupon) => {
        if (coupon.validUntil && new Date(coupon.validUntil) < new Date()) {
          throw new Error("Coupon has expired");
        }

        set({ appliedCoupon: coupon });
      },

      removeCoupon: () => {
        set({ appliedCoupon: null });
      },

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getSubtotal: () =>
        get().items.reduce((sum, item) => {
          const price = Number(
            item?.variant?.sellingPrice ?? item.product?.sellingPrice ?? 0,
          );
          return sum + price * item.quantity;
        }, 0),

      getDiscount: () => Number(get().appliedCoupon?.discountAmount ?? 0),

      getTotal: () => {
        const subtotal = get().getSubtotal();
        const discount = get().getDiscount();
        return Math.max(0, subtotal - discount);
      },

      syncWithServer: (serverItems) => {
        set({ items: mergeCartLinesForStorage(serverItems), appliedCoupon: null });
      },
    }),
    {
      name: "cart-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
