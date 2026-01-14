import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface CartItem {
  id: string;
  productId: string;
  variantId?: string;
  name: string;
  slug: string;
  price: number;
  basePrice: number;
  quantity: number;
  image?: string;
  variant?: {
    size?: string;
    color?: string;
    fabric?: string;
    attributes?: Record<string, string>;
  };
  stock: number;
}

export interface Coupon {
  code: string;
  discount: number; // percentage or fixed amount
  type: "PERCENTAGE" | "FIXED";
  minPurchase?: number;
  expiresAt?: string;
}

interface CartState {
  items: CartItem[];
  appliedCoupon: Coupon | null;

  // Actions
  addItem: (item: CartItem) => void;
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
  syncWithServer: (serverItems: CartItem[]) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      appliedCoupon: null,

      addItem: (item) => {
        set((state) => {
          const existingItem = state.items.find(
            (i) =>
              i.productId === item.productId && i.variantId === item.variantId
          );

          if (existingItem) {
            return {
              items: state.items.map((i) =>
                i.id === existingItem.id
                  ? {
                      ...i,
                      quantity: Math.min(i.quantity + item.quantity, i.stock),
                    }
                  : i
              ),
            };
          }

          return {
            items: [...state.items, { ...item, id: crypto.randomUUID() }],
          };
        });
      },

      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }));
      },

      updateQuantity: (id, quantity) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id
              ? {
                  ...item,
                  quantity: Math.min(Math.max(1, quantity), item.stock),
                }
              : item
          ),
        }));
      },

      clearCart: () => {
        set({ items: [], appliedCoupon: null });
      },

      applyCoupon: (coupon) => {
        const subtotal = get().getSubtotal();

        if (coupon.minPurchase && subtotal < coupon.minPurchase) {
          throw new Error(
            `Minimum purchase of ₹${coupon.minPurchase} required`
          );
        }

        if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
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

      getSubtotal: () => {
        return get().items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );
      },

      getDiscount: () => {
        const { appliedCoupon } = get();
        if (!appliedCoupon) return 0;

        const subtotal = get().getSubtotal();

        if (appliedCoupon.type === "PERCENTAGE") {
          return (subtotal * appliedCoupon.discount) / 100;
        }

        return appliedCoupon.discount;
      },

      getTotal: () => {
        const subtotal = get().getSubtotal();
        const discount = get().getDiscount();
        return Math.max(0, subtotal - discount);
      },

      syncWithServer: (serverItems) => {
        set({ items: serverItems });
      },
    }),
    {
      name: "cart-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
