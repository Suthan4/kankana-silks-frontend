"use client";
import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  X,
  Clock,
  TrendingUp,
  ShoppingBag,
  ArrowRight,
  Loader2,
  Tag,
  Folder,
  Package,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useOnClickOutside } from "@/hooks/useClickOutside";
import { useUnifiedSearch } from "@/hooks/useUnifiedSearch";

interface UnifiedSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UnifiedSearchModal({
  isOpen,
  onClose,
}: UnifiedSearchModalProps) {
  const router = useRouter();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const {
    searchQuery,
    setSearchQuery,
    searchType,
    setSearchType,
    productResults,
    categoryResults,
    summary,
    isLoading,
    recentSearches,
    trendingSearches,
    addToRecentSearches,
    clearRecentSearches,
    removeRecentSearch,
  } = useUnifiedSearch();

  useOnClickOutside(modalRef, onClose);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  const handleSearch = (query: string) => {
    if (query.trim().length >= 2) {
      addToRecentSearches(query);
      router.push(`/shop?search=${encodeURIComponent(query)}`);
      onClose();
      setSearchQuery("");
    }
  };

  const handleProductClick = (productSlug: string) => {
    addToRecentSearches(searchQuery);
    router.push(`/products/${productSlug}`);
    onClose();
    setSearchQuery("");
  };

  const handleCategoryClick = (categorySlug: string) => {
    addToRecentSearches(searchQuery);
    router.push(`/shop/${categorySlug}`);
    onClose();
    setSearchQuery("");
  };

  const handleRecentSearchClick = (query: string) => {
    setSearchQuery(query);
    handleSearch(query);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const calculateDiscount = (basePrice: number, sellingPrice: number) => {
    if (basePrice <= sellingPrice) return 0;
    return Math.round(((basePrice - sellingPrice) / basePrice) * 100);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm"
        >
          <div className="flex items-start justify-center min-h-screen p-4 pt-[10vh]">
            <motion.div
              ref={modalRef}
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden"
            >
              {/* Search Input */}
              <div className="p-4 border-b border-gray-200">
                <div className="relative mb-3">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        handleSearch(searchQuery);
                      }
                    }}
                    placeholder="Search for products, categories..."
                    className="w-full pl-12 pr-12 py-4 text-lg border-none outline-none focus:ring-0"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-400" />
                    </button>
                  )}
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2">
                  {[
                    { value: "all", label: "All", icon: Search },
                    { value: "products", label: "Products", icon: Package },
                    { value: "categories", label: "Collections", icon: Folder },
                  ].map((tab) => (
                    <button
                      key={tab.value}
                      onClick={() => setSearchType(tab.value as any)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                        searchType === tab.value
                          ? "bg-black text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      <tab.icon className="w-4 h-4" />
                      {tab.label}
                      {searchQuery.length >= 2 && (
                        <span className="text-xs opacity-75">
                          (
                          {tab.value === "all"
                            ? summary.total
                            : tab.value === "products"
                              ? summary.products
                              : summary.categories}
                          )
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Results Container */}
              <div className="max-h-[60vh] overflow-y-auto">
                {/* Loading State */}
                {isLoading && (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                  </div>
                )}

                {/* Search Results */}
                {!isLoading &&
                  searchQuery.length >= 2 &&
                  (productResults.length > 0 || categoryResults.length > 0) && (
                    <div className="p-4 space-y-6">
                      {/* Categories Section */}
                      {(searchType === "all" || searchType === "categories") &&
                        categoryResults.length > 0 && (
                          <div>
                            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                              <Folder className="w-4 h-4" />
                              Categories ({categoryResults.length})
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {categoryResults
                                .slice(0, 6)
                                .map((category, index) => (
                                  <motion.button
                                    key={category.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    onClick={() =>
                                      handleCategoryClick(category.slug)
                                    }
                                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors text-left group border border-gray-100"
                                  >
                                    {category.image ? (
                                      <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                        <Image
                                          src={category.image}
                                          alt={category.name}
                                          fill
                                          className="object-cover group-hover:scale-110 transition-transform duration-300"
                                        />
                                      </div>
                                    ) : (
                                      <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                                        <Folder className="w-6 h-6 text-gray-400" />
                                      </div>
                                    )}

                                    <div className="flex-1 min-w-0">
                                      <h4 className="font-medium text-gray-900 truncate group-hover:text-black">
                                        {category.name}
                                      </h4>
                                      <p className="text-xs text-gray-500">
                                        {category.productCount} products
                                        {category.parentName &&
                                          ` • in ${category.parentName}`}
                                      </p>
                                    </div>

                                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-black group-hover:translate-x-1 transition-all flex-shrink-0" />
                                  </motion.button>
                                ))}
                            </div>
                          </div>
                        )}

                      {/* Products Section */}
                      {(searchType === "all" || searchType === "products") &&
                        productResults.length > 0 && (
                          <div>
                            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                              <Package className="w-4 h-4" />
                              Products ({productResults.length})
                            </h3>
                            <div className="grid grid-cols-1 gap-3">
                              {productResults
                                .slice(0, 8)
                                .map((product, index) => {
                                  const discount = calculateDiscount(
                                    product.basePrice,
                                    product.sellingPrice,
                                  );

                                  return (
                                    <motion.button
                                      key={product.id}
                                      initial={{ opacity: 0, y: 10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{ delay: index * 0.05 }}
                                      onClick={() =>
                                        handleProductClick(product.slug)
                                      }
                                      className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors text-left group"
                                    >
                                      <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                        {product.image ? (
                                          <Image
                                            src={product.image}
                                            alt={product.name}
                                            fill
                                            className="object-cover group-hover:scale-110 transition-transform duration-300"
                                          />
                                        ) : (
                                          <div className="w-full h-full flex items-center justify-center">
                                            <ShoppingBag className="w-6 h-6 text-gray-300" />
                                          </div>
                                        )}
                                      </div>

                                      <div className="flex-1 min-w-0">
                                        <h4 className="font-medium text-gray-900 truncate group-hover:text-black">
                                          {product.name}
                                        </h4>
                                        <p className="text-xs text-gray-500 truncate">
                                          {product.categoryName ||
                                            "Uncategorized"}
                                        </p>
                                        <div className="flex items-center gap-2 mt-1">
                                          <span className="font-bold text-gray-900">
                                            {formatPrice(product.sellingPrice)}
                                          </span>
                                          {discount > 0 && (
                                            <>
                                              <span className="text-xs text-gray-400 line-through">
                                                {formatPrice(product.basePrice)}
                                              </span>
                                              <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded">
                                                {discount}% OFF
                                              </span>
                                            </>
                                          )}
                                          {!product.inStock && (
                                            <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded">
                                              Out of Stock
                                            </span>
                                          )}
                                        </div>
                                      </div>

                                      <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-black group-hover:translate-x-1 transition-all flex-shrink-0" />
                                    </motion.button>
                                  );
                                })}
                            </div>
                          </div>
                        )}
                    </div>
                  )}

                {/* No Results */}
                {!isLoading &&
                  searchQuery.length >= 2 &&
                  productResults.length === 0 &&
                  categoryResults.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 px-4">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <Search className="w-8 h-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        No results found
                      </h3>
                      <p className="text-sm text-gray-500 text-center max-w-sm">
                        We couldn't find any products or categories matching "
                        {searchQuery}". Try different keywords.
                      </p>
                    </div>
                  )}

                {/* Recent & Trending - Show when no search query */}
                {!isLoading && searchQuery.length < 2 && (
                  <div className="p-4 space-y-6">
                    {/* Recent Searches */}
                    {recentSearches.length > 0 && (
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            Recent Searches
                          </h3>
                          <button
                            onClick={clearRecentSearches}
                            className="text-xs font-medium text-gray-500 hover:text-gray-900"
                          >
                            Clear all
                          </button>
                        </div>

                        <div className="space-y-2">
                          {recentSearches.map((query, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className="flex items-center justify-between group"
                            >
                              <button
                                onClick={() => handleRecentSearchClick(query)}
                                className="flex-1 flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
                              >
                                <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                <span className="text-sm text-gray-700 group-hover:text-gray-900">
                                  {query}
                                </span>
                              </button>
                              <button
                                onClick={() => removeRecentSearch(query)}
                                className="p-2 opacity-0 group-hover:opacity-100 hover:bg-gray-100 rounded-lg transition-all"
                              >
                                <X className="w-4 h-4 text-gray-400" />
                              </button>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Trending Searches */}
                    <div className="border-t border-gray-100 pt-6">
                      <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2 mb-4">
                        <TrendingUp className="w-4 h-4" />
                        Trending Searches
                      </h3>

                      <div className="flex flex-wrap gap-2">
                        {trendingSearches.map((keyword, index) => (
                          <motion.button
                            key={keyword}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => {
                              setSearchQuery(keyword);
                              handleSearch(keyword);
                            }}
                            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors flex items-center gap-2"
                          >
                            <Tag className="w-3 h-3" />
                            {keyword}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-3 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs font-mono">
                      Enter
                    </kbd>
                    <span>to search</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs font-mono">
                      Esc
                    </kbd>
                    <span>to close</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
