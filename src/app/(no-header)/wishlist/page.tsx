"use client";

import {
  Heart,
  ShoppingCart,
  Trash2,
  Loader2,
  Package,
  AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";

import { useAuthModal } from "@/store/useAuthModalStore";
import { useCartStore } from "@/store/useCartStore";
import { cartApi } from "@/lib/api/cart.api";
import { useWishlist } from "@/hooks/useWishlist";
import { ProtectedRoute } from "@/components/auth/protectedRoutes";

export default function WishlistPage() {
  const router = useRouter();
  const { user, openModal } = useAuthModal();
  const { addItem: addToLocalCart } = useCartStore();

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

  /* ------------------ AUTH CHECK ------------------ */

  if (!user) {
    return (
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

  const handleAddToCart = async (item: any) => {
    const product = item.product;
    const stock = product.stock?.[0]?.quantity ?? 0;

    if (stock === 0) {
      toast.error("Out of stock");
      return;
    }

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
          },
        ],
        stock: [{ quantity: stock }],
      },
      variant: null,
    };

    addToLocalCart(cartItem);

    if (user) {
      try {
        await cartApi.addToCart({
          productId: product.id,
          quantity: 1,
        });
      } catch {}
    }

    toast.success("Added to cart");
  };

  /* ------------------ EMPTY ------------------ */

  if (!items.length) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Heart className="w-12 h-12 text-gray-400 mb-3" />
        <h2 className="text-xl font-semibold">Wishlist is empty</h2>
        <Link href="/shop" className="mt-4 underline">
          Start shopping
        </Link>
      </div>
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
              const inStock = (product.stock?.[0]?.quantity ?? 0) > 0;

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
                      onClick={() => handleAddToCart(item)}
                      disabled={!inStock}
                      className={`mt-3 w-full py-2 rounded ${
                        inStock ? "bg-black text-white" : "bg-gray-300"
                      }`}
                    >
                      <ShoppingCart className="inline w-4 h-4 mr-1" />
                      {inStock ? "Add to Cart" : "Out of Stock"}
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
