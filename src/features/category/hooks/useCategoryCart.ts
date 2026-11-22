"use client";

import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { cartApi } from "@/lib/api/cart.api";
import type { Product, ProductStock, ProductVariant } from "@/lib/api/product.api";
import { mergeCartLines, type CartLineLike } from "@/lib/utils/cartItems";
import { useAuthModal } from "@/store/useAuthModalStore";
import { useCartStore } from "@/store/useCartStore";
import { useCartDrawer } from "@/store/useCartDrawer";
import { getCartItemStockState } from "@/lib/utils/cartStock";

export function useCategoryCart() {
  const { user } = useAuthModal();
  const queryClient = useQueryClient();
  const { open: openCartDrawer } = useCartDrawer();
  const addItemLocal = useCartStore((state) => state.addItem);
  const localItems = useCartStore((state) => state.items);
  const updateItemLocal = useCartStore((state) => state.updateQuantity);
  const removeItemLocal = useCartStore((state) => state.removeItem);

  const { data: cartData } = useQuery({
    queryKey: ["cartApi", user?.id],
    queryFn: async () => (await cartApi.getCart()).data,
    enabled: !!user,
    staleTime: 15_000,
    refetchOnWindowFocus: false,
  });

  const cartItems = useMemo(
    () => mergeCartLines(user ? (cartData?.items ?? []) : localItems),
    [user, cartData?.items, localItems],
  );

  const addMutation = useMutation({
    mutationFn: async ({ product, variant }: { product: Product; variant: ProductVariant | null }) => {
      const cartItem = {
        id: crypto.randomUUID(),
        cartId: "local",
        productId: product.id,
        variantId: variant?.id ?? null,
        quantity: 1,
        product: {
          id: product.id,
          name: product.name,
          slug: product.slug,
          categoryId: product.categoryId,
          isActive: product.isActive,
          hasVariants: product.hasVariants ?? false,
          allowOutOfStockOrders: product.allowOutOfStockOrders ?? false,
          sellingPrice: Number(product.sellingPrice),
          basePrice: Number(product.basePrice),
          media: [{
            url: product.media?.[0]?.url ?? "/placeholder.jpg",
            altText: product.name,
            isActive: true,
          }],
          stock: product.stock?.map((stock) => ({
            ...stock,
            lowStockThreshold: stock.lowStockThreshold ?? 0,
          })) ?? [],
        },
        variant: variant ? {
          id: variant.id,
          price: Number(variant.price),
          sellingPrice: Number(variant.sellingPrice),
          basePrice: Number(variant.basePrice),
          attributes: variant.attributes,
          size: variant.size ?? undefined,
          color: variant.color ?? undefined,
          fabric: variant.fabric ?? undefined,
          stock: variant.stock?.map((stock: ProductStock) => ({
            ...stock,
            lowStockThreshold: stock.lowStockThreshold ?? 0,
          })) ?? [],
        } : null,
      };

      if (!user) addItemLocal(cartItem);
      if (user) {
        await cartApi.addToCart({
          productId: product.id,
          variantId: variant?.id,
          quantity: 1,
        });
      }
    },
    onSuccess: () => {
      if (user) queryClient.invalidateQueries({ queryKey: ["cartApi"] });
      openCartDrawer();
    },
    onError: () => toast.error("Failed to add to cart"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      cartApi.updateCartItem(itemId, { quantity }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cartApi"] });
      openCartDrawer();
    },
    onError: () => toast.error("Failed to update quantity"),
  });

  const removeMutation = useMutation({
    mutationFn: (itemId: string) => cartApi.removeFromCart(itemId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cartApi"] }),
    onError: () => toast.error("Failed to remove item"),
  });

  const getCartItem = (productId: string, variantId: string | null) =>
    cartItems.find((item) =>
      String(item.productId ?? item.product?.id ?? "") === productId &&
      String(item.variantId ?? "") === (variantId ?? ""),
    ) ?? null;

  const addProduct = (product: Product, variant: ProductVariant | null) =>
    addMutation.mutate({ product, variant });

  const increaseQuantity = (
    product: Product,
    variant: ProductVariant | null,
    cartItem: CartLineLike | null,
  ) => {
    if (!cartItem) {
      addProduct(product, variant);
      return;
    }
    const stock = getCartItemStockState(cartItem);
    const nextQuantity = Number(cartItem.quantity ?? 0) + 1;
    if (nextQuantity > stock.maxAllowed) {
      toast.error(
        stock.isLimited
          ? "Only one item can be ordered at this time."
          : "Only " + stock.maxAllowed + " item(s) are available.",
      );
      return;
    }
    if (user) updateMutation.mutate({ itemId: String(cartItem.id), quantity: nextQuantity });
    else updateItemLocal(String(cartItem.id), nextQuantity);
  };

  const decreaseQuantity = (cartItem: CartLineLike | null) => {
    if (!cartItem) return;
    const quantity = Number(cartItem.quantity ?? 0) - 1;
    if (quantity <= 0) {
      if (user) removeMutation.mutate(String(cartItem.id));
      else removeItemLocal(String(cartItem.id));
      return;
    }
    if (user) updateMutation.mutate({ itemId: String(cartItem.id), quantity });
    else updateItemLocal(String(cartItem.id), quantity);
  };

  return {
    user,
    cartItems,
    getCartItem,
    addProduct,
    increaseQuantity,
    decreaseQuantity,
    isAddingToCart: addMutation.isPending,
  };
}
