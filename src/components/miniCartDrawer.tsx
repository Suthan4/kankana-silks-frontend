"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useCartDrawer } from "@/store/useCartDrawer";
import { useCartStore } from "@/store/useCartStore";
import Image from "next/image";
import { X, ShoppingBag, Trash2, Plus, Minus, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { cartApi } from "@/lib/api/cart.api";
import { useAuthModal } from "@/store/useAuthModalStore";
import { toast } from "sonner";
import { useEffect, useState, useMemo } from "react";
import { extractVariantAttributes } from "@/lib/utils/variant.utils";
import { mergeCartLines } from "@/lib/utils/cartItems";

export default function MiniCartDrawer() {
  const { isOpen, close } = useCartDrawer();
  const {
    items: localItems,
    updateQuantity: updateQuantityLocal,
    removeItem: removeItemLocal,
  } = useCartStore();
  const { user } = useAuthModal();
  const router = useRouter();
  const queryClient = useQueryClient();

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

  /* -------------------- PREVENT BODY SCROLL -------------------- */
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

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
    queryKey: ["cartApi", user?.id],
    queryFn: async () => (await cartApi.getCart()).data,
    enabled: !!user,
    staleTime: 15_000,
    refetchOnWindowFocus: false,
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

  const getStockQty = (item: any): number => {
    // 1. Variant stock
    if (
      item?.variant?.stock &&
      Array.isArray(item.variant.stock) &&
      item.variant.stock.length > 0
    ) {
      return Number(item.variant.stock[0].quantity) || 0;
    }

    // 2. Product stock
    if (
      item?.product?.stock &&
      Array.isArray(item.product.stock) &&
      item.product.stock.length > 0
    ) {
      // if variantId exists → match
      if (item.variantId) {
        const match = item.product.stock.find(
          (s: any) => s.variantId === item.variantId,
        );
        return match ? Number(match.quantity) || 0 : 0;
      }

      // Simple products use their product-level inventory.
      return Number(item.product.stock[0].quantity) || 0;
    }

    return 0;
  };

  const getItemImage = (item: any): string => {
    return (
      item?.product?.media?.[0]?.url ||
      (typeof item?.product?.media?.[0] === "string"
        ? item?.product?.media?.[0]
        : null) ||
      "/placeholder.jpg"
    );
  };

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
      const queryKey = ["cartApi", user?.id];
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
      toast.error("Failed to update quantity. Please try again.");
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["cartApi"] }),
  });

  const removeItemMutation = useMutation({
    mutationFn: async (itemId: string) => await cartApi.removeFromCart(itemId),
    onMutate: async (itemId) => {
      const queryKey = ["cartApi", user?.id];
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
      queryClient.invalidateQueries({ queryKey: ["cartApi"] });
    },
  });

  const handleUpdateQuantity = (item: any, newQty: number) => {
    if (newQty <= 0) {
      handleRemove(item);
      return;
    }

    const stockQty = getStockQty(item);
    if (
      item.product?.allowOutOfStockOrders !== true &&
      stockQty > 0 &&
      newQty > stockQty
    ) {
      toast.error(`Only ${stockQty} item(s) available in stock`);
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
            onClick={close}
            className="fixed inset-0 bg-black/60 backdrop-blur-[2px] z-[150]"
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
              fixed z-[151] bg-white shadow-2xl flex flex-col overflow-hidden
              ${
                isMobile
                  ? "bottom-0 left-0 right-0 max-h-[85vh] rounded-t-3xl"
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
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-white">
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
            <div className="flex-1 overflow-y-auto px-5 py-3 divide-y divide-gray-100">
              {displayItems.length === 0 && user && isCartLoading ? (
                <div
                  role="status"
                  aria-live="polite"
                  className="flex flex-col items-center justify-center h-full py-16 text-center"
                >
                  <ShoppingBag className="w-7 h-7 text-gray-400 mb-3" />
                  <p className="text-sm font-medium text-gray-800">
                    Refreshing your bag…
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    This should only take a moment.
                  </p>
                </div>
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
                    className="px-5 py-2.5 bg-black text-white text-xs font-semibold rounded-lg hover:bg-gray-800 transition"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                displayItems.map((item: any) => {
                  const itemPrice = getItemPrice(item);
                  const imageUrl = getItemImage(item);
                  const stockQty = getStockQty(item);
                  const isMaxStock =
                    (item.product?.allowOutOfStockOrders !== true &&
                      stockQty > 0) ||
                    Number(item.quantity) >= stockQty;
                  const variantAttrs = item?.variant
                    ? extractVariantAttributes(item.variant)
                    : [];

                  return (
                    <div
                      key={item.id}
                      className="py-4 flex gap-3.5 items-start group"
                    >
                      {/* PRODUCT THUMBNAIL */}
                      <div className="relative w-18 h-22 sm:w-20 sm:h-24 shrink-0 rounded-lg overflow-hidden bg-gray-50 border border-gray-100">
                        <Image
                          src={imageUrl}
                          alt={item.product?.name || "Cart item"}
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      </div>

                      {/* PRODUCT DETAILS */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs sm:text-sm font-medium text-gray-900 line-clamp-2 leading-snug">
                          {item.product?.name || "Product"}
                        </h4>

                        {/* VARIANT ATTRIBUTES */}
                        {variantAttrs.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {variantAttrs.map((attr, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center text-[10px] bg-neutral-100 text-neutral-600 px-1.5 py-0.5 rounded font-normal"
                              >
                                {attr.key}: {attr.value}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* STOCK AVAILABILITY */}
                        {stockQty > 0 && stockQty <= 5 && (
                          <div className="mt-1">
                            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-amber-800 bg-amber-50 border border-amber-200/70 px-2 py-0.5 rounded-md">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                              Only {stockQty} left in stock
                            </span>
                          </div>
                        )}
                        {stockQty === 0 && (
                          <div className="mt-1">
                            <span className="inline-flex items-center text-[11px] font-medium text-red-700 bg-red-50 border border-red-200/70 px-2 py-0.5 rounded-md">
                              Out of stock
                            </span>
                          </div>
                        )}

                        {/* PRICE & QUANTITY CONTROLS */}
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center border border-gray-200 rounded-md bg-white">
                            <button
                              onClick={() =>
                                handleUpdateQuantity(
                                  item,
                                  Number(item.quantity) - 1,
                                )
                              }
                              disabled={
                                Number(item.quantity) <= 1 ||
                                updateQuantityMutation.isPending
                              }
                              aria-label="Decrease quantity"
                              className="p-1 sm:p-1.5 text-gray-500 hover:text-black transition disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-2 text-xs font-semibold min-w-[20px] text-center text-gray-800 select-none">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                handleUpdateQuantity(
                                  item,
                                  Number(item.quantity) + 1,
                                )
                              }
                              disabled={
                                isMaxStock ||
                                (stockQty === 0 &&
                                  item.product?.allowOutOfStockOrders !==
                                    true) ||
                                updateQuantityMutation.isPending
                              }
                              aria-label="Increase quantity"
                              className="p-1 sm:p-1.5 text-gray-500 hover:text-black transition disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="font-semibold text-xs sm:text-sm text-gray-900">
                              ₹
                              {(
                                itemPrice * (Number(item.quantity) || 1)
                              ).toLocaleString("en-IN")}
                            </span>
                            <button
                              onClick={() => handleRemove(item)}
                              disabled={removeItemMutation.isPending}
                              aria-label="Remove item"
                              className="text-gray-400 hover:text-red-500 transition p-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* FOOTER */}
            {displayItems.length > 0 && (
              <div className="p-5 border-t border-gray-100 bg-white/95 backdrop-blur-xs space-y-3">
                {/* SUBTOTAL ROW */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">
                    Subtotal ({totalItems} items)
                  </span>
                  <span className="font-bold text-base text-gray-900">
                    ₹{subtotal.toLocaleString("en-IN")}
                  </span>
                </div>
                <p className="text-[11px] text-gray-400">
                  Shipping and taxes calculated at checkout.
                </p>

                {/* ACTION BUTTONS */}
                <div className="flex flex-col gap-2 pt-1">
                  <button
                    onClick={() => {
                      close();
                      router.push("/checkout");
                    }}
                    className="w-full bg-black text-white hover:bg-neutral-800 transition-colors py-3 rounded-xl font-semibold text-xs sm:text-sm shadow-sm flex items-center justify-center gap-2"
                  >
                    <span>Proceed to Checkout</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      close();
                      router.push("/cart");
                    }}
                    className="w-full bg-white text-black border border-gray-300 hover:bg-gray-50 transition-colors py-2.5 rounded-xl font-medium text-xs sm:text-sm"
                  >
                    View Full Cart
                  </button>

                  <button
                    onClick={close}
                    className="text-xs text-gray-500 hover:text-gray-900 text-center py-1 transition-colors"
                  >
                    Continue Shopping
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
