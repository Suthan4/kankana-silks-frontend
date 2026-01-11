"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  ChevronDown,
  ChevronLeft,
  SlidersHorizontal,
  Search,
  X,
  ShoppingCart,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  productApi,
  type Product,
  type ProductQueryParams,
} from "@/lib/api/product.api";
import { wishlistApi } from "@/lib/api/wishlist.api";
import { cartApi } from "@/lib/api/cart.api";
import { useAuthModal } from "@/store/useAuthModalStore";
import { toast } from "@/store/useToastStore";

export default function ProductListing() {
  const { user, openModal } = useAuthModal();

  // State
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All Products");
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [likedProducts, setLikedProducts] = useState<Set<string>>(new Set());
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState<
    "createdAt-desc" | "price-asc" | "price-desc"
  >("createdAt-desc");
  const [searchQuery, setSearchQuery] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 12;

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

  // Fetch products
  useEffect(() => {
    fetchProducts();
  }, [currentPage, sortBy, searchQuery, selectedCategory, priceRange]);

  // Fetch wishlist status for products
  useEffect(() => {
    if (user && products.length > 0) {
      checkWishlistStatus();
    }
  }, [user, products]);

  const fetchProducts = async () => {
    try {
      setLoading(true);

      const params: ProductQueryParams = {
        page: currentPage,
        limit,
        isActive: true,
      };

      // Add search
      if (searchQuery) params.search = searchQuery;

      // Add category filter
      // Note: You'll need to map category names to IDs from your backend
      // if (selectedCategory !== "All Products") {
      //   params.categoryId = getCategoryId(selectedCategory);
      // }

      // Add price range
      if (priceRange[0] > 0) params.minPrice = priceRange[0];
      if (priceRange[1] < 100000) params.maxPrice = priceRange[1];

      // Add sorting
      const [field, order] = sortBy.split("-") as [string, "asc" | "desc"];
      if (field === "createdAt") {
        params.sortBy = "createdAt";
        params.sortOrder = order;
      } else if (field === "price") {
        params.sortBy = "price";
        params.sortOrder = order;
      }

      const response = await productApi.getProducts(params);

      if (response.success) {
        setProducts(response.data.products);
        setTotalPages(response.data.pagination.totalPages);
        setTotal(response.data.pagination.total);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const checkWishlistStatus = async () => {
    if (!user) return;

    try {
      const wishlistedSet = new Set<string>();

      for (const product of products) {
        const response = await wishlistApi.checkProduct(product.id);
        if (response.data.isInWishlist) {
          wishlistedSet.add(product.id);
        }
      }

      setLikedProducts(wishlistedSet);
    } catch (error) {
      console.error("Error checking wishlist:", error);
    }
  };

  const toggleWishlist = async (productId: string) => {
    if (!user) {
      openModal("login");
      return;
    }

    try {
      const isLiked = likedProducts.has(productId);

      if (isLiked) {
        // Find wishlist item and remove
        const wishlist = await wishlistApi.getWishlist();
        const item = wishlist.data.items?.find(
          (i: any) => i.productId === productId
        );

        if (item) {
          await wishlistApi.removeFromWishlist(item.id);
          setLikedProducts((prev) => {
            const next = new Set(prev);
            next.delete(productId);
            return next;
          });
          toast.success("Removed from wishlist");
        }
      } else {
        await wishlistApi.addToWishlist({ productId });
        setLikedProducts((prev) => new Set(prev).add(productId));
        toast.success("Added to wishlist");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update wishlist");
    }
  };

  const handleAddToCart = async (productId: string) => {
    if (!user) {
      openModal("login");
      return;
    }

    try {
      await cartApi.addToCart({ productId, quantity: 1 });
      toast.success("Added to cart");
    } catch (error: any) {
      toast.error(error.message || "Failed to add to cart");
    }
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
            min="0"
            max="100000"
            value={priceRange[1]}
            onChange={(e) =>
              setPriceRange([priceRange[0], Number(e.target.value)])
            }
            className="w-full accent-yellow-500"
          />
          <div className="flex justify-between text-sm text-gray-600">
            <span>₹{priceRange[0]}</span>
            <span>₹{priceRange[1]}</span>
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
            <Link href="/" className="hover:text-gray-900 cursor-pointer">
              Home
            </Link>
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
            <p className="text-xs text-gray-500">{total} items</p>
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
            onClick={() => setSortBy("createdAt-desc")}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
              sortBy === "createdAt-desc"
                ? "bg-yellow-400 text-gray-900"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            Featured
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setSortBy("price-asc")}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
              sortBy === "price-asc"
                ? "bg-yellow-400 text-gray-900"
                : "border border-gray-300 text-gray-600"
            }`}
          >
            Price: Low to High
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setSortBy("price-desc")}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
              sortBy === "price-desc"
                ? "bg-yellow-400 text-gray-900"
                : "border border-gray-300 text-gray-600"
            }`}
          >
            Price: High to Low
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
          <p className="text-gray-600">
            Discover {total} handcrafted masterpieces
          </p>
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
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              <option value="createdAt-desc">Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
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
            {loading ? (
              // Skeleton Loading
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-lg overflow-hidden shadow-sm animate-pulse"
                  >
                    <div className="aspect-square bg-gray-200" />
                    <div className="p-4 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-4 bg-gray-200 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-500">No products found</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                {Array.isArray(products) &&
                  products?.map((product, index) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      whileHover={{ y: -4 }}
                      className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                    >
                      <Link href={`/products/${product.slug}`}>
                        <div className="relative aspect-square overflow-hidden">
                          <motion.div
                            className="absolute inset-0"
                            initial={{ scale: 1 }}
                            whileHover={{ scale: 1.15 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                          >
                            <Image
                              src={
                                product.media?.[0]?.url || "/placeholder.jpg"
                              }
                              alt={product.media?.[0]?.altText || product.name}
                              fill
                              sizes="(max-width: 768px) 50vw, 33vw"
                              className="object-cover"
                            />
                          </motion.div>

                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => {
                              e.preventDefault();
                              toggleWishlist(product.id);
                            }}
                            className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-md z-10"
                          >
                            <Heart
                              className={`w-4 h-4 transition-colors ${
                                likedProducts.has(product.id)
                                  ? "fill-red-500 text-red-500"
                                  : "text-gray-600"
                              }`}
                            />
                          </motion.button>
                        </div>
                      </Link>

                      <div className="p-3 md:p-4">
                        <Link href={`/products/${product.slug}`}>
                          <h3 className="font-semibold text-gray-900 text-sm md:text-base mb-1 line-clamp-2">
                            {product.name}
                          </h3>
                        </Link>
                        <p className="text-xs md:text-sm text-gray-500 mb-2">
                          {product.category?.name}
                        </p>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-yellow-600 font-bold">
                            ₹{Number(product.sellingPrice).toFixed(2)}
                          </span>
                          {product.basePrice > product.sellingPrice && (
                            <>
                              <span className="text-gray-400 line-through text-sm">
                                ₹{Number(product.basePrice).toFixed(2)}
                              </span>
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                                {Math.round(
                                  ((product.basePrice - product.sellingPrice) /
                                    product.basePrice) *
                                    100
                                )}
                                % OFF
                              </span>
                            </>
                          )}
                        </div>

                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleAddToCart(product.id)}
                          className="w-full bg-black text-white py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2"
                        >
                          <ShoppingCart className="w-4 h-4" />
                          Add to Cart
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
              </div>
            )}

            {/* Pagination */}
            {!loading && totalPages > 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-8 flex justify-center items-center gap-2"
              >
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
                >
                  Previous
                </button>

                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-10 h-10 rounded-lg ${
                      currentPage === i + 1
                        ? "bg-yellow-400 text-gray-900"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
                >
                  Next
                </button>
              </motion.div>
            )}
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
                  Show {total} Results
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
