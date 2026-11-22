"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Product, ProductVariant } from "@/lib/api/product.api";
import { cartApi } from "@/lib/api/cart.api";
import { useAuthModal } from "@/store/useAuthModalStore";
import { useCartStore } from "@/store/useCartStore";
import { useCartDrawer } from "@/store/useCartDrawer";
import { trackAddToCart } from "@/lib/analytics";
import { cartKeys } from "@/lib/query/cartQuery";

export function useProductCart() {
  const { user } = useAuthModal();
  const { addItem: addToLocalCart } = useCartStore();
  const { open: openCartDrawer } = useCartDrawer();
  const queryClient = useQueryClient();

  const addToCartMutation = useMutation({
    mutationFn: async ({ product, variant, quantity }: {
      product: Product;
      variant?: ProductVariant | null;
      quantity: number;
    }) => {
      const cartItem = {
        id: crypto.randomUUID(),
        cartId: "local",
        productId: product.id,
        variantId: variant?.id,
        quantity,
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
          sellingPrice: Number(variant.sellingPrice),
          basePrice: Number(variant.basePrice),
          size: variant.size ?? undefined,
          color: variant.color ?? undefined,
          fabric: variant.fabric ?? undefined,
          attributes: variant.attributes,
          stock: variant.stock?.map((stock) => ({
            ...stock,
            lowStockThreshold: stock.lowStockThreshold ?? 0,
          })),
        } : undefined,
      };

      if (!user) addToLocalCart(cartItem);
      if (user) await cartApi.addToCart({
        productId: product.id,
        variantId: variant?.id,
        quantity,
      });
    },
    onSuccess: (_data, variables) => {
      trackAddToCart({
        item_id: variables.product.id,
        item_name: variables.product.name,
        item_category: variables.product.category?.name,
        item_variant: variables.variant?.id,
        price: Number(variables.variant?.sellingPrice ?? variables.variant?.price ?? variables.product.sellingPrice),
        quantity: variables.quantity,
      });
      if (user) queryClient.invalidateQueries({ queryKey: cartKeys.all });
      toast.success("Added to cart");
      openCartDrawer();
    },
    onError: () => toast.error("Failed to add to cart"),
  });

  return { addToCartMutation };
}
