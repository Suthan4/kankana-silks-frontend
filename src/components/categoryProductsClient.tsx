"use client";
import { useState, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
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
import { Category } from "@/lib/api/category.api.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface CategoryProductsClientProps {
  category: Category;
}

export default function CategoryProductsClient({
  category,
}: CategoryProductsClientProps) {
  const { user, openModal } = useAuthModal();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Filter state - Initialize from URL
  const [priceRange, setPriceRange] = useState<[number, number]>(() => {
    const min = Number(searchParams.get("minPrice"));
    const max = Number(searchParams.get("maxPrice"));
    return [min > 0 ? min : 0, max > 0 && max < 100000 ? max : 100000];
  });

  const [sortBy, setSortBy] = useState<
    | "createdAt-desc"
    | "price-asc"
    | "price-desc"
    | "popularity-desc"
    | "name-asc"
  >(() => {
    const sortByParam = searchParams.get("sortBy") || "createdAt";
    const sortOrderParam = searchParams.get("sortOrder") || "desc";
    return `${sortByParam}-${sortOrderParam}` as any;
  });

  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || ""
  );

  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(
    searchParams.get("subcategory") || null
  );

  const [selectedColor, setSelectedColor] = useState(
    searchParams.get("color") || ""
  );

  const [selectedFabric, setSelectedFabric] = useState(
    searchParams.get("fabric") || ""
  );

  const [selectedSize, setSelectedSize] = useState(
    searchParams.get("size") || ""
  );

  const [inStockOnly, setInStockOnly] = useState(
    searchParams.get("inStock") === "true"
  );

  const limit = 12;

  const materials = ["Pure Silk", "Cotton Silk", "Art Silk", "Georgette"];
  const colors = [
    { name: "Red", color: "#DC2626" },
    { name: "Gold", color: "#F59E0B" },
    { name: "Green", color: "#059669" },
    { name: "Blue", color: "#2563EB" },
    { name: "Pink", color: "#EC4899" },
  ];
  const sizes = ["S", "M", "L", "XL", "Free Size"];

  const updateFilters = useCallback(
    (updates: Record<string, string | number | boolean | null>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (
          value === null ||
          value === "" ||
          value === false ||
          (key === "minPrice" && value === 0) ||
          (key === "maxPrice" && value === 100000)
        ) {
          params.delete(key);
        } else {
          params.set(key, String(value));
        }
      });

      router.push(`?${params.toString()}`, { scroll: false });
    },
    [searchParams, router]
  );

  /* ------------------ BUILD QUERY PARAMS ------------------ */

  const queryParams: ProductQueryParams = useMemo(() => {
    const params: ProductQueryParams = {
      page: Number(searchParams.get("page")) || 1,
      limit,
      isActive: true,
    };

    // Category
    if (selectedSubCategory) {
      const sub = category.children?.find((c) => c.id === selectedSubCategory);
      if (sub) params.categorySlug = sub.slug;
    } else {
      params.categorySlug = category.slug;
    }

    // Search
    const search = searchParams.get("search");
    if (search) params.search = search;

    // Price
    const minPrice = Number(searchParams.get("minPrice"));
    const maxPrice = Number(searchParams.get("maxPrice"));

    if (minPrice && minPrice > 0) {
      params.minPrice = minPrice;
    }

    if (maxPrice && maxPrice > 0 && maxPrice < 100000) {
      params.maxPrice = maxPrice;
    }

    // Sorting
    params.sortBy = (searchParams.get("sortBy") || "createdAt") as any;
    params.sortOrder = (searchParams.get("sortOrder") || "desc") as any;

    // Advanced filters
    const color = searchParams.get("color");
    if (color) params.color = color;

    const fabric = searchParams.get("fabric");
    if (fabric) params.fabric = fabric;

    const size = searchParams.get("size");
    if (size) params.size = size;

    if (searchParams.get("inStock") === "true") params.inStock = true;

    return params;
  }, [searchParams, category, selectedSubCategory]);

  /* ------------------ PRODUCTS QUERY ------------------ */

  const {
    data: productRes,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["products", category.slug, searchParams.toString()],
    queryFn: async () => {
      console.log("🔵 Fetching products with params:", queryParams);
      const result = await productApi.getProducts(queryParams);
      console.log("✅ Products fetched:", result);
      return result;
    },
    retry: 1,
    staleTime: 30000,
  });

  const products = productRes?.data?.products ?? [];
  const total = productRes?.data?.pagination?.total ?? 0;
  const totalPages = productRes?.data?.pagination?.totalPages ?? 1;
  const currentPage = productRes?.data?.pagination?.page ?? 1;

  /* ------------------ WISHLIST QUERY ------------------ */

  const { data: wishlistData } = useQuery({
    queryKey: ["wishlist", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const res = await wishlistApi.getWishlist();
      return res.data.items?.map((i: any) => i.productId) ?? [];
    },
  });

  const likedProducts = useMemo(
    () => new Set(wishlistData ?? []),
    [wishlistData]
  );

  /* ------------------ MUTATIONS ------------------ */

  const toggleWishlistMutation = useMutation({
    mutationFn: async (productId: string) => {
      const wishlist = await wishlistApi.getWishlist();
      const item = wishlist.data.items?.find(
        (i: any) => i.productId === productId
      );

      if (item) {
        await wishlistApi.removeFromWishlist(item.id);
        return { action: "removed", productId };
      } else {
        await wishlistApi.addToWishlist({ productId });
        return { action: "added", productId };
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      toast.success(
        data.action === "added" ? "Added to wishlist" : "Removed from wishlist"
      );
    },
    onError: () => {
      toast.error("Failed to update wishlist");
    },
  });

  const toggleWishlist = (productId: string) => {
    if (!user) {
      openModal("login");
      return;
    }
    toggleWishlistMutation.mutate(productId);
  };

  const addToCartMutation = useMutation({
    mutationFn: (productId: string) =>
      cartApi.addToCart({ productId, quantity: 1 }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast.success("Added to cart");
    },
    onError: () => toast.error("Failed to add to cart"),
  });

  const handleAddToCart = (productId: string) => {
    if (!user) {
      openModal("login");
      return;
    }
    addToCartMutation.mutate(productId);
  };

  /* ------------------ HANDLERS ------------------ */

  const handlePageChange = (page: number) => {
    updateFilters({ page });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubCategoryChange = (subCatId: string | null) => {
    setSelectedSubCategory(subCatId);
    updateFilters({ subcategory: subCatId, page: 1 });
  };

  const handlePriceRangeChange = (newRange: [number, number]) => {
    setPriceRange(newRange);
    updateFilters({ minPrice: newRange[0], maxPrice: newRange[1], page: 1 });
  };

  const handleSortChange = (newSort: typeof sortBy) => {
    setSortBy(newSort);
    const [field, order] = newSort.split("-");
    updateFilters({ sortBy: field, sortOrder: order, page: 1 });
  };

  const handleColorChange = (color: string) => {
    const newColor = selectedColor === color ? "" : color;
    setSelectedColor(newColor);
    updateFilters({ color: newColor || null, page: 1 });
  };

  const handleFabricChange = (fabric: string) => {
    const newFabric = selectedFabric === fabric ? "" : fabric;
    setSelectedFabric(newFabric);
    updateFilters({ fabric: newFabric || null, page: 1 });
  };

  const handleSizeChange = (size: string) => {
    const newSize = selectedSize === size ? "" : size;
    setSelectedSize(newSize);
    updateFilters({ size: newSize || null, page: 1 });
  };

  const handleInStockChange = (value: boolean) => {
    setInStockOnly(value);
    updateFilters({ inStock: value || null, page: 1 });
  };

  const clearAllFilters = () => {
    setPriceRange([0, 100000]);
    setSelectedColor("");
    setSelectedFabric("");
    setSelectedSize("");
    setInStockOnly(false);
    setSelectedSubCategory(null);
    setSearchQuery("");

    router.push(`/shop/${category.slug}`);
  };

  const FilterSidebar = ({ isMobile = false }: { isMobile?: boolean }) => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={`${isMobile ? "p-6" : ""}`}
    >
      <div className="mb-6">
        <button
          onClick={clearAllFilters}
          className="text-sm text-red-600 hover:text-red-700 font-medium"
        >
          Clear All Filters
        </button>
      </div>

      {category.children && category.children.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg">📂</span>
            <h3 className="font-semibold text-gray-900">Subcategories</h3>
          </div>
          <ul className="space-y-2">
            <motion.li
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSubCategoryChange(null)}
              className={`cursor-pointer py-2 px-3 rounded-lg transition-colors relative ${
                selectedSubCategory === null
                  ? "bg-yellow-50 text-yellow-700 font-medium"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              All {category.name}
            </motion.li>
            {category.children.map((subCat) => (
              <motion.li
                key={subCat.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSubCategoryChange(subCat.id)}
                className={`cursor-pointer py-2 px-3 rounded-lg transition-colors relative ${
                  selectedSubCategory === subCat.id
                    ? "bg-yellow-50 text-yellow-700 font-medium"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                {subCat.name}
              </motion.li>
            ))}
          </ul>
        </div>
      )}

      <div className="mb-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => handleInStockChange(e.target.checked)}
            className="w-4 h-4 accent-yellow-500 rounded"
          />
          <span className="text-sm font-medium text-gray-700">
            In Stock Only
          </span>
        </label>
      </div>

      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-lg">💰</span>
          <h3 className="font-semibold text-gray-900">Price Range</h3>
        </div>
        <div className="space-y-4">
          <input
            type="range"
            min="0"
            max="100000"
            step="1000"
            value={priceRange[1]}
            onChange={(e) =>
              handlePriceRangeChange([priceRange[0], Number(e.target.value)])
            }
            className="w-full accent-yellow-500"
          />
          <div className="flex justify-between text-sm text-gray-600">
            <span>₹{priceRange[0].toLocaleString()}</span>
            <span>₹{priceRange[1].toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">Colors</h3>
        <div className="flex gap-3 flex-wrap">
          {colors.map((color) => (
            <motion.button
              key={color.name}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleColorChange(color.name)}
              className={`flex flex-col items-center gap-1 ${
                selectedColor === color.name
                  ? "ring-2 ring-yellow-500 ring-offset-2 rounded-full"
                  : ""
              }`}
            >
              <div
                className="w-8 h-8 rounded-full border-2 border-gray-200"
                style={{ backgroundColor: color.color }}
              />
              <span className="text-xs text-gray-600">{color.name}</span>
            </motion.button>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-lg">🧵</span>
          <h3 className="font-semibold text-gray-900">Fabric</h3>
        </div>
        <ul className="space-y-2">
          {materials.map((material) => (
            <motion.li
              key={material}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2"
            >
              <input
                type="radio"
                name="fabric"
                checked={selectedFabric === material}
                onChange={() => handleFabricChange(material)}
                className="w-4 h-4 accent-yellow-500"
              />
              <label className="text-gray-700 cursor-pointer">{material}</label>
            </motion.li>
          ))}
        </ul>
      </div>

      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-lg">📏</span>
          <h3 className="font-semibold text-gray-900">Size</h3>
        </div>
        <div className="flex gap-2 flex-wrap">
          {sizes.map((size) => (
            <motion.button
              key={size}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleSizeChange(size)}
              className={`px-3 py-1 rounded-lg border-2 text-sm font-medium ${
                selectedSize === size
                  ? "border-yellow-500 bg-yellow-50 text-yellow-700"
                  : "border-gray-300 hover:border-gray-400"
              }`}
            >
              {size}
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );

  if (isError) {
    console.error("❌ Error loading products:", error);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <p className="text-red-600 mb-4 font-semibold">
            Failed to load products
          </p>
          <p className="text-sm text-gray-600 mb-4">
            {error instanceof Error ? error.message : "Unknown error occurred"}
          </p>
          <button
            onClick={() =>
              queryClient.invalidateQueries({ queryKey: ["products"] })
            }
            className="px-6 py-3 bg-yellow-400 text-gray-900 rounded-lg font-semibold hover:bg-yellow-500 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ✅ FIXED: Breadcrumb - Desktop */}
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
            <Link href="/shop" className="hover:text-gray-900">
              Shop
            </Link>
            <span>›</span>
            <span className="text-gray-900">{category.name}</span>
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
          {/* ✅ FIXED: Back to shop */}
          <Link href="/shop">
            <motion.div whileTap={{ scale: 0.9 }}>
              <ChevronLeft className="w-6 h-6" />
            </motion.div>
          </Link>
          <div>
            <h2 className="font-semibold text-gray-900">{category.name}</h2>
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
            onClick={() => handleSortChange("createdAt-desc")}
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
            onClick={() => handleSortChange("price-asc")}
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
            onClick={() => handleSortChange("price-desc")}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
              sortBy === "price-desc"
                ? "bg-yellow-400 text-gray-900"
                : "border border-gray-300 text-gray-600"
            }`}
          >
            Price: High to Low
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => handleSortChange("popularity-desc")}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
              sortBy === "popularity-desc"
                ? "bg-yellow-400 text-gray-900"
                : "border border-gray-300 text-gray-600"
            }`}
          >
            Popular
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
            {category.name}
          </h1>
          {category.description && (
            <p className="text-gray-600 mt-2">{category.description}</p>
          )}
          <p className="text-gray-600 mt-1">
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
              onChange={(e) => handleSortChange(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              <option value="createdAt-desc">Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="popularity-desc">Most Popular</option>
              <option value="name-asc">Name: A to Z</option>
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
            {isLoading ? (
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
                <p className="text-gray-500">
                  No products found matching your filters
                </p>
                <button
                  onClick={clearAllFilters}
                  className="mt-4 text-yellow-600 hover:text-yellow-700 font-medium"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
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
                    {/* ✅ FIXED: Product detail link */}
                    <Link href={`/products/${product.slug}`}>
                      <div className="relative aspect-square overflow-hidden">
                        <motion.div
                          className="absolute inset-0"
                          initial={{ scale: 1 }}
                          whileHover={{ scale: 1.15 }}
                          transition={{ duration: 0.3, ease: "easeOut" }}
                        >
                          <Image
                            src={product.media?.[0]?.url || "/placeholder.jpg"}
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
                          ₹{Number(product.sellingPrice).toLocaleString()}
                        </span>
                        {product.basePrice > product.sellingPrice && (
                          <>
                            <span className="text-gray-400 line-through text-sm">
                              ₹{Number(product.basePrice).toLocaleString()}
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
                        disabled={addToCartMutation.isPending}
                        className="w-full bg-black text-white py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50"
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
            {!isLoading && totalPages > 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-8 flex justify-center items-center gap-2"
              >
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={i}
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-10 h-10 rounded-lg ${
                        currentPage === pageNum
                          ? "bg-yellow-400 text-gray-900"
                          : "hover:bg-gray-100"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
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
