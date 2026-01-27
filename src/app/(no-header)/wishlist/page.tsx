"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  ShoppingCart,
  Trash2,
  X,
  Loader2,
  Package,
  AlertCircle,
} from "lucide-react";
import { wishlistApi, type WishlistItem } from "@/lib/api/wishlist.api";
import { cartApi } from "@/lib/api/cart.api";
import { useAuthModal } from "@/store/useAuthModalStore";
import { useCartStore } from "@/store/useCartStore";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";

export default function WishlistPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, openModal } = useAuthModal();
  const { addItem: addToLocalCart } = useCartStore();

  const [removingItemId, setRemovingItemId] = useState<string | null>(null);
  const [addingToCartId, setAddingToCartId] = useState<string | null>(null);

  // Fetch wishlist with Tanstack Query
  const {
    data: wishlistData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["wishlist"],
    queryFn: () => wishlistApi.getWishlist(),
    enabled: !!user, // Only fetch if user is logged in
    retry: 1,
    staleTime: 30000, // Consider data fresh for 30 seconds
  });

  // Remove item mutation
  const removeItemMutation = useMutation({
    mutationFn: (itemId: string) => wishlistApi.removeFromWishlist(itemId),
    onMutate: async (itemId) => {
      setRemovingItemId(itemId);

      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["wishlist"] });

      // Snapshot previous value
      const previousWishlist = queryClient.getQueryData(["wishlist"]);

      // Optimistically update
      queryClient.setQueryData(["wishlist"], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          data: {
            ...old.data,
            items: old.data.items.filter(
              (item: WishlistItem) => item.id !== itemId,
            ),
            totalItems: old.data.totalItems - 1,
          },
        };
      });

      return { previousWishlist };
    },
    onSuccess: () => {
      toast.success("Removed from wishlist");
    },
    onError: (err, itemId, context) => {
      // Rollback on error
      if (context?.previousWishlist) {
        queryClient.setQueryData(["wishlist"], context.previousWishlist);
      }
      toast.error("Failed to remove item");
    },
    onSettled: () => {
      setRemovingItemId(null);
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
    },
  });

  // Clear wishlist mutation
  const clearWishlistMutation = useMutation({
    mutationFn: () => wishlistApi.clearWishlist(),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["wishlist"] });
      const previousWishlist = queryClient.getQueryData(["wishlist"]);

      queryClient.setQueryData(["wishlist"], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          data: {
            ...old.data,
            items: [],
            totalItems: 0,
          },
        };
      });

      return { previousWishlist };
    },
    onSuccess: () => {
      toast.success("Wishlist cleared");
    },
    onError: (err, variables, context) => {
      if (context?.previousWishlist) {
        queryClient.setQueryData(["wishlist"], context.previousWishlist);
      }
      toast.error("Failed to clear wishlist");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
    },
  });

  // Add to cart handler
  const handleAddToCart = async (item: WishlistItem) => {
    const product = item.product;
    const availableStock = product.stock?.[0]?.quantity ?? 0;

    if (availableStock === 0) {
      toast.error("Product is out of stock");
      return;
    }

    setAddingToCartId(item.id);

    try {
      const cartItem = {
        id: crypto.randomUUID(),
        cartId: "local",
        productId: product.id,
        variantId: null,
        quantity: 1,
        product: {
          id: product.id,
          name: product.name,
          slug: product.slug,
          categoryId: product.category?.name ?? "",
          sellingPrice: Number(product.sellingPrice),
          basePrice: Number(product.basePrice),
          media: [
            {
              url: product.media?.[0]?.url ?? "/placeholder.jpg",
              altText: product.name,
              isActive: true,
            },
          ],
          stock: [
            {
              quantity: availableStock,
            },
          ],
        },
        variant: null,
      };

      addToLocalCart(cartItem);
      toast.success("Added to cart");

      if (user) {
        try {
          await cartApi.addToCart({
            productId: product.id,
            quantity: 1,
          });
          router.push("/cart");
        } catch (error) {
          console.error("Failed to sync with server:", error);
        }
      }

      // Optionally remove from wishlist after adding to cart
      // removeItemMutation.mutate(item.id);
    } catch (error: any) {
      toast.error(error.message || "Failed to add to cart");
    } finally {
      setAddingToCartId(null);
    }
  };

  // Move to cart (add to cart and remove from wishlist)
  const handleMoveToCart = async (item: WishlistItem) => {
    await handleAddToCart(item);
    removeItemMutation.mutate(item.id);
  };

  // Handle clear all
  const handleClearAll = () => {
    if (!wishlistData?.data?.items?.length) return;

    if (
      window.confirm("Are you sure you want to clear your entire wishlist?")
    ) {
      clearWishlistMutation.mutate();
    }
  };

  // Redirect to login if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
            <Heart className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Login Required
          </h1>
          <p className="text-gray-600 mb-8">
            Please login to view and manage your wishlist
          </p>
          <button
            onClick={() => openModal("login")}
            className="bg-black text-white px-8 py-3 rounded-full font-semibold hover:bg-gray-800 transition-colors"
          >
            Login Now
          </button>
        </motion.div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-gray-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading your wishlist...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Something went wrong
          </h1>
          <p className="text-gray-600 mb-8">
            {(error as any)?.message || "Failed to load wishlist"}
          </p>
          <button
            onClick={() => refetch()}
            className="bg-black text-white px-8 py-3 rounded-full font-semibold hover:bg-gray-800 transition-colors"
          >
            Try Again
          </button>
        </motion.div>
      </div>
    );
  }

  const wishlist = wishlistData?.data;
  const items = wishlist?.items || [];
  const isEmpty = items.length === 0;

  // Empty state
  if (isEmpty) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-md mx-auto"
          >
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-200 rounded-full flex items-center justify-center">
              <Heart className="w-12 h-12 text-gray-400" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Your Wishlist is Empty
            </h1>
            <p className="text-gray-600 mb-8">
              Start adding products you love to your wishlist
            </p>
            <Link
              href="/shop"
              className="inline-block bg-black text-white px-8 py-3 rounded-full font-semibold hover:bg-gray-800 transition-colors"
            >
              Continue Shopping
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              My Wishlist
            </h1>
            <button
              onClick={handleClearAll}
              disabled={clearWishlistMutation.isPending}
              className="text-red-600 hover:text-red-700 font-medium text-sm md:text-base disabled:opacity-50 flex items-center gap-2"
            >
              {clearWishlistMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              Clear All
            </button>
          </div>
          <p className="text-gray-600">
            {items.length} {items.length === 1 ? "item" : "items"}
          </p>
        </motion.div>

        {/* Wishlist Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence mode="popLayout">
            {items.map((item, index) => {
              const product = item.product;
              const inStock = (product.stock?.[0]?.quantity ?? 0) > 0;
              const discount =
                product.basePrice !== product.sellingPrice
                  ? Math.round(
                      ((Number(product.basePrice) -
                        Number(product.sellingPrice)) /
                        Number(product.basePrice)) *
                        100,
                    )
                  : 0;
              const isRemoving = removingItemId === item.id;
              const isAddingToCart = addingToCartId === item.id;

              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 relative group"
                >
                  {/* Remove Button */}
                  <button
                    onClick={() => removeItemMutation.mutate(item.id)}
                    disabled={isRemoving}
                    className="absolute top-3 right-3 z-10 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-lg"
                  >
                    {isRemoving ? (
                      <Loader2 className="w-5 h-5 animate-spin text-red-600" />
                    ) : (
                      <X className="w-5 h-5 text-red-600" />
                    )}
                  </button>

                  {/* Product Link */}
                  <Link href={`/products/${product.slug}`} className="block">
                    {/* Image */}
                    <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
                      {product.media?.[0]?.url ? (
                        <Image
                          src={product.media[0].url}
                          alt={product.name}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-16 h-16 text-gray-300" />
                        </div>
                      )}

                      {/* Badges */}
                      <div className="absolute top-3 left-3 flex flex-col gap-2">
                        {!inStock && (
                          <span className="bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                            Out of Stock
                          </span>
                        )}
                        {discount > 0 && (
                          <span className="bg-green-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                            {discount}% OFF
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>

                  {/* Product Info */}
                  <div className="p-4">
                    {product.category?.name && (
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                        {product.category.name}
                      </p>
                    )}

                    <Link href={`/products/${product.slug}`}>
                      <h3 className="font-bold text-lg mb-2 line-clamp-2 hover:text-gray-700 transition-colors">
                        {product.name}
                      </h3>
                    </Link>

                    {/* Price */}
                    <div className="flex items-baseline gap-2 mb-4">
                      <span className="text-xl font-bold text-gray-900">
                        ₹{Number(product.sellingPrice).toLocaleString()}
                      </span>
                      {discount > 0 && (
                        <span className="text-sm text-gray-400 line-through">
                          ₹{Number(product.basePrice).toLocaleString()}
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleMoveToCart(item)}
                        disabled={!inStock || isAddingToCart}
                        className="flex-1 bg-black text-white py-2.5 rounded-full font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {isAddingToCart ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <ShoppingCart className="w-4 h-4" />
                        )}
                        {inStock ? "Move to Cart" : "Out of Stock"}
                      </button>

                      <Link
                        href={`/products/${product.slug}`}
                        className="px-4 py-2.5 border-2 border-gray-300 rounded-full font-medium hover:border-gray-400 transition-colors"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Continue Shopping */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12 text-center"
        >
          <Link
            href="/products"
            className="inline-block bg-gray-200 text-gray-900 px-8 py-3 rounded-full font-semibold hover:bg-gray-300 transition-colors"
          >
            Continue Shopping
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
