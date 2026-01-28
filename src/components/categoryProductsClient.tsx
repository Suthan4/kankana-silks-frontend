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
  Video,
  AlertCircle,
  Palette,
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
import { Category } from "@/lib/api/category.api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCartStore } from "@/store/useCartStore";
import { formatMaskedPrice } from "@/lib/utils/priceMasked";
import { getColorHex, isValidCSSColor } from "@/lib/utils/colorValidation";

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
  const { addItem: addToLocalCart } = useCartStore();

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
    searchParams.get("search") || "",
  );

  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(
    searchParams.get("subcategory") || null,
  );

  const [selectedColor, setSelectedColor] = useState(
    searchParams.get("color") || "",
  );

  const [selectedFabric, setSelectedFabric] = useState(
    searchParams.get("fabric") || "",
  );

  const [selectedSize, setSelectedSize] = useState(
    searchParams.get("size") || "",
  );

  const [inStockOnly, setInStockOnly] = useState(
    searchParams.get("inStock") === "true",
  );

  const limit = 12;

  const materials = ["Pure Silk", "Cotton Silk", "Art Silk", "Georgette"];
  const colors = [
    "Red",
    "Gold",
    "Green",
    "Blue",
    "Pink",
    "Orange",
    "Purple",
    "Yellow",
    "Navy",
    "Maroon",
    "Beige",
    "Coral",
    "Turquoise",
    "Lavender",
    "Crimson",
    "Silver",
    "Brown",
    "Black",
    "White",
    "Gray",
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
    [searchParams, router],
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

  const { data: wishlistData = [] } = useQuery({
    queryKey: ["wishlist", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const res = await wishlistApi.getWishlist();
      const items = res?.data?.items ?? [];
      return items.map((i: any) => i.productId);
    },
  });

  const likedProducts = useMemo(() => {
    return new Set(Array.isArray(wishlistData) ? wishlistData : []);
  }, [wishlistData]);

  /* ------------------ MUTATIONS ------------------ */

  const toggleWishlistMutation = useMutation({
    mutationFn: async (productId: string) => {
      const wishlist = await wishlistApi.getWishlist();
      const item = wishlist.data.items?.find(
        (i: any) => i.productId === productId,
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
        data.action === "added" ? "Added to wishlist" : "Removed from wishlist",
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

  // ✅ FIXED: Add to cart mutation with proper local cart integration
  const addToCartMutation = useMutation({
    mutationFn: async (product: Product) => {
      // ✅ Create cart item matching API structure
      const availableStock = product.stock?.[0]?.quantity ?? 0;

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
          categoryId: product.categoryId,
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

      // ✅ Add to local cart first (always)
      addToLocalCart(cartItem);

      // ✅ If user is logged in, sync with server
      if (user) {
        await cartApi.addToCart({ productId: product.id, quantity: 1 });
      }
    },
    onSuccess: () => {
      if (user) {
        queryClient.invalidateQueries({ queryKey: ["cartApi"] });
      }
      toast.success("Added to cart");
    },
    onError: () => toast.error("Failed to add to cart"),
  });

  // ✅ Helper function to check if product can be added to cart
  const canAddToCart = (product: Product) => {
    const availableStock = product.stock?.[0]?.quantity ?? 0;
    const lowStockThreshold = product.stock?.[0]?.lowStockThreshold ?? 0;
    const allowOutOfStockOrders = product.allowOutOfStockOrders ?? false;

    // ✅ Rule 1: If stock is 0, always block Add to Cart
    if (availableStock === 0) {
      return false;
    }

    // ✅ Rule 2: If out-of-stock orders allowed, ignore threshold
    if (allowOutOfStockOrders) {
      return true;
    }

    // ✅ Rule 3: If stock <= threshold and out-of-stock orders NOT allowed
    if (availableStock <= lowStockThreshold) {
      return false;
    }

    return true;
  };

  // ✅ Helper function to check if product is out of stock
  const isProductOutOfStock = (product: Product) => {
    const availableStock = product.stock?.[0]?.quantity ?? 0;
    return availableStock === 0;
  };

  const handleAddToCart = (product: Product) => {
    if (!canAddToCart(product)) {
      toast.error("This product is currently unavailable");
      return;
    }

    addToCartMutation.mutate(product);
  };

  // ✅ Handle Video Consultation Click
  const handleVideoConsultation = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      openModal("login");
      toast.info("Please login to book a consultation");
      return;
    }

    router.push(`/my-account/consultation?productId=${product.id}`);
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
    // Validate if it's a custom color (not in the predefined list)
    if (color && !colors.includes(color)) {
      if (!isValidCSSColor(color)) {
        toast.error(`"${color}" is not a valid CSS color`);
        return;
      }
    }

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
        <div className="flex items-center gap-2 mb-4">
          <Palette className="h-5 w-5 text-purple-600" />
          <h3 className="font-semibold text-gray-900">Colors</h3>
        </div>

        {/* Color Grid - Responsive */}
        <div className="grid grid-cols-4 md:grid-cols-5 gap-3">
          {colors.map((colorName) => {
            const isSelected = selectedColor === colorName;
            const colorHex = getColorHex(colorName);
            const isValidColor = isValidCSSColor(colorName);

            return (
              <motion.button
                key={colorName}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleColorChange(colorName)}
                className={`group relative flex flex-col items-center gap-1.5 ${
                  isSelected
                    ? "ring-2 ring-yellow-500 ring-offset-2 rounded-lg p-1"
                    : ""
                }`}
              >
                {/* Color Swatch */}
                {isValidColor && colorHex ? (
                  <div
                    className="w-full aspect-square rounded-lg border-2 border-gray-300 shadow-sm transition-transform group-hover:scale-105"
                    style={{ backgroundColor: colorHex }}
                  />
                ) : (
                  /* Fallback for invalid colors */
                  <div className="w-full aspect-square rounded-lg border-2 border-gray-300 bg-gray-100 flex items-center justify-center">
                    <span className="text-xs text-gray-400">?</span>
                  </div>
                )}

                {/* Color Name Label */}
                <span className="text-[10px] md:text-xs text-gray-600 font-medium capitalize text-center line-clamp-1 w-full">
                  {colorName}
                </span>

                {/* Hex Tooltip on Hover - Desktop Only */}
                {isValidColor && colorHex && (
                  <div className="hidden md:block absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none">
                    {colorHex}
                  </div>
                )}

                {/* Selected Checkmark */}
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 bg-yellow-500 rounded-full p-0.5 shadow-md"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-3 h-3 text-white"
                    >
                      <path
                        fillRule="evenodd"
                        d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Custom Color Input */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
            Or enter a custom color:
          </label>
          <div className="grid gap-2 items-center">
            <div>
              <input
                type="text"
                value={selectedColor}
                onChange={(e) => setSelectedColor(e.target.value)}
                placeholder="e.g., DarkSlateGray, #FF5733"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                onKeyDown={(e) => {
                  if (
                    e.key === "Enter" &&
                    selectedColor &&
                    isValidCSSColor(selectedColor)
                  ) {
                    handleColorChange(selectedColor);
                  }
                }}
              />
            </div>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  if (selectedColor && isValidCSSColor(selectedColor)) {
                    handleColorChange(selectedColor);
                  } else if (selectedColor) {
                    toast.error(
                      "Please enter a valid CSS color name or hex code",
                    );
                  }
                }}
                disabled={!selectedColor || !isValidCSSColor(selectedColor)}
                className="w-auto px-4 py-2 bg-yellow-400 text-gray-900 rounded-lg font-medium hover:bg-yellow-500 transition-colors text-xs md:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Apply
              </motion.button>
          </div>

          {/* Validation Feedback */}
          {selectedColor && !colors.includes(selectedColor) && (
            <div className="mt-2">
              {isValidCSSColor(selectedColor) ? (
                <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 p-2 rounded-lg border border-green-200">
                  <div
                    className="w-5 h-5 rounded border-2 border-green-300 shadow-sm flex-shrink-0"
                    style={{
                      backgroundColor:
                        getColorHex(selectedColor) || selectedColor,
                    }}
                  />
                  <div className="flex-1">
                    <p className="font-medium">Valid color: {selectedColor}</p>
                    <p className="text-[10px] text-green-700">
                      {getColorHex(selectedColor)}
                    </p>
                  </div>
                </div>
              ) : (
                selectedColor && (
                  <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 p-2 rounded-lg border border-red-200">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <p>Invalid color. Try a CSS color name or hex code.</p>
                  </div>
                )
              )}
            </div>
          )}

          {/* Clear Custom Color Button */}
          {selectedColor &&
            !colors.includes(selectedColor) &&
            isValidCSSColor(selectedColor) && (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setSelectedColor("");
                  handleColorChange("");
                }}
                className="mt-2 w-full px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-xs md:text-sm font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
              >
                <X className="w-4 h-4" />
                Clear Custom Color
              </motion.button>
            )}
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
                {products.map((product, index) => {
                  const availableStock = product.stock?.[0]?.quantity ?? 0;
                  const isOutOfStock = isProductOutOfStock(product);
                  const showAddToCart = canAddToCart(product);
                  const displayPrice = Number(product.sellingPrice);
                  const basePrice = Number(product.basePrice);
                  const discount =
                    basePrice > displayPrice
                      ? Math.round(
                          ((basePrice - displayPrice) / basePrice) * 100,
                        )
                      : 0;
                  console.log("PRODUCT:", product.name, {
                    qty: product.stock?.[0]?.quantity,
                    low: product.stock?.[0]?.lowStockThreshold,
                    allowOut: product.allowOutOfStockOrders,
                    showAddToCart: canAddToCart(product),
                  });

                  return (
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

                          {/* ✅ Out of Stock Badge */}
                          {isOutOfStock && (
                            <div className="absolute top-2 left-2 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-semibold z-10">
                              Out of Stock
                            </div>
                          )}

                          {/* ✅ Discount Badge - Only show if in stock */}
                          {!isOutOfStock && discount > 0 && (
                            <div className="absolute top-2 left-2 bg-green-600 text-white px-3 py-1 rounded-full text-xs font-semibold z-10">
                              {discount}% OFF
                            </div>
                          )}

                          {/* ✅ Video Consultation Icon - Show only if enabled and in stock */}
                          {!isOutOfStock &&
                            product.hasVideoConsultation &&
                            product.videoPurchasingEnabled && (
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={(e) =>
                                  handleVideoConsultation(e, product)
                                }
                                className="absolute top-2 right-12 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full p-2 shadow-lg z-10"
                                title="Video Consultation Available"
                              >
                                <Video className="w-4 h-4" />
                              </motion.button>
                            )}

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

                        {/* ✅ FIXED: Price Display - Show masked price when out of stock */}
                        <div className="flex items-center gap-2 mb-2">
                          {isOutOfStock ? (
                            /* OUT OF STOCK: Show masked prices */
                            <>
                              <span className="text-yellow-600 font-bold">
                                {formatMaskedPrice(displayPrice)}
                              </span>
                              {discount > 0 && (
                                <>
                                  <span className="text-gray-400 line-through text-sm">
                                    {formatMaskedPrice(basePrice)}
                                  </span>
                                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                                    {discount}% OFF
                                  </span>
                                </>
                              )}
                            </>
                          ) : (
                            /* IN STOCK: Show formatted prices */
                            <>
                              <span className="text-yellow-600 font-bold">
                                ₹{displayPrice.toLocaleString()}
                              </span>
                              {discount > 0 && (
                                <>
                                  <span className="text-gray-400 line-through text-sm">
                                    ₹{basePrice.toLocaleString()}
                                  </span>
                                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                                    {discount}% OFF
                                  </span>
                                </>
                              )}
                            </>
                          )}
                        </div>

                        {/* ✅ FIXED: Conditional Button Rendering */}
                        {showAddToCart ? (
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleAddToCart(product)}
                            disabled={addToCartMutation.isPending}
                            className="w-full bg-black text-white py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                          >
                            <ShoppingCart className="w-4 h-4" />
                            Add to Cart
                          </motion.button>
                        ) : (
                          <div className="w-full bg-gray-100 text-gray-500 py-2 rounded-lg text-sm font-medium text-center flex items-center justify-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            {isOutOfStock ? "Out of Stock" : "Unavailable"}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
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
