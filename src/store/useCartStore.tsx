// import { create } from "zustand";
// import { persist, createJSONStorage } from "zustand/middleware";

// export interface CartItem {
//   id: string;
//   productId: string;
//   variantId?: string;
//   categoryId?: string; // ✅ ADDED for coupon API
//   name: string;
//   slug: string;
//   price: number;
//   basePrice: number;
//   quantity: number;
//   image?: string;
//   variant?: {
//     size?: string;
//     color?: string;
//     fabric?: string;
//     attributes?: Record<string, string>;
//   };
//   stock: number;
// }

// export interface Coupon {
//   code: string;

//   // from backend coupon object
//   discountType: "PERCENTAGE" | "FIXED";
//   discountValue: number; // ex: 19.99 or 500

//   minOrderValue?: number;
//   maxDiscountAmount?: number | null;

//   validFrom?: string;
//   validUntil?: string;
//   isActive?: boolean;

//   // calculated from validateCoupon API
//   discountAmount?: number; // ex: 10994.5 (amount reduced)
//   finalAmount?: number; // ex: 44005.5 (after discount)
// }

// interface CartState {
//   items: CartItem[];
//   appliedCoupon: Coupon | null;

//   // Actions
//   addItem: (item: CartItem) => void;
//   removeItem: (id: string) => void;
//   updateQuantity: (id: string, quantity: number) => void;
//   clearCart: () => void;
//   applyCoupon: (coupon: Coupon) => void;
//   removeCoupon: () => void;

//   // Computed values
//   getTotalItems: () => number;
//   getSubtotal: () => number;
//   getDiscount: () => number;
//   getTotal: () => number;

//   // Sync with server after login
//   syncWithServer: (serverItems: CartItem[]) => void;
// }

// export const useCartStore = create<CartState>()(
//   persist(
//     (set, get) => ({
//       items: [],
//       appliedCoupon: null,

//       addItem: (item) => {
//         set((state) => {
//           const existingItem = state.items.find(
//             (i) =>
//               i.productId === item.productId && i.variantId === item.variantId,
//           );

//           if (existingItem) {
//             return {
//               items: state.items.map((i) =>
//                 i.id === existingItem.id
//                   ? {
//                       ...i,
//                       quantity: Math.min(i.quantity + item.quantity, i.stock),
//                     }
//                   : i,
//               ),
//             };
//           }

//           return {
//             items: [...state.items, { ...item, id: crypto.randomUUID() }],
//           };
//         });
//       },

//       removeItem: (id) => {
//         set((state) => ({
//           items: state.items.filter((item) => item.id !== id),
//         }));
//       },

//       updateQuantity: (id, quantity) => {
//         set((state) => ({
//           items: state.items.map((item) =>
//             item.id === id
//               ? {
//                   ...item,
//                   quantity: Math.min(Math.max(1, quantity), item.stock),
//                 }
//               : item,
//           ),
//         }));
//       },

//       clearCart: () => {
//         set({ items: [], appliedCoupon: null });
//       },

//       applyCoupon: (coupon) => {
//   if (coupon.validUntil && new Date(coupon.validUntil) < new Date()) {
//     throw new Error("Coupon has expired");
//   }

//   set({ appliedCoupon: coupon });

//       },

//       removeCoupon: () => {
//         set({ appliedCoupon: null });
//       },

//       getTotalItems: () => {
//         return get().items.reduce((total, item) => total + item.quantity, 0);
//       },

//       getSubtotal: () => {
//         return get().items.reduce(
//           (total, item) => total + item.price * item.quantity,
//           0,
//         );
//       },

//       getDiscount: () => {
//         const { appliedCoupon } = get();
//         return appliedCoupon?.discountAmount ?? 0;
//       },

//       getTotal: () => {
//         const subtotal = get().getSubtotal();
//         const discount = get().getDiscount();
//         return Math.max(0, subtotal - discount);
//       },

//       syncWithServer: (serverItems) => {
//         set({ items: serverItems });
//       },
//     }),
//     {
//       name: "cart-storage",
//       storage: createJSONStorage(() => localStorage),
//     },
//   ),
// );
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

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

    media?: { url: string; altText?: string; isActive?: boolean }[];
    stock?: { quantity: number }[];
  };

  variant?: {
    id: string;
    size?: string;
    color?: string;
    fabric?: string;
    price?: number;
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
        // ✅ Validate that categoryId is provided
        if (!item?.product?.categoryId) {
          console.error("❌ categoryId is required for cart items");
          return;
        }

        set((state) => {
          const existingItem = state.items.find(
            (i) =>
              i.productId === item.productId && i.variantId === item.variantId,
          );

          if (existingItem) {
            return {
              items: state.items.map((i) =>
                i.id === existingItem.id
                  ? {
                      ...i,
                      quantity: Math.min(i.quantity + item.quantity),
                    }
                  : i,
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
          items: state.items.map((i) =>
            i.id === id ? { ...i, quantity: Math.max(1, quantity) } : i,
          ),
        }));
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
          const price = Number(item?.variant?.price ?? item.product?.sellingPrice ?? 0);
          return sum + price * item.quantity;
        }, 0),

      getDiscount: () => Number(get().appliedCoupon?.discountAmount ?? 0),

      getTotal: () => {
        const subtotal = get().getSubtotal();
        const discount = get().getDiscount();
        return Math.max(0, subtotal - discount);
      },

      syncWithServer: (serverItems) => {
        set({ items: serverItems, appliedCoupon:null });
      },
    }),
    {
      name: "cart-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);