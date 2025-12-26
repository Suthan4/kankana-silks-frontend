"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart,
  Heart,
  Star,
  ChevronLeft,
  ChevronRight,
  Check,
  Truck,
  Shield,
  RotateCcw,
} from "lucide-react";

const ProductPage = () => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState("ruby-red");
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("details");

  const images = [
    "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&q=80",
    "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=800&q=80",
    "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&q=80",
    "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=800&q=80",
  ];

  const colors = [
    { name: "Ruby Red", value: "ruby-red", hex: "#DC143C" },
    { name: "Emerald Green", value: "emerald", hex: "#059669" },
    { name: "Sapphire Blue", value: "sapphire", hex: "#1E40AF" },
    { name: "Royal Purple", value: "purple", hex: "#7C3AED" },
    { name: "Golden Yellow", value: "golden", hex: "#F59E0B" },
  ];

  const reviews = [
    {
      name: "Priya Sharma",
      rating: 5,
      comment:
        "Gorgeous craftsmanship! The silk quality is exceptional and the color is vibrant.",
      verified: true,
    },
    {
      name: "Anita Desai",
      rating: 5,
      comment: "Absolutely stunning saree! Worth every penny.",
      verified: true,
    },
    {
      name: "Meera Patel",
      rating: 4,
      comment: "Beautiful design, fits perfectly. Highly recommend!",
      verified: true,
    },
  ];

  const relatedProducts = [
    {
      name: "Midnight Blue Silk Saree",
      price: "₹10,999",
      image:
        "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&q=80",
    },
    {
      name: "Emerald in Pure Kanjeevaram",
      price: "₹14,499",
      image:
        "https://images.unsplash.com/photo-1583391733981-5096a2c669?w=400&q=80",
    },
    {
      name: "Royal Gold Bridal Saree",
      price: "₹18,999",
      image:
        "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=400&q=80",
    },
    {
      name: "Rose Pink Kanjeevaram",
      price: "₹9,999",
      image:
        "https://images.unsplash.com/photo-1611744336555-87725b196e6a?w=400&q=80",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Image Gallery */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-white shadow-xl">
              <AnimatePresence mode="wait">
                <motion.img
                  key={selectedImage}
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  src={images[selectedImage]}
                  alt="Saree"
                  className="w-full h-full object-cover"
                />
              </AnimatePresence>

              <button
                onClick={() =>
                  setSelectedImage((prev) =>
                    prev === 0 ? images.length - 1 : prev - 1
                  )
                }
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 p-2 rounded-full shadow-lg hover:bg-white transition"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <button
                onClick={() =>
                  setSelectedImage((prev) =>
                    prev === images.length - 1 ? 0 : prev + 1
                  )
                }
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 p-2 rounded-full shadow-lg hover:bg-white transition"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-4 gap-3">
              {images.map((img, idx) => (
                <motion.button
                  key={idx}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedImage(idx)}
                  className={`aspect-square rounded-lg overflow-hidden border-2 transition ${
                    selectedImage === idx
                      ? "border-primary"
                      : "border-transparent"
                  }`}
                >
                  <img
                    src={img}
                    alt={`Thumbnail ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl font-medium tracking-tight md:text-4xl  text-gray-900 mb-2"
              >
                Kanjeevaram Silk Saree - Ruby Red
              </motion.h2>

              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
                <span className="text-gray-600">(128 reviews)</span>
              </div>

              <div className="flex items-baseline gap-3 mb-6">
                <span className="text-4xl font-medium">₹12,499</span>
                <span className="text-xl text-gray-400 line-through">
                  ₹17,999
                </span>
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                  30% OFF
                </span>
              </div>

              <p className="text-gray-700 leading-relaxed">
                Handcrafted in pure Kanjeevaram silk, this exquisite saree
                features intricate zari work and traditional motifs. Perfect for
                weddings, festivals, and special occasions.
              </p>
            </div>

            {/* Color Selection */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Select Color</h3>
              <div className="flex gap-3">
                {colors.map((color) => (
                  <motion.button
                    key={color.value}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSelectedColor(color.value)}
                    className={`relative w-10 h-10 rounded-full border-2 transition ${
                      selectedColor === color.value
                        ? "border-gray-900 shadow-lg"
                        : "border-gray-300"
                    }`}
                    style={{ backgroundColor: color.hex }}
                  >
                    {selectedColor === color.value && (
                      <Check className="w-5 h-5 text-white absolute inset-0 m-auto drop-shadow-lg" />
                    )}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Quantity</h3>
              <div className="flex items-center gap-4">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center font-bold"
                >
                  -
                </motion.button>
                <span className="text-xl font-semibold w-12 text-center">
                  {quantity}
                </span>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center font-bold"
                >
                  +
                </motion.button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 bg-white text-black py-4 rounded-full font-semibold shadow-lg hover:shadow-xl transition flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-5 h-5" />
                Add to Cart
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 bg-black text-white py-4 rounded-full font-semibold shadow-lg hover:shadow-xl transition"
              >
                Buy Now
              </motion.button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200">
              <div className="text-center">
                <Truck className="w-6 h-6 mx-auto mb-2" />
                <p className="text-xs text-gray-600">Free Shipping</p>
              </div>
              <div className="text-center">
                <RotateCcw className="w-6 h-6 mx-auto mb-2" />
                <p className="text-xs text-gray-600">7 Days Return</p>
              </div>
              <div className="text-center">
                <Shield className="w-6 h-6 mx-auto mb-2" />
                <p className="text-xs text-gray-600">Secure Payment</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Tabs Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-12"
        >
          <div className="flex gap-6 border-b border-gray-200 mb-6">
            {["details", "reviews"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 font-semibold transition relative text-black
                `}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                {activeTab === tab && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-500"
                  />
                )}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {activeTab === "details" && (
              <motion.div
                key="details"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2">Fabric</h4>
                    <p className="text-gray-600">Pure Kanjeevaram Silk</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Length</h4>
                    <p className="text-gray-600">
                      6.3 meters with blouse piece
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Work Type</h4>
                    <p className="text-gray-600">Zari weaving</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Care</h4>
                    <p className="text-gray-600">Dry clean only</p>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "reviews" && (
              <motion.div
                key="reviews"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-6 mb-8">
                  <div className="text-center">
                    <div className="text-5xl font-bold text-gray-900">4.8</div>
                    <div className="flex items-center gap-1 mt-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className="w-5 h-5 fill-yellow-400 text-yellow-400"
                        />
                      ))}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">128 reviews</p>
                  </div>
                </div>

                {reviews.map((review, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="border-b pb-6 last:border-0"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h5 className="font-semibold">{review.name}</h5>
                          {review.verified && (
                            <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded">
                              Verified
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          {[...Array(review.rating)].map((_, i) => (
                            <Star
                              key={i}
                              className="w-4 h-4 fill-yellow-400 text-yellow-400"
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-700">{review.comment}</p>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Related Products */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-6">
            You May Also Like
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {relatedProducts.map((product, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + idx * 0.1 }}
                whileHover={{ y: -8 }}
                className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition cursor-pointer"
              >
                <div className="aspect-square overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h4 className="font-semibold text-sm mb-2 line-clamp-2">
                    {product.name}
                  </h4>
                  <p className="font-bold">{product.price}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProductPage;
