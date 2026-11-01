"use client";

import {
  Heart,
  ShoppingCart,
  Trash2,
  Loader2,
  Package,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";

import { useAuthModal } from "@/store/useAuthModalStore";
import { useCartStore } from "@/store/useCartStore";
import { useCartDrawer } from "@/store/useCartDrawer";
import { wishlistApi } from "@/lib/api/wishlist.api";
import { useWishlist } from "@/hooks/useWishlist";
import { ProtectedRoute } from "@/components/auth/protectedRoutes";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Product } from "@/lib/api/product.api";

export default function WishlistPage() {
  const router = useRouter();
  const { user, openModal } = useAuthModal();
  const { addItem: addToLocalCart } = useCartStore();
  const { open: openCartDrawer } = useCartDrawer();
  const queryClient = useQueryClient();

  const {
    items,
    wishlistCount,
    isLoading,
    isError,
    error,
    removeFromWishlist,
    clearWishlist,
    refetch,
  } = useWishlist();

  const handleAddToCart = useMutation({
    mutationFn: (item: any) => wishlistApi.moveToCart(item.id),
    onSuccess: async (result) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["cartApi"] }),
        queryClient.invalidateQueries({ queryKey: ["wishlist", user?.id] }),
      ]);

      toast.success(
        result.message ||
          (result.data?.alreadyInCart
            ? "Item is already in your cart. Quantity unchanged."
            : "Item moved to cart."),
      );
      router.push("/cart");
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Unable to move item to cart.";
      toast.error(message);
    },
  });

  /* ------------------ AUTH CHECK ------------------ */

  if (!user) {
    return (
      <>
        <div className="flex-none bg-white border-b border-gray-200 px-4 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/shop">
                <motion.button
                  whileHover={{ x: -3 }}
                  className="flex items-center gap-1.5 text-gray-500 hover:text-gray-900 text-sm transition"
                >
                  <ArrowLeft className="w-4 h-4" /> Shop
                </motion.button>
              </Link>
              <div className="h-4 w-px bg-gray-300" />
              <h1 className="text-xl font-bold text-gray-900">
                Wishlist Items
                <span className="text-sm text-gray-400 font-normal ml-2">
                  {wishlistCount} items
                </span>
              </h1>
            </div>
          </div>
        </div>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Heart className="w-12 h-12 mx-auto text-red-500 mb-4" />
            <h1 className="text-2xl font-bold mb-2">Login Required</h1>
            <button
              onClick={() => openModal("login")}
              className="bg-black text-white px-6 py-2 rounded-lg"
            >
              Login
            </button>
          </div>
        </div>
      </>
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
        <AlertCircle className="w-10 h-10 text-red-500 mb-2" />
        <p>{(error as any)?.message || "Something went wrong"}</p>
        <button
          type="button"
          onClick={() => refetch()}
          className="mt-3 underline"
        >
          Retry
        </button>
      </div>
    );
  }

  /* ------------------ HANDLERS ------------------ */

  const handleRemove = async (id: string) => {
    await removeFromWishlist(id);
  };

  const handleClearAll = () => {
    if (!items.length) return;
    if (confirm("Clear wishlist?")) {
      clearWishlist();
    }
  };

  /* ------------------ EMPTY ------------------ */

  if (!items.length) {
    return (
      <>
        {/* ─── Header ──────────────────────────────────────────────────── */}
        <div className="flex-none bg-white border-b border-gray-200 px-4 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/shop">
                <motion.button
                  whileHover={{ x: -3 }}
                  className="flex items-center gap-1.5 text-gray-500 hover:text-gray-900 text-sm transition"
                >
                  <ArrowLeft className="w-4 h-4" /> Shop
                </motion.button>
              </Link>
              <div className="h-4 w-px bg-gray-300" />
              <h1 className="text-xl font-bold text-gray-900">
                Whishlist Items
                <span className="text-sm text-gray-400 font-normal ml-2">
                  {wishlistCount} items
                </span>
              </h1>
            </div>
          </div>
        </div>

        <div className="min-h-screen flex flex-col items-center justify-center">
          <Heart className="w-12 h-12 text-gray-400 mb-3" />
          <h2 className="text-xl font-semibold">Wishlist is empty</h2>
          <Link href="/shop" className="mt-4 underline">
            Start shopping
          </Link>
        </div>
      </>
    );
  }

  /* ------------------ UI ------------------ */

  return (
    <ProtectedRoute>
      <div className="min-h-screen p-6">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">My Wishlist</h1>
            <p className="text-gray-500">{wishlistCount} items</p>
          </div>

          <button
            onClick={handleClearAll}
            className="text-red-600 flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Clear All
          </button>
        </div>

        {/* GRID */}
        <div className="grid md:grid-cols-3 gap-6">
          <AnimatePresence>
            {items.map((item) => {
              const product = item.product;
              const stockQty = product.stock?.[0]?.quantity ?? 0;
              const allowOutOfStockOrders = product.allowOutOfStockOrders;

              const lowStockThreshold =
                product.stock?.[0]?.lowStockThreshold ?? 0;

              const isOutOfStock =
                stockQty === 0 ||
                (!allowOutOfStockOrders &&
                  lowStockThreshold > 0 &&
                  stockQty <= lowStockThreshold);

              const inStock = !isOutOfStock;

              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="border rounded-xl overflow-hidden"
                >
                  {/* IMAGE */}
                  <div className="relative h-64">
                    {product.media?.[0]?.url ? (
                      <Image
                        src={product.media[0].url}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Package />
                      </div>
                    )}

                    {/* REMOVE */}
                    <button
                      onClick={() => handleRemove(item.id)}
                      className="absolute top-2 right-2 bg-white p-2 rounded-full"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>

                    {/* OUT OF STOCK */}
                    {!inStock && (
                      <div className="absolute bottom-2 left-2 bg-red-500 text-white px-2 py-1 text-xs rounded">
                        Out of Stock
                      </div>
                    )}
                  </div>

                  {/* INFO */}
                  <div className="p-4">
                    <h3 className="font-semibold line-clamp-2">
                      {product.name}
                    </h3>

                    <p className="text-lg font-bold mt-2">
                      ₹{Number(product.sellingPrice).toLocaleString("en-IN")}
                    </p>

                    <button
                      onClick={() => handleAddToCart.mutate(item)}
                      disabled={handleAddToCart.isPending}
                      className={`mt-3 w-full py-2 rounded flex items-center justify-center gap-2 transition-all duration-200 ${
                        !inStock
                          ? "bg-gray-300 text-gray-600 cursor-pointer hover:bg-gray-400"
                          : handleAddToCart.isPending
                            ? "bg-gray-800 text-white cursor-wait"
                            : "bg-black text-white hover:bg-gray-800 cursor-pointer active:scale-[0.98]"
                      }`}
                    >
                      {handleAddToCart.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Moving...
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="w-4 h-4" />
                          {inStock ? "Move to Cart" : "Out of Stock"}
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </ProtectedRoute>
  );
}
