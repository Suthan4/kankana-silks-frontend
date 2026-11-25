"use client";

import { useModalScrollLock } from "@/hooks/useModalScrollLock";
import { motion, AnimatePresence } from "framer-motion";
import { useCartDrawer } from "@/store/useCartDrawer";
import { useCartStore } from "@/store/useCartStore";
import { X, ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { cartApi } from "@/lib/api/cart.api";
import { useAuthModal } from "@/store/useAuthModalStore";
import { toast } from "sonner";
import { useEffect, useState, useMemo, useCallback } from "react";
import { extractVariantAttributes } from "@/lib/utils/variant.utils";
import { mergeCartLines } from "@/lib/utils/cartItems";
import {
  getCartItemStockState,
  canIncreaseCartItemQuantity,
} from "@/lib/utils/cartStock";
import { cartKeys, cartQueryPolicy } from "@/lib/query/cartQuery";
import { CartDrawerSkeleton } from "@/features/cart/components/CartDrawerSkeleton";
import { MiniCartItemRow } from "@/features/cart/components/MiniCartItemRow";
import { MiniCartFooter } from "@/features/cart/components/MiniCartFooter";

export default function MiniCartDrawer() {
  const { isOpen, close } = useCartDrawer();
  const localItems = useCartStore((state) => state.items);
  const updateQuantityLocal = useCartStore((state) => state.updateQuantity);
  const removeItemLocal = useCartStore((state) => state.removeItem);
  const { user } = useAuthModal();
  const router = useRouter();
  const queryClient = useQueryClient();
  const handleCheckoutNavigation = useCallback(() => {
    close();
    router.push("/checkout");
  }, [close, router]);
  const handleCartNavigation = useCallback(() => {
    close();
    router.push("/cart");
  }, [close, router]);

  /* -------------------- MOBILE DETECTION -------------------- */
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth < 768;
    }
    return false;
  });

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useModalScrollLock(isOpen);

  /* -------------------- ESCAPE KEY HANDLER -------------------- */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        close();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, close]);

  /* -------------------- FETCH CART -------------------- */
  const { data: cartData, isLoading: isCartLoading } = useQuery({
    queryKey: cartKeys.user(user?.id),
    queryFn: async () => (await cartApi.getCart()).data,
    enabled: !!user,
    ...cartQueryPolicy,
  });

  // Never mix stale guest rows with a signed-in server cart. Normalize legacy
  // duplicate product/variant rows so the drawer shows one line and summed qty.
  const apiItems = cartData?.items ?? [];
  const displayItems = useMemo(
    () => mergeCartLines(user ? apiItems : localItems),
    [user, apiItems, localItems],
  );

  /* -------------------- PRICE & ITEM HELPERS -------------------- */
  const getItemPrice = (item: any): number => {
    if (
      item?.variant?.sellingPrice != null &&
      !isNaN(Number(item.variant.sellingPrice))
    ) {
      return Number(item.variant.sellingPrice);
    }
    if (item?.variant?.price != null && !isNaN(Number(item.variant.price))) {
      return Number(item.variant.price);
    }
    return Number(item?.product?.sellingPrice ?? 0);
  };

  const getItemImage = (item: any): string => {
    const candidate =
      item?.variant?.image ??
      item?.variant?.imageUrl ??
      item?.variant?.thumbnail ??
      item?.variant?.images?.[0]?.url ??
      item?.variant?.images?.[0]?.src ??
      item?.product?.image ??
      item?.product?.imageUrl ??
      item?.product?.thumbnail ??
      item?.product?.featuredImage ??
      item?.product?.coverImage ??
      item?.product?.images?.[0]?.url ??
      item?.product?.images?.[0]?.src ??
      item?.product?.media?.[0]?.url ??
      item?.image ??
      item?.thumbnail ??
      "/placeholder-product.png";

    if (typeof candidate === "string" && candidate.trim()) {
      return candidate;
    }

    if (candidate && typeof candidate === "object") {
      return (
        candidate.url ||
        candidate.src ||
        candidate.image ||
        candidate.thumbnail ||
        "/placeholder-product.png"
      );
    }

    return "/placeholder-product.png";
  };

  const getStockState = (item: any) => getCartItemStockState(item);

  const subtotal = useMemo(
    () =>
      displayItems.reduce(
        (s: number, i: any) => s + getItemPrice(i) * (Number(i.quantity) || 1),
        0,
      ),
    [displayItems],
  );

  const totalItems = useMemo(
    () =>
      displayItems.reduce(
        (s: number, i: any) => s + (Number(i.quantity) || 1),
        0,
      ),
    [displayItems],
  );

  /* -------------------- MUTATIONS -------------------- */
  const updateQuantityMutation = useMutation({
    mutationFn: async ({
      itemId,
      quantity,
    }: {
      itemId: string;
      quantity: number;
    }) => {
      if (quantity <= 0) return await cartApi.removeFromCart(itemId);
      return await cartApi.updateCartItem(itemId, { quantity });
    },
    onMutate: async ({ itemId, quantity }) => {
      const queryKey = cartKeys.user(user?.id);
      await queryClient.cancelQueries({ queryKey });
      const previousCart = queryClient.getQueryData<any>(queryKey);
      if (previousCart?.items) {
        const target = previousCart.items.find(
          (item: any) => String(item.id) === String(itemId),
        );
        let items = previousCart.items;
        if (target) {
          const productId = String(
            target.productId ?? target.product?.id ?? "",
          );
          const variantId = String(
            target.variantId ?? target.variant?.id ?? "",
          );
          let kept = false;
          items = previousCart.items.flatMap((item: any) => {
            const sameLine =
              String(item.productId ?? item.product?.id ?? "") === productId &&
              String(item.variantId ?? item.variant?.id ?? "") === variantId;
            if (!sameLine) return [item];
            if (kept) return [];
            kept = true;
            return [{ ...item, quantity }];
          });
        }
        const subtotal = items.reduce((sum: number, item: any) => {
          const unitPrice = Number(
            item.variant?.sellingPrice ??
              item.variant?.price ??
              item.product?.sellingPrice ??
              0,
          );
          return sum + unitPrice * Number(item.quantity || 0);
        }, 0);
        queryClient.setQueryData(queryKey, {
          ...previousCart,
          items,
          totalItems: items.reduce(
            (sum: number, item: any) => sum + Number(item.quantity || 0),
            0,
          ),
          subtotal,
        });
      }
      return { previousCart, queryKey };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousCart)
        queryClient.setQueryData(context.queryKey, context.previousCart);
      const message =
        (_error as any)?.response?.data?.message ||
        (_error as any)?.message ||
        "Failed to update quantity. Please try again.";
      toast.error(message);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: cartKeys.all }),
  });

  const removeItemMutation = useMutation({
    mutationFn: async (itemId: string) => await cartApi.removeFromCart(itemId),
    onMutate: async (itemId) => {
      const queryKey = cartKeys.user(user?.id);
      await queryClient.cancelQueries({ queryKey });
      const previousCart = queryClient.getQueryData<any>(queryKey);
      if (previousCart?.items) {
        const target = previousCart.items.find(
          (item: any) => String(item.id) === String(itemId),
        );
        if (target) {
          const productId = String(
            target.productId ?? target.product?.id ?? "",
          );
          const variantId = String(
            target.variantId ?? target.variant?.id ?? "",
          );
          const items = previousCart.items.filter(
            (item: any) =>
              String(item.productId ?? item.product?.id ?? "") !== productId ||
              String(item.variantId ?? item.variant?.id ?? "") !== variantId,
          );
          const subtotal = items.reduce((sum: number, item: any) => {
            const unitPrice = Number(
              item.variant?.sellingPrice ??
                item.variant?.price ??
                item.product?.sellingPrice ??
                0,
            );
            return sum + unitPrice * Number(item.quantity || 0);
          }, 0);
          queryClient.setQueryData(queryKey, {
            ...previousCart,
            items,
            totalItems: items.reduce(
              (sum: number, item: any) => sum + Number(item.quantity || 0),
              0,
            ),
            subtotal,
          });
        }
      }
      return { previousCart, queryKey };
    },
    onSuccess: () => {
      toast.success("Item removed");
    },
    onError: (_error, _itemId, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(context.queryKey, context.previousCart);
      }
      toast.error("Failed to remove item. Please try again.");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.all });
    },
  });

  const handleUpdateQuantity = (item: any, newQty: number) => {
    if (newQty <= 0) {
      handleRemove(item);
      return;
    }

    const stockState = getStockState(item);
    const currentQuantity = Number(item.quantity) || 0;
    if (newQty > currentQuantity && !canIncreaseCartItemQuantity(item, newQty)) {
      toast.error(
        !stockState.hasStockData
          ? "Stock availability could not be verified. Please refresh your cart."
          : stockState.isOutOfStock
            ? "This product is out of stock."
            : stockState.isLimited
              ? "Only 1 item can be ordered for this low-stock product."
              : `Only ${stockState.maxAllowed} item(s) are available in stock.`,
      );
      return;
    }
    if (newQty > stockState.maxAllowed) {
      toast.error(
        stockState.isLimited
          ? "Only 1 item can be ordered for this low-stock product."
          : `Only ${stockState.available} item(s) are available in stock.`,
      );
      return;
    }

    if (user) {
      updateQuantityMutation.mutate({ itemId: item.id, quantity: newQty });
    } else {
      updateQuantityLocal(item.id, newQty);
    }
  };

  const handleRemove = (item: any) => {
    if (user) {
      removeItemMutation.mutate(item.id);
    } else {
      removeItemLocal(item.id);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* BACKDROP OVERLAY */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onPointerDown={(event) => {
              if (event.target === event.currentTarget) close();
            }}
            className="ios-modal-backdrop ios-modal-motion fixed inset-0 bg-black/60 z-[150]"
            aria-hidden="true"
          />

          {/* DRAWER (Desktop: Right -> Left, Mobile: Bottom -> Top) */}
          <motion.div
            initial={isMobile ? { y: "100%" } : { x: "100%" }}
            animate={isMobile ? { y: 0 } : { x: 0 }}
            exit={isMobile ? { y: "100%" } : { x: "100%" }}
            transition={{ type: "spring", stiffness: 340, damping: 34 }}
            drag={isMobile ? "y" : false}
            dragDirectionLock
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 80 || info.velocity.y > 400) {
                close();
              }
            }}
            className={`
            ios-modal-panel ios-cart-drawer ios-modal-motion fixed z-[151] bg-surface-elevated shadow-brand-float flex flex-col overflow-hidden
              ${
                isMobile
                  ? "bottom-0 left-0 right-0 max-h-[85dvh] rounded-t-3xl"
                  : "right-0 top-0 h-full w-full sm:w-[420px]"
              }
            `}
          >
            {/* MOBILE DRAG HANDLE */}
            {isMobile && (
              <div className="w-full pt-3 pb-1 flex justify-center cursor-grab active:cursor-grabbing touch-none select-none">
                <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
              </div>
            )}
            {/* HEADER */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-surface">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-semibold text-base text-gray-900 leading-tight">
                    Shopping Bag
                  </h2>
                  <p className="text-xs text-gray-500">
                    {totalItems} {totalItems === 1 ? "item" : "items"}
                  </p>
                </div>
              </div>
              <button
                onClick={close}
                aria-label="Close cart drawer"
                className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {/* BODY / ITEMS LIST */}
            <div className="ios-modal-content flex-1 overflow-y-auto px-5 py-3 divide-y divide-gray-100">
              {displayItems.length === 0 && user && isCartLoading ? (
                <CartDrawerSkeleton />
              ) : displayItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-16 text-center">
                  <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 mb-4">
                    <ShoppingBag className="w-8 h-8" />
                  </div>
                  <h3 className="font-medium text-gray-800 text-base mb-1">
                    Your bag is empty
                  </h3>
                  <p className="text-xs text-gray-500 max-w-[220px] mb-6">
                    Add items to your cart to see them here.
                  </p>
                  <button
                    onClick={close}
                    className="brand-button rounded-lg px-5 py-2.5 text-xs"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                displayItems.map((item: any) => {
                  const itemPrice = getItemPrice(item);
                  const imageUrl = getItemImage(item);
                  const stockState = getStockState(item);
                  const stockQty = stockState.available;
                  const cartQuantity = Math.max(0, Number(item.quantity) || 0);

                  // Remaining inventory after considering this customer's cart.
                  const remainingStock = Math.max(0, stockQty - cartQuantity);

                  // Customer has added the only physically available item.
                  const isLastOneInCart =
                    stockState.hasStockData &&
                    stockQty === 1 &&
                    cartQuantity === 1;

                  // Other customers can still purchase the remaining quantity.
                  const hasOnlyOneRemaining =
                    stockState.hasStockData && remainingStock === 1;
                  const variantAttrs = item?.variant
                    ? extractVariantAttributes(item.variant)
                    : [];

                  return (
                    <MiniCartItemRow
                      key={item.id}
                      item={item}
                      itemPrice={itemPrice}
                      imageUrl={imageUrl}
                      stockState={stockState}
                      isLastOneInCart={isLastOneInCart}
                      hasOnlyOneRemaining={hasOnlyOneRemaining}
                      remainingStock={remainingStock}
                      variantAttrs={variantAttrs}
                      isUpdating={updateQuantityMutation.isPending}
                      isRemoving={removeItemMutation.isPending}
                      onQuantityChange={(quantity) => handleUpdateQuantity(item, quantity)}
                      onRemove={() => handleRemove(item)}
                    />
                  );
                })
              )}
            </div>
            {displayItems.length > 0 && (
              <MiniCartFooter
                totalItems={totalItems}
                subtotal={subtotal}
                onCheckout={handleCheckoutNavigation}
                onViewCart={handleCartNavigation}
                onClose={close}
              />
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
