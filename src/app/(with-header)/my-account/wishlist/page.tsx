"use client";

import { Heart, Trash2, ShoppingCart, ArrowRight } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function WishlistPage() {
  const router = useRouter();
  const [wishlist, setWishlist] = useState([
    {
      id: 1,
      name: "Royal Crimson Kanjivaram",
      price: 2280.0,
      image:
        "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=300",
      inStock: true,
    },
    {
      id: 2,
      name: "Banarasi Silk Saree",
      price: 1850.0,
      image:
        "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=300",
      inStock: true,
    },
    {
      id: 3,
      name: "Mysore Silk Collection",
      price: 3200.0,
      image:
        "https://images.unsplash.com/photo-1610030469750-9f629fe04c6a?w=300",
      inStock: false,
    },
  ]);

  const removeItem = (id: number) => {
    setWishlist(wishlist.filter((item) => item.id !== id));
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white border-b p-4 lg:p-6 sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold">My Wishlist</h1>
              <p className="text-sm text-gray-500 mt-1">
                {wishlist.length} items saved
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
              <Heart className="w-6 h-6 text-white fill-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Wishlist Items */}
      <div className="p-4 lg:p-6 max-w-4xl mx-auto">
        {wishlist.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {wishlist.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border-2 border-gray-100 overflow-hidden hover:shadow-xl transition-all group"
              >
                <div className="relative">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform"
                  />
                  <button
                    onClick={() => removeItem(item.id)}
                    className="absolute top-3 right-3 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-50 transition"
                  >
                    <Trash2 className="w-5 h-5 text-red-600" />
                  </button>
                  {!item.inStock && (
                    <div className="absolute bottom-3 left-3 right-3">
                      <div className="bg-red-600 text-white text-xs font-bold py-2 px-3 rounded-lg text-center">
                        Out of Stock
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <h3 className="font-bold text-base mb-2 line-clamp-2">
                    {item.name}
                  </h3>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl font-bold">
                      ₹{item.price.toFixed(2)}
                    </span>
                  </div>

                  <button
                    disabled={!item.inStock}
                    className={`w-full py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                      item.inStock
                        ? "bg-black text-white hover:bg-gray-800"
                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-br from-red-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-12 h-12 text-red-400" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Your Wishlist is Empty</h2>
            <p className="text-gray-500 mb-6">Save items you love for later</p>
            <button
              onClick={() => router.push("/shop")}
              className="bg-black text-white px-8 py-3 rounded-xl font-semibold hover:bg-gray-800 transition-all inline-flex items-center gap-2"
            >
              Start Shopping
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
