"use client";

import {
  Heart,
  Trash2,
  ShoppingCart,
  ArrowRight,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useWishlist } from "@/hooks/useWishlist";
import { wishlistApi } from "@/lib/api/wishlist.api";
import { toast } from "sonner";
import { useAuthModal } from "@/store/useAuthModalStore";
import { useQueryClient } from "@tanstack/react-query";
import { getCartItemStockState } from "@/lib/utils/cartStock";

const ProductRequestModal = dynamic(
  () => import("@/components/productRequestModal"),
);

export default function WishlistPage() {
  const router = useRouter();
  const { user, openModal } = useAuthModal();
  const queryClient = useQueryClient();

  const {
    items,
    wishlistCount,
    isLoading,
    isError,
    error,
    removeFromWishlist,
    refetch,
  } = useWishlist();

  const [removingItemId, setRemovingItemId] = useState<string | null>(null);
  const [addingToCartId, setAddingToCartId] = useState<string | null>(null);
  const [requestProduct, setRequestProduct] = useState<{
    id: string;
    name: string;
  } | null>(null);

  /* ------------------ AUTH CHECK ------------------ */

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Heart className="w-12 h-12 mx-auto text-red-500 mb-4" />
          <h1 className="text-xl font-futura-bold mb-2">Login Required</h1>
          <button
            onClick={() => openModal("login")}
            className="bg-black text-white px-6 py-2 rounded-lg"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  /* ------------------ LOADING ------------------ */

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin" />
      </div>
    );
  }

  /* ------------------ ERROR ------------------ */

  if (isError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-red-500 mb-3">
          {(error as any)?.message || "Failed to load wishlist"}
        </p>
        <button type="button" onClick={() => refetch()} className="underline">
          Retry
        </button>
      </div>
    );
  }

  /* ------------------ HANDLERS ------------------ */

  const removeItem = async (itemId: string) => {
    setRemovingItemId(itemId);
    await removeFromWishlist(itemId);
    setRemovingItemId(null);
  };

  const handleMoveToCart = async (item: (typeof items)[number]) => {
    setAddingToCartId(item.id);
    try {
      const result = await wishlistApi.moveToCart(item.id);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["cartApi"] }),
        queryClient.invalidateQueries({ queryKey: ["wishlist", user?.id] }),
      ]);
      toast.success(result.message || "Item moved to cart.");
      router.push("/cart");
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          "Unable to move item to cart.",
      );
    } finally {
      setAddingToCartId(null);
    }
  };

  /* ------------------ EMPTY ------------------ */

  if (!items.length) {
    return (
      <div className="text-center py-16">
        <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-futura-bold mb-2">
          Your Wishlist is Empty
        </h2>
        <button
          onClick={() => router.push("/shop")}
          className="mt-4 bg-black text-white px-6 py-2 rounded-lg flex items-center gap-2 mx-auto"
        >
          Start Shopping <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  /* ------------------ UI ------------------ */

  return (
    <div className="min-h-screen">
      {/* HEADER */}
      <div className="bg-white border-b p-4 lg:p-6 sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto flex justify-between">
          <div>
            <h1 className="text-2xl font-futura-bold">My Wishlist</h1>
            <p className="text-sm text-gray-500">{wishlistCount} items saved</p>
          </div>

          <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center">
            <Heart className="text-white fill-white" />
          </div>
        </div>
      </div>

      {/* GRID */}
      <div className="p-4 max-w-4xl mx-auto">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => {
            const product = item.product;
            const image = product.media?.[0]?.url || "/placeholder.jpg";
            const stockState = getCartItemStockState({
              product,
              quantity: 1,
              allowOutOfStockOrders: product.allowOutOfStockOrders,
            });
            const inStock = !stockState.isOutOfStock;

            const isRemoving = removingItemId === item.id;
            const isAdding = addingToCartId === item.id;

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border overflow-hidden"
              >
                <div className="relative">
                  <img
                    src={image}
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />

                  {/* REMOVE */}
                  <button
                    onClick={() => removeItem(item.id)}
                    className="absolute top-3 right-3 bg-white p-2 rounded-full"
                  >
                    {isRemoving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4 text-red-600" />
                    )}
                  </button>

                  {!inStock && (
                    <div className="absolute bottom-2 left-2 right-2 bg-red-500 text-white text-xs text-center py-1 rounded">
                      Out of Stock
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <h3 className="font-semibold mb-2 line-clamp-2">
                    {product.name}
                  </h3>

                  <p className="font-futura-bold text-lg">
                    ₹{Number(product.sellingPrice).toLocaleString("en-IN")}
                  </p>

                  <button
                    onClick={() => {
                      if (!inStock) {
                        setRequestProduct({
                          id: product.id,
                          name: product.name,
                        });
                        return;
                      }

                      handleMoveToCart(item);
                    }}
                    disabled={inStock && isAdding}
                    className="mt-3 w-full bg-black text-white py-2 rounded-lg disabled:opacity-50"
                  >
                    {inStock && isAdding ? (
                      <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                    ) : inStock ? (
                      <>
                        <ShoppingCart className="inline w-4 h-4 mr-1" />
                        Move to Cart
                      </>
                    ) : (
                      <>
                        <AlertCircle className="inline w-4 h-4 mr-1" />
                        Request Product
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {requestProduct && (
        <ProductRequestModal
          isOpen={Boolean(requestProduct)}
          onClose={() => setRequestProduct(null)}
          product={requestProduct}
        />
      )}
    </div>
  );
}
