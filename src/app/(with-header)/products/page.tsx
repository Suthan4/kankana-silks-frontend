"use client"
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  ChevronDown,
  ChevronLeft,
  SlidersHorizontal,
  Search,
  X,
} from "lucide-react";

function ProductListing() {
  const [selectedCategory, setSelectedCategory] = useState("All Products");
  const [priceRange, setPriceRange] = useState([120, 850]);
  const [selectedMaterials, setSelectedMaterials] = useState(["Cotton Silk"]);
  const [likedProducts, setLikedProducts] = useState<number[]>([]);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState("Featured");

  const categories = [
    "All Products",
    "Kanjivaram Sarees",
    "Banarasi Silk",
    "Tussar Silk",
    "Soft Silk",
  ];

  const materials = ["Pure Silk", "Cotton Silk", "Art Silk", "Georgette"];

  const colors = [
    { name: "Red", color: "#DC2626" },
    { name: "Gold", color: "#F59E0B" },
    { name: "Green", color: "#059669" },
    { name: "Blue", color: "#2563EB" },
    { name: "Pink", color: "#EC4899" },
  ];

  const products = [
    {
      id: 1,
      name: "Royal Crimson Kanjivaram",
      subtitle: "Pure Zari Weave",
      price: 345.0,
      image:
        "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500&h=500&fit=crop",
      badge: "NEW",
      badgeColor: "bg-green-600",
    },
    {
      id: 2,
      name: "Golden Beige Banarasi",
      subtitle: "Handwoven Silk",
      price: 280.0,
      originalPrice: 420.0,
      image:
        "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=500&h=500&fit=crop",
    },
    {
      id: 3,
      name: "Midnight Violet Soft Silk",
      subtitle: "Contemporary Design",
      price: 195.0,
      originalPrice: 245.0,
      image:
        "https://images.unsplash.com/photo-1610030469750-9f629fe04c6a?w=500&h=500&fit=crop",
      badge: "-20%",
      badgeColor: "bg-pink-600",
    },
    {
      id: 4,
      name: "Peacock Blue Mysore Silk",
      subtitle: "Gold Zari Border",
      price: 210.8,
      image:
        "https://images.unsplash.com/photo-1583391733981-6d1f1f0e3f3f?w=500&h=500&fit=crop",
    },
    {
      id: 5,
      name: "Sunset Orange Organza",
      subtitle: "Lightweight Festive Wear",
      price: 150.0,
      image:
        "https://images.unsplash.com/photo-1583391733970-8b6635a17e5d?w=500&h=500&fit=crop",
    },
    {
      id: 6,
      name: "Emerald Heritage Silk",
      subtitle: "Wedding Collection",
      price: 450.0,
      image:
        "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=500&h=500&fit=crop",
      badge: "BEST SELLER",
      badgeColor: "bg-gray-900",
    },
  ];

  const toggleLike = (id: number) => {
    setLikedProducts((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
    );
  };

  const toggleMaterial = (material: string) => {
    setSelectedMaterials((prev) =>
      prev.includes(material)
        ? prev.filter((m) => m !== material)
        : [...prev, material]
    );
  };

  const FilterSidebar = ({ isMobile = false }: { isMobile?: boolean }) => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={`${isMobile ? "p-6" : ""}`}
    >
      {/* Categories */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-lg">✨</span>
          <h3 className="font-semibold text-gray-900">Categories</h3>
        </div>
        <ul className="space-y-2">
          {categories.map((category, index) => (
            <motion.li
              key={category}
              initial={isMobile ? { x: -20, opacity: 0 } : false}
              animate={isMobile ? { x: 0, opacity: 1 } : false}
              transition={{ delay: index * 0.05 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedCategory(category)}
              className={`cursor-pointer py-2 px-3 rounded-lg transition-colors relative ${
                selectedCategory === category
                  ? "bg-yellow-50 text-yellow-700 font-medium"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              {category}
              {selectedCategory === category && (
                <motion.div
                  layoutId="categoryIndicator"
                  className="absolute inset-0 bg-yellow-50 rounded-lg -z-10"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </motion.li>
          ))}
        </ul>
      </div>

      {/* Price Range */}
      <motion.div
        initial={isMobile ? { x: -20, opacity: 0 } : false}
        animate={isMobile ? { x: 0, opacity: 1 } : false}
        transition={{ delay: 0.2 }}
        className="mb-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <span className="text-lg">💰</span>
          <h3 className="font-semibold text-gray-900">Price Range</h3>
        </div>
        <div className="space-y-4">
          <input
            type="range"
            min="50"
            max="1000"
            value={priceRange[1]}
            onChange={(e) =>
              setPriceRange([priceRange[0], Number(e.target.value)])
            }
            className="w-full accent-yellow-500"
          />
          <div className="flex justify-between text-sm text-gray-600">
            <span>${priceRange[0]}</span>
            <span>${priceRange[1]}</span>
          </div>
        </div>
      </motion.div>

      {/* Colors */}
      <motion.div
        initial={isMobile ? { x: -20, opacity: 0 } : false}
        animate={isMobile ? { x: 0, opacity: 1 } : false}
        transition={{ delay: 0.3 }}
        className="mb-6"
      >
        <h3 className="font-semibold text-gray-900 mb-4">Colors</h3>
        <div className="flex gap-3">
          {colors.map((color, index) => (
            <motion.button
              key={color.name}
              initial={isMobile ? { scale: 0, opacity: 0 } : false}
              animate={isMobile ? { scale: 1, opacity: 1 } : false}
              transition={{ delay: 0.3 + index * 0.05 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="flex flex-col items-center gap-1"
            >
              <div
                className="w-8 h-8 rounded-full border-2 border-gray-200"
                style={{ backgroundColor: color.color }}
              />
              <span className="text-xs text-gray-600">{color.name}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Material */}
      <motion.div
        initial={isMobile ? { x: -20, opacity: 0 } : false}
        animate={isMobile ? { x: 0, opacity: 1 } : false}
        transition={{ delay: 0.4 }}
        className="mb-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <span className="text-lg">🧵</span>
          <h3 className="font-semibold text-gray-900">Material</h3>
        </div>
        <ul className="space-y-2">
          {materials.map((material) => (
            <motion.li
              key={material}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2"
            >
              <input
                type="checkbox"
                checked={selectedMaterials.includes(material)}
                onChange={() => toggleMaterial(material)}
                className="w-4 h-4 accent-yellow-500 rounded"
              />
              <label className="text-gray-700 cursor-pointer">{material}</label>
            </motion.li>
          ))}
        </ul>
      </motion.div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb - Desktop */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="hidden md:block bg-white"
      >
        <div className="container mx-auto px-6 py-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="hover:text-gray-900 cursor-pointer">Home</span>
            <span>›</span>
            <span className="text-gray-900">All Products</span>
          </div>
        </div>
      </motion.div>

      {/* Mobile Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="md:hidden bg-white border-b sticky top-0 z-40"
      >
        <div className="flex items-center gap-3 px-4 py-3">
          <motion.div whileTap={{ scale: 0.9 }}>
            <ChevronLeft className="w-6 h-6" />
          </motion.div>
          <div>
            <h2 className="font-semibold text-gray-900">Sarees</h2>
            <p className="text-xs text-gray-500">1,004 items</p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <motion.div whileTap={{ scale: 0.9 }}>
              <Heart className="w-6 h-6" />
            </motion.div>
            <motion.div whileTap={{ scale: 0.9 }}>
              <Search className="w-6 h-6" />
            </motion.div>
          </div>
        </div>

        {/* Mobile Filter Chips */}
        <div className="flex gap-2 px-4 pb-3 overflow-x-auto">
          <motion.button
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 bg-yellow-400 text-gray-900 rounded-full text-sm font-medium whitespace-nowrap"
          >
            Silky
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 border border-gray-300 rounded-full text-sm whitespace-nowrap flex items-center gap-1"
          >
            Price <ChevronDown className="w-4 h-4" />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 border border-gray-300 rounded-full text-sm whitespace-nowrap flex items-center gap-1"
          >
            Color <ChevronDown className="w-4 h-4" />
          </motion.button>
        </div>
      </motion.div>

      <div className="container mx-auto px-4 md:px-6 py-4">
        {/* Desktop Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="hidden md:block mb-6"
        >
          <h1 className="text-5xl font-light tracking-tight">
            Exquisite Silk Collection
          </h1>
          <p className="text-gray-600">Discover 142 handcrafted masterpieces</p>
        </motion.div>

        {/* Sort By - Desktop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="hidden md:flex justify-end mb-6"
        >
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              <option>Featured</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
              <option>Newest</option>
            </select>
          </div>
        </motion.div>

        <div className="flex gap-6">
          {/* Desktop Sidebar */}
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="hidden md:block w-64 flex-shrink-0"
          >
            <div className="bg-white rounded-lg p-6 shadow-sm sticky top-6">
              <FilterSidebar />
            </div>
          </motion.aside>

          {/* Product Grid */}
          <div className="flex-1">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              {products.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={{ y: -4 }}
                  className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="relative aspect-square overflow-hidden">
                    <motion.img
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.3 }}
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                    {product.badge && (
                      <motion.span
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{
                          delay: index * 0.05 + 0.2,
                          type: "spring",
                          stiffness: 380,
                          damping: 30,
                        }}
                        className={`absolute top-2 left-2 ${product.badgeColor} text-white text-xs px-2 py-1 rounded`}
                      >
                        {product.badge}
                      </motion.span>
                    )}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => toggleLike(product.id)}
                      className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-md"
                    >
                      <motion.div
                        animate={
                          likedProducts.includes(product.id)
                            ? { scale: [1, 1.3, 1] }
                            : {}
                        }
                        transition={{ duration: 0.3 }}
                      >
                        <Heart
                          className={`w-4 h-4 transition-colors ${
                            likedProducts.includes(product.id)
                              ? "fill-red-500 text-red-500"
                              : "text-gray-600"
                          }`}
                        />
                      </motion.div>
                    </motion.button>
                  </div>
                  <div className="p-3 md:p-4">
                    <h3 className="font-semibold text-gray-900 text-sm md:text-base mb-1">
                      {product.name}
                    </h3>
                    <p className="text-xs md:text-sm text-gray-500 mb-2">
                      {product.subtitle}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-yellow-600 font-bold">
                        ${product.price.toFixed(2)}
                      </span>
                      {product.originalPrice && (
                        <span className="text-gray-400 line-through text-sm">
                          ${product.originalPrice.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Load More */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-8 text-center"
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-3 border-2 border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors inline-flex items-center gap-2"
              >
                Load More Products
                <ChevronDown className="w-4 h-4" />
              </motion.button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Mobile Filter Button */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3, type: "spring", stiffness: 380, damping: 30 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setMobileFilterOpen(true)}
        className="md:hidden fixed bottom-20 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 z-40"
      >
        <SlidersHorizontal className="w-5 h-5" />
        Filter & Sort
      </motion.button>

      {/* Mobile Filter Modal */}
      <AnimatePresence>
        {mobileFilterOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileFilterOpen(false)}
              className="fixed inset-0 bg-black/50 z-50 md:hidden"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 md:hidden max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
                <h2 className="font-semibold text-lg">Filter & Sort</h2>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setMobileFilterOpen(false)}
                >
                  <X className="w-6 h-6" />
                </motion.button>
              </div>
              <FilterSidebar isMobile />
              <div className="p-4 border-t sticky bottom-0 bg-white">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setMobileFilterOpen(false)}
                  className="w-full bg-yellow-400 text-gray-900 py-3 rounded-full font-semibold"
                >
                  Show 24 Results
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ProductListing;
