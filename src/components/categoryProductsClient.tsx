// "use client";
// import { useState, useCallback, useMemo, memo, useRef } from "react";
// import { useRouter, useSearchParams } from "next/navigation";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//   Heart,
//   ChevronLeft,
//   SlidersHorizontal,
//   Search,
//   X,
//   ShoppingCart,
//   Video,
//   AlertCircle,
//   Palette,
// } from "lucide-react";
// import Image from "next/image";
// import Link from "next/link";
// import {
//   productApi,
//   type Product,
//   type ProductQueryParams,
// } from "@/lib/api/product.api";
// import { cartApi } from "@/lib/api/cart.api";
// import { useAuthModal } from "@/store/useAuthModalStore";
// import { toast } from "sonner";
// import { Category } from "@/lib/api/category.api";
// import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
// import { useCartStore } from "@/store/useCartStore";
// import { formatMaskedPrice } from "@/lib/utils/priceMasked";
// import { getColorHex, isValidCSSColor } from "@/lib/utils/colorValidation";
// import { useWishlist } from "@/hooks/useWishlist";
// import SortDropdown from "./customDropdown";
// import { useCartDrawer } from "@/store/useCartDrawer";

// interface CategoryProductsClientProps {
//   category: Category;
// }

// export default function CategoryProductsClient({
//   category,
// }: CategoryProductsClientProps) {
//   const { user, openModal } = useAuthModal();
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const queryClient = useQueryClient();
//   const { addItem: addToLocalCart } = useCartStore();
//   const { open } = useCartDrawer();

//   const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
//   const [desktopFilterOpen, setDesktopFilterOpen] = useState(false);

//   // Filter state - Initialize from URL
//   const [priceRange, setPriceRange] = useState<[number, number]>(() => {
//     const min = Number(searchParams.get("minPrice"));
//     const max = Number(searchParams.get("maxPrice"));
//     return [min > 0 ? min : 0, max > 0 && max < 100000 ? max : 100000];
//   });

//   const [sortBy, setSortBy] = useState<
//     | "createdAt-desc"
//     | "price-asc"
//     | "price-desc"
//     | "popularity-desc"
//     | "name-asc"
//   >(() => {
//     const sortByParam = searchParams.get("sortBy") || "createdAt";
//     const sortOrderParam = searchParams.get("sortOrder") || "desc";
//     return `${sortByParam}-${sortOrderParam}` as any;
//   });

//   const [searchQuery, setSearchQuery] = useState(
//     searchParams.get("search") || "",
//   );

//   const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(
//     searchParams.get("subcategory") || null,
//   );

//   const [selectedColor, setSelectedColor] = useState(
//     searchParams.get("color") || "",
//   );

//   const [selectedFabric, setSelectedFabric] = useState<string[]>(
//     searchParams.get("fabric") ? searchParams.get("fabric")!.split(",") : [],
//   );

//   const [selectedSize, setSelectedSize] = useState(
//     searchParams.get("size") || "",
//   );

//   const [inStockOnly, setInStockOnly] = useState(
//     searchParams.get("inStock") === "true",
//   );
//   const debounceTimer = useRef<NodeJS.Timeout | null>(null);

//   const limit = 12;
//   const options = [
//     { label: "Featured", value: "createdAt-desc" },
//     { label: "Price: Low to High", value: "price-asc" },
//     { label: "Price: High to Low", value: "price-desc" },
//     { label: "Most Popular", value: "popularity-desc" },
//   ];
//   const materials = ["Pure Silk", "Cotton Silk", "Art Silk", "Georgette"];

//   const colors = [
//     "Red",
//     "Gold",
//     "Green",
//     "Blue",
//     "Pink",
//     "Orange",
//     "Purple",
//     "Yellow",
//     "Navy",
//     "Maroon",
//     "Beige",
//     "Coral",
//     "Turquoise",
//     "Lavender",
//     "Crimson",
//     "Silver",
//     "Brown",
//     "Black",
//     "White",
//     "Gray",
//   ];
//   const sizes = ["S", "M", "L", "XL", "Free Size"];

//   const updateFilters = useCallback(
//     (updates: Record<string, string | number | boolean | null>) => {
//       const params = new URLSearchParams(searchParams.toString());

//       Object.entries(updates).forEach(([key, value]) => {
//         if (
//           value === null ||
//           value === "" ||
//           value === false ||
//           (key === "minPrice" && value === 0) ||
//           (key === "maxPrice" && value === 100000)
//         ) {
//           params.delete(key);
//         } else {
//           params.set(key, String(value));
//         }
//       });

//       router.replace(`?${params.toString()}`, { scroll: false });
//     },
//     [searchParams, router],
//   );

//   /* ------------------ BUILD QUERY PARAMS ------------------ */

//   const queryParams: ProductQueryParams = useMemo(() => {
//     const params: ProductQueryParams = {
//       page: Number(searchParams.get("page")) || 1,
//       limit,
//       isActive: true,
//     };

//     // Category
//     if (selectedSubCategory) {
//       const sub = category.children?.find((c) => c.id === selectedSubCategory);
//       if (sub) params.categorySlug = sub.slug;
//     } else {
//       params.categorySlug = category.slug;
//     }

//     // Search
//     const search = searchParams.get("search");
//     if (search) params.search = search;

//     // Price
//     const minPrice = Number(searchParams.get("minPrice"));
//     const maxPrice = Number(searchParams.get("maxPrice"));

//     if (minPrice && minPrice > 0) {
//       params.minPrice = minPrice;
//     }

//     if (maxPrice && maxPrice > 0 && maxPrice < 100000) {
//       params.maxPrice = maxPrice;
//     }

//     // Sorting
//     params.sortBy = (searchParams.get("sortBy") || "createdAt") as any;
//     params.sortOrder = (searchParams.get("sortOrder") || "desc") as any;

//     // Advanced filters
//     const color = searchParams.get("color");
//     if (color) params.color = color;

//     // ✅ FIXED FABRIC (multi-select)
//     const fabricParam = searchParams.get("fabric");
//     if (fabricParam) {
//       params.fabric = fabricParam
//         .split(",")
//         .map((f) => f.trim())
//         .filter(Boolean);
//     }

//     const size = searchParams.get("size");
//     if (size) params.size = size;

//     if (searchParams.get("inStock") === "true") params.inStock = true;

//     return params;
//   }, [searchParams, category, selectedSubCategory]);

//   /* ------------------ PRODUCTS QUERY ------------------ */

//   const {
//     data: productRes,
//     isLoading,
//     isFetching,
//     isError,
//     error,
//   } = useQuery({
//     queryKey: ["products", category.slug, JSON.stringify(queryParams)],
//     queryFn: async () => {
//       console.log("🔵 Fetching products with params:", queryParams);
//       const result = await productApi.getProducts(queryParams);
//       console.log("✅ Products fetched:", result);
//       return result;
//     },
//     staleTime: 30000,
//     refetchOnWindowFocus: false,
//     refetchOnMount: false,
//     retry: 1,
//   });

//   const products = productRes?.data?.products ?? [];
//   const total = productRes?.data?.pagination?.total ?? 0;
//   const totalPages = productRes?.data?.pagination?.totalPages ?? 1;
//   const currentPage = productRes?.data?.pagination?.page ?? 1;
//   console.log("products-res", JSON.stringify(productRes, null, 2));

//   /* ------------------ WISHLIST QUERY ------------------ */

//   const { isProductWishlisted, toggleWishlist } = useWishlist();

//   /* ------------------ MUTATIONS ------------------ */

//   // const toggleWishlistMutation = useMutation({
//   //   mutationFn: async (productId: string) => {
//   //     const wishlist = await wishlistApi.getWishlist();
//   //     const item = wishlist.data.items?.find(
//   //       (i: any) => i.productId === productId,
//   //     );
//   //     if (item) {
//   //       await wishlistApi.removeFromWishlist(item.id);
//   //       return { action: "removed", productId };
//   //     } else {
//   //       await wishlistApi.addToWishlist({ productId });
//   //       return { action: "added", productId };
//   //     }
//   //   },
//   //   onSuccess: (data) => {
//   //     // ✅ Invalidate BOTH keys so header count + card heart stay in sync
//   //     queryClient.invalidateQueries({ queryKey: ["wishlist", user?.id] });
//   //     queryClient.invalidateQueries({ queryKey: ["wishlist-ids", user?.id] });
//   //     toast.success(
//   //       data.action === "added" ? "Added to wishlist" : "Removed from wishlist",
//   //     );
//   //   },
//   //   onError: () => {
//   //     toast.error("Failed to update wishlist");
//   //   },
//   // });

//   // const toggleWishlist = (productId: string) => {
//   //   if (!user) {
//   //     openModal("login");
//   //     return;
//   //   }
//   //   toggleWishlistMutation.mutate(productId);
//   // };

//   // ✅ FIXED: Add to cart mutation with proper local cart integration
//   const addToCartMutation = useMutation({
//     mutationFn: async ({
//       product,
//       variant,
//     }: {
//       product: Product;
//       variant?: any;
//     }) => {
//       const availableStock = product.stock?.[0]?.quantity ?? 0;

//       const cartItem = {
//         id: crypto.randomUUID(),
//         cartId: "local",
//         productId: product.id,
//         variantId: variant?.id ?? null,
//         quantity: 1,
//         product: {
//           id: product.id,
//           name: product.name,
//           slug: product.slug,
//           categoryId: product.categoryId,
//           sellingPrice: Number(product.sellingPrice),
//           basePrice: Number(product.basePrice),
//           media: [
//             {
//               url: product.media?.[0]?.url ?? "/placeholder.jpg",
//               altText: product.name,
//               isActive: true,
//             },
//           ],
//           stock: [{ quantity: availableStock }],
//         },
//         variant: variant
//           ? {
//               id: variant.id,
//               sellingPrice: Number(variant.sellingPrice),
//               basePrice: Number(variant.basePrice),
//               attributes: variant.attributes,
//               size: variant.size,
//               color: variant.color,
//               fabric: variant.fabric,
//             }
//           : null,
//       };

//       addToLocalCart(cartItem);

//       if (user) {
//         await cartApi.addToCart({
//           productId: product.id,
//           variantId: variant?.id,
//           quantity: 1,
//         });
//       }
//     },

//     onSuccess: () => {
//       if (user) {
//         queryClient.invalidateQueries({ queryKey: ["cartApi"] });
//       }
//       open();
//     },

//     onError: () => toast.error("Failed to add to cart"),
//   });
//   const updateQtyMutation = useMutation({
//     mutationFn: async ({
//       itemId,
//       quantity,
//     }: {
//       itemId: string;
//       quantity: number;
//     }) => await cartApi.updateCartItem(itemId, { quantity }),

//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["cartApi"] });
//       open();
//     },

//     onError: () => toast.error("Failed to update quantity"),
//   });
//   const {
//     data: cartData,
//     isLoading: isLoadingCartApi,
//     refetch: refetchCartApi,
//   } = useQuery({
//     queryKey: ["cartApi", user?.id],
//     queryFn: async () => (await cartApi.getCart()).data,
//     enabled: !!user,
//   });

//   const removeItemMutation = useMutation({
//     mutationFn: async (itemId: string) => await cartApi.removeFromCart(itemId),

//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["cartApi"] });
//     },

//     onError: () => toast.error("Failed to remove item"),
//   });

//   const cartItems = useCartStore((state) => state.items);
//   const effectiveCartItems = user ? (cartData?.items ?? []) : cartItems;
//   const updateQuantityLocal = useCartStore((state) => state.updateQuantity);
//   const removeItemLocal = useCartStore((state) => state.removeItem);

//   const isProductUnavailable = (product: Product) => {
//     const qty = product.stock?.[0]?.quantity ?? 0;
//     const threshold = product.stock?.[0]?.lowStockThreshold ?? 0;
//     const allowOut = product.allowOutOfStockOrders ?? false;

//     // Rule 1: No stock = always unavailable
//     if (qty === 0) return true;

//     // Rule 2: If out-of-stock orders allowed → always available
//     if (allowOut) return false;

//     // Rule 3: If qty <= threshold → unavailable
//     if (qty <= threshold) return true;

//     return false;
//   };

//   // ✅ Helper function to check if product can be added to cart
//   const canAddToCart = (product: Product) => {
//     return !isProductUnavailable(product);
//   };

//   // ✅ Helper function to check if product is out of stock
//   const isProductOutOfStock = (product: Product) => {
//     const qty = product.stock?.[0]?.quantity ?? 0;
//     return qty === 0;
//   };

//   const handleAddToCart = (product: Product) => {
//     if (!canAddToCart(product)) {
//       toast.error("This product is currently unavailable");
//       return;
//     }

//     const variants = product.variants ?? [];
//     const hasVariants = product.hasVariants && variants.length > 0;

//     // ✅ ONE VARIANT → AUTO SELECT
//     if (hasVariants && variants.length === 1) {
//       addToCartMutation.mutate({
//         product,
//         variant: variants[0],
//       });
//       return;
//     }

//     // ⚠️ MULTIPLE VARIANTS → REDIRECT
//     if (hasVariants && variants.length > 1) {
//       router.push(`/${product.category?.slug}/${product.slug}`);
//       toast.info("Please select product options");
//       return;
//     }

//     // ✅ NO VARIANTS
//     addToCartMutation.mutate({
//       product,
//       variant: null,
//     });
//   };

//   // ✅ Handle Video Consultation Click
//   const handleVideoConsultation = (e: React.MouseEvent, product: Product) => {
//     e.preventDefault();
//     e.stopPropagation();

//     if (!user) {
//       openModal("login");
//       toast.info("Please login to book a consultation");
//       return;
//     }

//     router.push(`/my-account/consultation?productId=${product.id}`);
//   };

//   /* ------------------ HANDLERS ------------------ */

//   const handlePageChange = (page: number) => {
//     updateFilters({ page });
//     window.scrollTo({ top: 0, behavior: "smooth" });
//   };

//   const handleSubCategoryChange = (subCatId: string | null) => {
//     setSelectedSubCategory(subCatId);
//     updateFilters({ subcategory: subCatId, page: 1 });
//   };

//   const handlePriceRangeChange = (newRange: [number, number]) => {
//     setPriceRange(newRange);

//     if (debounceTimer.current) clearTimeout(debounceTimer.current);

//     debounceTimer.current = setTimeout(() => {
//       updateFilters({
//         minPrice: newRange[0],
//         maxPrice: newRange[1],
//         page: 1,
//       });
//     }, 400);
//   };

//   const handleSortChange = (newSort: typeof sortBy) => {
//     setSortBy(newSort);
//     const [field, order] = newSort.split("-");
//     updateFilters({ sortBy: field, sortOrder: order, page: 1 });
//   };

//   const handleColorChange = (color: string) => {
//     // Validate if it's a custom color (not in the predefined list)
//     if (color && !colors.includes(color)) {
//       if (!isValidCSSColor(color)) {
//         toast.error(`"${color}" is not a valid CSS color`);
//         return;
//       }
//     }

//     const newColor = selectedColor === color ? "" : color;
//     setSelectedColor(newColor);
//     updateFilters({ color: newColor || null, page: 1 });
//   };

//   const handleFabricChange = (material: string) => {
//     const updated = selectedFabric.includes(material)
//       ? selectedFabric.filter((item) => item !== material)
//       : [...selectedFabric, material];

//     setSelectedFabric(updated);

//     updateFilters({
//       fabric: updated.length > 0 ? updated.join(",") : null, // 🔥 KEY FIX
//       page: 1,
//     });
//   };

//   const handleSizeChange = (size: string) => {
//     const newSize = selectedSize === size ? "" : size;
//     setSelectedSize(newSize);
//     updateFilters({ size: newSize || null, page: 1 });
//   };

//   const handleInStockChange = (value: boolean) => {
//     setInStockOnly(value);
//     updateFilters({ inStock: value || null, page: 1 });
//   };

//   const clearAllFilters = () => {
//     setPriceRange([0, 100000]);
//     setSelectedColor("");
//     setSelectedFabric([]);
//     setSelectedSize("");
//     setInStockOnly(false);
//     setSelectedSubCategory(null);
//     setSearchQuery("");

//     router.push(`/shop/${category.slug}`);
//   };

//   const FilterSidebar = memo(({ isMobile = false }: { isMobile?: boolean }) => (
//     <motion.div
//       initial={false}
//       animate={{ opacity: 1 }}
//       transition={{ duration: 0.3 }}
//       className={`${isMobile ? "p-6" : ""}`}
//     >
//       <div className="mb-6">
//         <button
//           onClick={clearAllFilters}
//           className="text-sm text-red-600 hover:text-red-700 font-medium"
//         >
//           Clear All Filters
//         </button>
//       </div>

//       {category.children && category.children.length > 0 && (
//         <div className="mb-6">
//           <div className="flex items-center gap-2 mb-4">
//             {/* <span className="text-lg">📂</span> */}
//             <h3 className="font-semibold text-gray-900">Subcategories</h3>
//           </div>
//           <ul className="space-y-2">
//             <motion.li
//               whileTap={{ scale: 0.98 }}
//               onClick={() => handleSubCategoryChange(null)}
//               className={`cursor-pointer py-2 px-3 rounded-lg transition-colors relative ${
//                 selectedSubCategory === null
//                   ? "bg-yellow-50 text-yellow-700 font-medium"
//                   : "text-gray-700 hover:bg-gray-50"
//               }`}
//             >
//               All {category.name}
//             </motion.li>
//             {category.children.map((subCat) => (
//               <motion.li
//                 key={subCat.id}
//                 whileTap={{ scale: 0.98 }}
//                 onClick={() => handleSubCategoryChange(subCat.id)}
//                 className={`cursor-pointer py-2 px-3 rounded-lg transition-colors relative ${
//                   selectedSubCategory === subCat.id
//                     ? "bg-yellow-50 text-yellow-700 font-medium"
//                     : "text-gray-700 hover:bg-gray-50"
//                 }`}
//               >
//                 {subCat.name}
//               </motion.li>
//             ))}
//           </ul>
//         </div>
//       )}

//       <div className="mb-6">
//         <label className="flex items-center gap-2 cursor-pointer">
//           <input
//             type="checkbox"
//             checked={inStockOnly}
//             onChange={(e) => handleInStockChange(e.target.checked)}
//             className="w-4 h-4 accent-main-primary rounded"
//           />
//           <span className="text-sm font-medium text-gray-700">
//             In Stock Only
//           </span>
//         </label>
//       </div>

//       <div className="mb-6">
//         <div className="flex items-center gap-2 mb-4">
//           {/* <span className="text-lg">💰</span> */}
//           <h3 className="font-semibold text-gray-900">Price Range</h3>
//         </div>
//         <div className="space-y-4">
//           <input
//             type="range"
//             min="0"
//             max="100000"
//             step="1000"
//             value={priceRange[1]}
//             onChange={(e) =>
//               handlePriceRangeChange([priceRange[0], Number(e.target.value)])
//             }
//             className="w-full accent-main-primary"
//           />
//           <div className="flex justify-between text-sm text-gray-600">
//             <span>₹{priceRange[0].toLocaleString("en-IN")}</span>
//             <span>₹{priceRange[1].toLocaleString("en-IN")}</span>
//           </div>
//         </div>
//       </div>

//       {/* <div className="mb-6">
//         <div className="flex items-center gap-2 mb-4">
//           <Palette className="h-5 w-5 text-purple-600" />
//           <h3 className="font-semibold text-gray-900">Colors</h3>
//         </div>

//         // Color Grid - Responsive
//         <div className="grid grid-cols-4 md:grid-cols-5 gap-3">
//           {colors.map((colorName) => {
//             const isSelected = selectedColor === colorName;
//             const colorHex = getColorHex(colorName);
//             const isValidColor = isValidCSSColor(colorName);

//             return (
//               <motion.button
//                 key={colorName}
//                 whileHover={{ scale: 1.05 }}
//                 whileTap={{ scale: 0.95 }}
//                 onClick={() => handleColorChange(colorName)}
//                 className={`group relative flex flex-col items-center gap-1.5 ${
//                   isSelected
//                     ? "ring-2 ring-yellow-500 ring-offset-2 rounded-lg p-1"
//                     : ""
//                 }`}
//               >
//                 // Color Swatch
//                 {isValidColor && colorHex ? (
//                   <div
//                     className="w-full aspect-square rounded-lg border-2 border-gray-300 shadow-sm transition-transform group-hover:scale-105"
//                     style={{ backgroundColor: colorHex }}
//                   />
//                 ) : (
//                  //  Fallback for invalid colors
//                   <div className="w-full aspect-square rounded-lg border-2 border-gray-300 bg-gray-100 flex items-center justify-center">
//                     <span className="text-xs text-gray-400">?</span>
//                   </div>
//                 )}

//                 // Color Name Label
//                 <span className="text-[10px] md:text-xs text-gray-600 font-medium capitalize text-center line-clamp-1 w-full">
//                   {colorName}
//                 </span>

//                 // Hex Tooltip on Hover - Desktop Only
//                 {isValidColor && colorHex && (
//                   <div className="hidden md:block absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none">
//                     {colorHex}
//                   </div>
//                 )}

//                 // Selected Checkmark
//                 {isSelected && (
//                   <motion.div
//                     initial={{ scale: 0 }}
//                     animate={{ scale: 1 }}
//                     className="absolute -top-1 -right-1 bg-yellow-500 rounded-full p-0.5 shadow-md"
//                   >
//                     <svg
//                       xmlns="http://www.w3.org/2000/svg"
//                       viewBox="0 0 24 24"
//                       fill="currentColor"
//                       className="w-3 h-3 text-white"
//                     >
//                       <path
//                         fillRule="evenodd"
//                         d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z"
//                         clipRule="evenodd"
//                       />
//                     </svg>
//                   </motion.div>
//                 )}
//               </motion.button>
//             );
//           })}
//         </div>

//         // Custom Color Input
//         <div className="mt-4 pt-4 border-t border-gray-200">
//           <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
//             Or enter a custom color:
//           </label>
//           <div className="grid gap-2 items-center">
//             <div>
//               <input
//                 type="text"
//                 value={selectedColor}
//                 onChange={(e) => setSelectedColor(e.target.value)}
//                 placeholder="e.g., DarkSlateGray, #FF5733"
//                 className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
//                 onKeyDown={(e) => {
//                   if (
//                     e.key === "Enter" &&
//                     selectedColor &&
//                     isValidCSSColor(selectedColor)
//                   ) {
//                     handleColorChange(selectedColor);
//                   }
//                 }}
//               />
//             </div>
//             <motion.button
//               whileTap={{ scale: 0.95 }}
//               onClick={() => {
//                 if (selectedColor && isValidCSSColor(selectedColor)) {
//                   handleColorChange(selectedColor);
//                 } else if (selectedColor) {
//                   toast.error(
//                     "Please enter a valid CSS color name or hex code",
//                   );
//                 }
//               }}
//               disabled={!selectedColor || !isValidCSSColor(selectedColor)}
//               className="w-auto px-4 py-2 bg-yellow-400 text-gray-900 rounded-lg font-medium hover:bg-yellow-500 transition-colors text-xs md:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               Apply
//             </motion.button>
//           </div>

//           // Validation Feedback
//           {selectedColor && !colors.includes(selectedColor) && (
//             <div className="mt-2">
//               {isValidCSSColor(selectedColor) ? (
//                 <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 p-2 rounded-lg border border-green-200">
//                   <div
//                     className="w-5 h-5 rounded border-2 border-green-300 shadow-sm flex-shrink-0"
//                     style={{
//                       backgroundColor:
//                         getColorHex(selectedColor) || selectedColor,
//                     }}
//                   />
//                   <div className="flex-1">
//                     <p className="font-medium">Valid color: {selectedColor}</p>
//                     <p className="text-[10px] text-green-700">
//                       {getColorHex(selectedColor)}
//                     </p>
//                   </div>
//                 </div>
//               ) : (
//                 selectedColor && (
//                   <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 p-2 rounded-lg border border-red-200">
//                     <AlertCircle className="w-4 h-4 flex-shrink-0" />
//                     <p>Invalid color. Try a CSS color name or hex code.</p>
//                   </div>
//                 )
//               )}
//             </div>
//           )}

//            // Clear Custom Color Button
//           {selectedColor &&
//             !colors.includes(selectedColor) &&
//             isValidCSSColor(selectedColor) && (
//               <motion.button
//                 whileTap={{ scale: 0.95 }}
//                 onClick={() => {
//                   setSelectedColor("");
//                   handleColorChange("");
//                 }}
//                 className="mt-2 w-full px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-xs md:text-sm font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
//               >
//                 <X className="w-4 h-4" />
//                 Clear Custom Color
//               </motion.button>
//             )}
//         </div>
//       </div>   */}

//       <div className="mb-6">
//         <div className="flex items-center gap-2 mb-4">
//           {/* <span className="text-lg">🧵</span> */}
//           <h3 className="font-semibold text-gray-900">Fabric</h3>
//         </div>
//         <ul className="space-y-2">
//           {materials.map((material) => (
//             <motion.li
//               key={material}
//               whileTap={{ scale: 0.98 }}
//               className="flex items-center gap-2"
//             >
//               <input
//                 type="checkbox"
//                 checked={selectedFabric.includes(material)}
//                 onChange={() => handleFabricChange(material)}
//                 className="w-4 h-4 accent-main-primary"
//               />
//               <label className="text-gray-700 cursor-pointer">{material}</label>
//             </motion.li>
//           ))}
//         </ul>
//       </div>

//       {/* <div className="mb-6">
//         <div className="flex items-center gap-2 mb-4">
//           <span className="text-lg">📏</span>
//           <h3 className="font-semibold text-gray-900">Size</h3>
//         </div>
//         <div className="flex gap-2 flex-wrap">
//           {sizes.map((size) => (
//             <motion.button
//               key={size}
//               whileTap={{ scale: 0.95 }}
//               onClick={() => handleSizeChange(size)}
//               className={`px-3 py-1 rounded-lg border-2 text-sm font-medium ${
//                 selectedSize === size
//                   ? "border-yellow-500 bg-yellow-50 text-yellow-700"
//                   : "border-gray-300 hover:border-gray-400"
//               }`}
//             >
//               {size}
//             </motion.button>
//           ))}
//         </div>
//       </div> */}
//     </motion.div>
//   ));

//   if (isError) {
//     console.error("❌ Error loading products:", error);
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="text-center max-w-md">
//           <p className="text-red-600 mb-4 font-semibold">
//             Failed to load products
//           </p>
//           <p className="text-sm text-gray-600 mb-4">
//             {error instanceof Error ? error.message : "Unknown error occurred"}
//           </p>
//           <button
//             onClick={() =>
//               queryClient.invalidateQueries({ queryKey: ["products"] })
//             }
//             className="px-6 py-3 bg-yellow-400 text-gray-900 rounded-lg font-semibold hover:bg-yellow-500 transition-colors"
//           >
//             Retry
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Breadcrumb - Desktop */}
//       {/* <motion.div
//         initial={{ opacity: 0, y: -10 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.3 }}
//         className="hidden md:block bg-white"
//       >
//         <div className="container mx-auto px-6 py-3">
//           <div className="flex items-center gap-2 text-sm text-gray-600">
//             <Link href="/" className="hover:text-gray-900 cursor-pointer">
//               Home
//             </Link>
//             <span>›</span>
//             <Link href="/shop" className="hover:text-gray-900">
//               Shop
//             </Link>
//             <span>›</span>
//             <span className="text-gray-900">{category.name}</span>
//           </div>
//         </div>
//       </motion.div> */}

//       {/* Mobile Header */}
//       <motion.div
//         initial={{ opacity: 0, y: -20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.3 }}
//         className="md:hidden bg-white border-b sticky top-0 z-40"
//       >
//         <div className="flex items-center gap-3 px-4 py-3">
//           <Link href="/shop">
//             <motion.div whileTap={{ scale: 0.9 }}>
//               <ChevronLeft className="w-6 h-6" />
//             </motion.div>
//           </Link>
//           <div>
//             <h2 className="font-semibold text-gray-900">{category.name}</h2>
//             <p className="text-xs text-gray-500">{total} items</p>
//           </div>
//           <div className="ml-auto flex items-center gap-3">
//             <motion.div whileTap={{ scale: 0.9 }}>
//               <Link href="/wishlist">
//                 <Heart className="w-6 h-6" />
//               </Link>
//             </motion.div>
//           </div>
//         </div>

//         {/* Mobile Filter Chips */}
//         <div className="flex gap-2 px-4 pb-3 overflow-x-auto">
//           <motion.button
//             whileTap={{ scale: 0.95 }}
//             onClick={() => handleSortChange("createdAt-desc")}
//             className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
//               sortBy === "createdAt-desc"
//                 ? "bg-main-primary text-main-secondary"
//                 : "bg-gray-100 text-gray-600"
//             }`}
//           >
//             Featured
//           </motion.button>
//           <motion.button
//             whileTap={{ scale: 0.95 }}
//             onClick={() => handleSortChange("price-asc")}
//             className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
//               sortBy === "price-asc"
//                 ? "bg-main-primary text-main-secondary"
//                 : "border border-gray-300 text-gray-600"
//             }`}
//           >
//             Price: Low to High
//           </motion.button>
//           <motion.button
//             whileTap={{ scale: 0.95 }}
//             onClick={() => handleSortChange("price-desc")}
//             className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
//               sortBy === "price-desc"
//                 ? "bg-main-primary text-main-secondary"
//                 : "border border-gray-300 text-gray-600"
//             }`}
//           >
//             Price: High to Low
//           </motion.button>
//           <motion.button
//             whileTap={{ scale: 0.95 }}
//             onClick={() => handleSortChange("popularity-desc")}
//             className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
//               sortBy === "popularity-desc"
//                 ? "bg-main-primary text-main-secondary"
//                 : "border border-gray-300 text-gray-600"
//             }`}
//           >
//             Popular
//           </motion.button>
//         </div>
//       </motion.div>

//       <div className="max-w-[1600px] mx-auto px-4 md:px-8 xl:px-10 pt-2 md:pt-3 pb-6">
//         {" "}
//         {/* Desktop Header */}
//         <motion.div
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           transition={{ duration: 0.3 }}
//           className="hidden md:flex items-center justify-between mb-4"
//         >
//           <div className="flex items-end gap-3">
//             <h1 className="text-[34px] leading-none font-light tracking-tight text-black">
//               {category.name}
//             </h1>

//             <span className="text-sm text-gray-400 pb-1">{total} Products</span>
//           </div>
//         </motion.div>
//         {/* Sort By - Desktop */}
//         {/* <motion.div
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           transition={{ duration: 0.3, delay: 0.1 }}
//           className="hidden md:flex justify-end mb-6"
//         >
//           <SortDropdown
//             value={sortBy}
//             onChange={(val) => handleSortChange(val as any)}
//           />
//         </motion.div> */}
//         <div className="flex gap-8 relative">
//           {/* DESKTOP FILTER SIDEBAR */}
//           <AnimatePresence>
//             {desktopFilterOpen && (
//               <motion.aside
//                 initial={{ opacity: 0, x: -20 }}
//                 animate={{ opacity: 1, x: 0 }}
//                 exit={{ opacity: 0, x: -20 }}
//                 transition={{ duration: 0.25 }}
//                 className="hidden xl:block w-[280px] flex-shrink-0"
//               >
//                 <div className="sticky top-24 bg-white border border-gray-100 rounded-3xl p-6 shadow-[0_4px_30px_rgba(0,0,0,0.04)]">
//                   <FilterSidebar />
//                 </div>
//               </motion.aside>
//             )}
//           </AnimatePresence>

//           {/* PRODUCT AREA */}
//           <div className="flex-1 min-w-0">
//             {/* PREMIUM TOP BAR */}
//             <div className="sticky top-[72px] z-20 bg-gray-50/90 backdrop-blur-xl mb-4">
//               <div className="flex items-center justify-between border border-gray-100 bg-white rounded-2xl px-4 md:px-6 py-3 shadow-sm">
//                 {/* LEFT */}
//                 <div className="flex items-center gap-3">
//                   <button
//                     onClick={() => setDesktopFilterOpen(!desktopFilterOpen)}
//                     className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 hover:border-gray-300 transition-all bg-white"
//                   >
//                     <SlidersHorizontal className="w-4 h-4" />
//                     <span className="text-sm font-medium">Filter</span>
//                   </button>

//                   <div className="hidden md:flex items-center gap-2 text-sm text-gray-500">
//                     <span>{total}</span>
//                     <span>Products</span>
//                   </div>
//                 </div>

//                 {/* RIGHT */}
//                 <div className="flex items-center gap-3">
//                   <div className="hidden md:block">
//                     <SortDropdown
//                       value={sortBy}
//                       onChange={(val) => handleSortChange(val as any)}
//                     />
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* LOADER */}
//             {isLoading && !productRes ? (
//               <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-x-5 gap-y-8">
//                 {[...Array(6)].map((_, i) => (
//                   <div key={i} className="animate-pulse">
//                     <div className="aspect-[3/4] bg-gray-200 rounded-3xl" />
//                     <div className="mt-4 h-4 bg-gray-200 rounded w-3/4" />
//                     <div className="mt-2 h-4 bg-gray-200 rounded w-1/3" />
//                   </div>
//                 ))}
//               </div>
//             ) : products.length === 0 ? (
//               <div className="flex flex-col items-center justify-center py-32">
//                 <h2 className="text-2xl font-light text-gray-900">
//                   No Products Found
//                 </h2>

//                 <button
//                   onClick={clearAllFilters}
//                   className="mt-5 px-6 py-3 rounded-full border border-gray-300 hover:bg-gray-100 transition"
//                 >
//                   Clear Filters
//                 </button>
//               </div>
//             ) : (
//               <div className="relative">
//                 {/* FETCHING OVERLAY */}
//                 {isFetching && (
//                   <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] z-20 flex items-center justify-center rounded-3xl">
//                     <div className="w-10 h-10 border-2 border-gray-300 border-t-black rounded-full animate-spin" />
//                   </div>
//                 )}

//                 {/* PREMIUM GRID */}
//                 <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 md:gap-x-5 gap-y-6 md:gap-y-8">
//                   {products?.map((product: Product, index: number) => {
//                     const availableStock = product.stock?.[0]?.quantity ?? 0;

//                     const isOutOfStock = isProductOutOfStock(product);

//                     const showAddToCart = canAddToCart(product);

//                     const displayPrice = Number(product.sellingPrice);

//                     const basePrice = Number(product.basePrice);

//                     const discount =
//                       basePrice > displayPrice
//                         ? Math.round(
//                             ((basePrice - displayPrice) / basePrice) * 100,
//                           )
//                         : 0;

//                     const variants = product.variants ?? [];

//                     const hasVariants =
//                       product.hasVariants && variants.length > 0;

//                     const selectedVariant =
//                       hasVariants && variants.length === 1 ? variants[0] : null;

//                     const cartItem = effectiveCartItems.find((i: any) => {
//                       if (!selectedVariant) {
//                         return i.productId === product.id && !i.variantId;
//                       }

//                       return (
//                         i.productId === product.id &&
//                         i.variantId === selectedVariant.id
//                       );
//                     });

//                     const handleIncrease = () => {
//                       if (!cartItem) {
//                         addToCartMutation.mutate({
//                           product,
//                           variant: selectedVariant,
//                         });
//                         return;
//                       }

//                       const newQty = cartItem.quantity + 1;

//                       if (user) {
//                         updateQtyMutation.mutate({
//                           itemId: cartItem.id,
//                           quantity: newQty,
//                         });
//                       } else {
//                         updateQuantityLocal(cartItem.id, newQty);
//                       }
//                     };

//                     const handleDecrease = () => {
//                       if (!cartItem) return;

//                       const newQty = cartItem.quantity - 1;

//                       if (newQty <= 0) {
//                         if (user) {
//                           removeItemMutation.mutate(cartItem.id);
//                         } else {
//                           removeItemLocal(cartItem.id);
//                         }

//                         return;
//                       }

//                       if (user) {
//                         updateQtyMutation.mutate({
//                           itemId: cartItem.id,
//                           quantity: newQty,
//                         });
//                       } else {
//                         updateQuantityLocal(cartItem.id, newQty);
//                       }
//                     };

//                     return (
//                       <motion.div
//                         key={product.id}
//                         initial={{
//                           opacity: 0,
//                           y: 20,
//                         }}
//                         animate={{
//                           opacity: 1,
//                           y: 0,
//                         }}
//                         transition={{
//                           duration: 0.4,
//                           delay: index * 0.03,
//                         }}
//                         className="group"
//                       >
//                         {/* IMAGE */}
//                         <Link
//                           href={`/${product.category?.slug}/${product.slug}`}
//                         >
//                           <div className="relative overflow-hidden bg-[#f6f3ee]">
//                             <div className="aspect-[0.82] relative overflow-hidden">
//                               <Image
//                                 src={
//                                   product.media?.[0]?.url || "/placeholder.jpg"
//                                 }
//                                 alt={product.name}
//                                 fill
//                                 priority={index < 3}
//                                 className="object-cover object-top transition-transform duration-700 group-hover:scale-[1.03]"
//                               />

//                               {/* GRADIENT */}
//                               <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />

//                               {/* DISCOUNT */}
//                               {!isOutOfStock && discount > 0 && (
//                                 <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-md text-white px-3 py-1 rounded-full text-[11px] tracking-wide">
//                                   {discount}% OFF
//                                 </div>
//                               )}

//                               {/* WISHLIST */}
//                               <button
//                                 onClick={(e) => {
//                                   e.preventDefault();
//                                   e.stopPropagation();

//                                   toggleWishlist(product.id);
//                                 }}
//                                 className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center shadow-sm"
//                               >
//                                 <Heart
//                                   className={`w-4 h-4 ${
//                                     isProductWishlisted(product.id)
//                                       ? "fill-black text-black"
//                                       : "text-black"
//                                   }`}
//                                 />
//                               </button>
//                             </div>
//                           </div>
//                         </Link>

//                         {/* CONTENT */}
//                         <div className="pt-3 px-1">
//                           <div className="flex items-start justify-between gap-3">
//                             <div className="flex-1 min-w-0">
//                               <h3 className="text-[15px] md:text-base font-medium text-gray-900 leading-snug line-clamp-2">
//                                 {product.name}
//                               </h3>

//                               <div className="mt-2 flex items-center gap-2">
//                                 <span className="text-[17px] font-semibold tracking-tight text-black">
//                                   ₹{displayPrice.toLocaleString()}
//                                 </span>

//                                 {basePrice > displayPrice && (
//                                   <span className="text-sm text-gray-400 line-through">
//                                     ₹{basePrice.toLocaleString()}
//                                   </span>
//                                 )}
//                               </div>
//                             </div>
//                           </div>

//                           {/* BUTTONS */}
//                           <div className="mt-3">
//                             {showAddToCart ? (
//                               hasVariants && variants.length > 1 ? (
//                                 <button
//                                   onClick={() =>
//                                     router.push(
//                                       `/${product.category?.slug}/${product.slug}`,
//                                     )
//                                   }
//                                   className="w-full h-11 rounded-2xl border border-gray-200 bg-white hover:bg-gray-50 transition-all text-sm font-medium"
//                                 >
//                                   View Options
//                                 </button>
//                               ) : cartItem && cartItem.quantity > 0 ? (
//                                 <div className="h-11 rounded-2xl border border-gray-200 bg-white flex items-center justify-between overflow-hidden">
//                                   <button
//                                     onClick={handleDecrease}
//                                     className="w-12 h-full text-lg hover:bg-gray-50 transition"
//                                   >
//                                     −
//                                   </button>

//                                   <span className="font-medium text-sm">
//                                     {cartItem.quantity}
//                                   </span>

//                                   <button
//                                     onClick={handleIncrease}
//                                     className="w-12 h-full text-lg hover:bg-gray-50 transition"
//                                   >
//                                     +
//                                   </button>
//                                 </div>
//                               ) : (
//                                 <button
//                                   onClick={() =>
//                                     addToCartMutation.mutate({
//                                       product,
//                                       variant: selectedVariant,
//                                     })
//                                   }
//                                   className="w-full h-11 rounded-2xl bg-black text-white text-sm font-medium hover:opacity-90 transition-all"
//                                 >
//                                   Add to Cart
//                                 </button>
//                               )
//                             ) : (
//                               <div className="w-full h-11 rounded-2xl bg-gray-100 text-gray-500 text-sm flex items-center justify-center">
//                                 {isOutOfStock ? "Out of Stock" : "Unavailable"}
//                               </div>
//                             )}
//                           </div>
//                         </div>
//                       </motion.div>
//                     );
//                   })}
//                 </div>
//               </div>
//             )}

//             {/* PAGINATION */}
//             {!isLoading && totalPages > 1 && (
//               <div className="mt-16 flex justify-center items-center gap-2">
//                 <button
//                   onClick={() => handlePageChange(currentPage - 1)}
//                   disabled={currentPage === 1}
//                   className="h-11 px-5 rounded-xl border border-gray-200 disabled:opacity-40"
//                 >
//                   Prev
//                 </button>

//                 {[...Array(Math.min(totalPages, 5))].map((_, i) => {
//                   let pageNum;

//                   if (totalPages <= 5) {
//                     pageNum = i + 1;
//                   } else if (currentPage <= 3) {
//                     pageNum = i + 1;
//                   } else if (currentPage >= totalPages - 2) {
//                     pageNum = totalPages - 4 + i;
//                   } else {
//                     pageNum = currentPage - 2 + i;
//                   }

//                   return (
//                     <button
//                       key={i}
//                       onClick={() => handlePageChange(pageNum)}
//                       className={`w-11 h-11 rounded-xl text-sm transition ${
//                         currentPage === pageNum
//                           ? "bg-black text-white"
//                           : "border border-gray-200 hover:bg-gray-50"
//                       }`}
//                     >
//                       {pageNum}
//                     </button>
//                   );
//                 })}

//                 <button
//                   onClick={() => handlePageChange(currentPage + 1)}
//                   disabled={currentPage === totalPages}
//                   className="h-11 px-5 rounded-xl border border-gray-200 disabled:opacity-40"
//                 >
//                   Next
//                 </button>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Mobile Filter Button */}
//       <motion.button
//         initial={{ scale: 0, opacity: 0 }}
//         animate={{ scale: 1, opacity: 1 }}
//         transition={{ delay: 0.3, type: "spring", stiffness: 380, damping: 30 }}
//         whileHover={{ scale: 1.05 }}
//         whileTap={{ scale: 0.95 }}
//         onClick={() => setMobileFilterOpen(true)}
//         className="md:hidden fixed bottom-5 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 z-40"
//       >
//         <SlidersHorizontal className="w-5 h-5" />
//         Filter & Sort
//       </motion.button>

//       {/* Mobile Filter Modal */}
//       <AnimatePresence>
//         {mobileFilterOpen && (
//           <>
//             <motion.div
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               exit={{ opacity: 0 }}
//               transition={{ duration: 0.2 }}
//               onClick={() => setMobileFilterOpen(false)}
//               className="fixed inset-0 bg-black/50 z-50 md:hidden"
//             />
//             <motion.div
//               initial={{ y: "100%" }}
//               animate={{ y: 0 }}
//               exit={{ y: "100%" }}
//               transition={{ type: "spring", stiffness: 380, damping: 30 }}
//               className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 md:hidden max-h-[90vh] overflow-y-auto"
//             >
//               <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
//                 <h2 className="font-semibold text-lg">Filter & Sort</h2>
//                 <motion.button
//                   whileTap={{ scale: 0.9 }}
//                   onClick={() => setMobileFilterOpen(false)}
//                 >
//                   <X className="w-6 h-6" />
//                 </motion.button>
//               </div>
//               <FilterSidebar isMobile />
//               <div className="p-4 border-t sticky bottom-0 bg-white">
//                 <motion.button
//                   whileTap={{ scale: 0.98 }}
//                   onClick={() => setMobileFilterOpen(false)}
//                   className="w-full bg-yellow-400 text-gray-900 py-3 rounded-full font-semibold"
//                 >
//                   Show {total} Results
//                 </motion.button>
//               </div>
//             </motion.div>
//           </>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// }
"use client";
import { useState, useCallback, useMemo, memo, useRef } from "react";
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
import { cartApi } from "@/lib/api/cart.api";
import { useAuthModal } from "@/store/useAuthModalStore";
import { toast } from "sonner";
import { Category } from "@/lib/api/category.api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCartStore } from "@/store/useCartStore";
import { formatMaskedPrice } from "@/lib/utils/priceMasked";
import { getColorHex, isValidCSSColor } from "@/lib/utils/colorValidation";
import { useWishlist } from "@/hooks/useWishlist";
import SortDropdown from "./customDropdown";
import { useCartDrawer } from "@/store/useCartDrawer";

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
  const { open } = useCartDrawer();

  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [desktopFilterOpen, setDesktopFilterOpen] = useState(false);

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

  const [selectedFabric, setSelectedFabric] = useState<string[]>(
    searchParams.get("fabric") ? searchParams.get("fabric")!.split(",") : [],
  );

  const [selectedSize, setSelectedSize] = useState(
    searchParams.get("size") || "",
  );

  const [inStockOnly, setInStockOnly] = useState(
    searchParams.get("inStock") === "true",
  );
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const limit = 12;
  const options = [
    { label: "Featured", value: "createdAt-desc" },
    { label: "Price: Low to High", value: "price-asc" },
    { label: "Price: High to Low", value: "price-desc" },
    { label: "Most Popular", value: "popularity-desc" },
  ];
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
      router.replace(`?${params.toString()}`, { scroll: false });
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

    if (selectedSubCategory) {
      const sub = category.children?.find((c) => c.id === selectedSubCategory);
      if (sub) params.categorySlug = sub.slug;
    } else {
      params.categorySlug = category.slug;
    }

    const search = searchParams.get("search");
    if (search) params.search = search;

    const minPrice = Number(searchParams.get("minPrice"));
    const maxPrice = Number(searchParams.get("maxPrice"));
    if (minPrice && minPrice > 0) params.minPrice = minPrice;
    if (maxPrice && maxPrice > 0 && maxPrice < 100000)
      params.maxPrice = maxPrice;

    params.sortBy = (searchParams.get("sortBy") || "createdAt") as any;
    params.sortOrder = (searchParams.get("sortOrder") || "desc") as any;

    const color = searchParams.get("color");
    if (color) params.color = color;

    const fabricParam = searchParams.get("fabric");
    if (fabricParam) {
      params.fabric = fabricParam
        .split(",")
        .map((f) => f.trim())
        .filter(Boolean);
    }

    const size = searchParams.get("size");
    if (size) params.size = size;

    if (searchParams.get("inStock") === "true") params.inStock = true;

    return params;
  }, [searchParams, category, selectedSubCategory]);

  /* ------------------ PRODUCTS QUERY ------------------ */

  const {
    data: productRes,
    isLoading,
    isFetching,
    isError,
    error,
  } = useQuery({
    queryKey: ["products", category.slug, JSON.stringify(queryParams)],
    queryFn: async () => {
      const result = await productApi.getProducts(queryParams);
      return result;
    },
    staleTime: 30000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 1,
  });

  const products = productRes?.data?.products ?? [];
  const total = productRes?.data?.pagination?.total ?? 0;
  const totalPages = productRes?.data?.pagination?.totalPages ?? 1;
  const currentPage = productRes?.data?.pagination?.page ?? 1;

  /* ------------------ WISHLIST ------------------ */

  const { isProductWishlisted, toggleWishlist } = useWishlist();

  /* ------------------ MUTATIONS ------------------ */

  const addToCartMutation = useMutation({
    mutationFn: async ({
      product,
      variant,
    }: {
      product: Product;
      variant?: any;
    }) => {
      const availableStock = product.stock?.[0]?.quantity ?? 0;
      const cartItem = {
        id: crypto.randomUUID(),
        cartId: "local",
        productId: product.id,
        variantId: variant?.id ?? null,
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
          stock: [{ quantity: availableStock }],
        },
        variant: variant
          ? {
              id: variant.id,
              sellingPrice: Number(variant.sellingPrice),
              basePrice: Number(variant.basePrice),
              attributes: variant.attributes,
              size: variant.size,
              color: variant.color,
              fabric: variant.fabric,
            }
          : null,
      };
      addToLocalCart(cartItem);
      if (user) {
        await cartApi.addToCart({
          productId: product.id,
          variantId: variant?.id,
          quantity: 1,
        });
      }
    },
    onSuccess: () => {
      if (user) queryClient.invalidateQueries({ queryKey: ["cartApi"] });
      open();
    },
    onError: () => toast.error("Failed to add to cart"),
  });

  const updateQtyMutation = useMutation({
    mutationFn: async ({
      itemId,
      quantity,
    }: {
      itemId: string;
      quantity: number;
    }) => await cartApi.updateCartItem(itemId, { quantity }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cartApi"] });
      open();
    },
    onError: () => toast.error("Failed to update quantity"),
  });

  const { data: cartData } = useQuery({
    queryKey: ["cartApi", user?.id],
    queryFn: async () => (await cartApi.getCart()).data,
    enabled: !!user,
  });

  const removeItemMutation = useMutation({
    mutationFn: async (itemId: string) => await cartApi.removeFromCart(itemId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cartApi"] }),
    onError: () => toast.error("Failed to remove item"),
  });

  const cartItems = useCartStore((state) => state.items);
  const effectiveCartItems = user ? (cartData?.items ?? []) : cartItems;
  const updateQuantityLocal = useCartStore((state) => state.updateQuantity);
  const removeItemLocal = useCartStore((state) => state.removeItem);

  const isProductUnavailable = (product: Product) => {
    const qty = product.stock?.[0]?.quantity ?? 0;
    const threshold = product.stock?.[0]?.lowStockThreshold ?? 0;
    const allowOut = product.allowOutOfStockOrders ?? false;
    if (qty === 0) return true;
    if (allowOut) return false;
    if (qty <= threshold) return true;
    return false;
  };

  const canAddToCart = (product: Product) => !isProductUnavailable(product);
  const isProductOutOfStock = (product: Product) =>
    (product.stock?.[0]?.quantity ?? 0) === 0;

  const handleAddToCart = (product: Product) => {
    if (!canAddToCart(product)) {
      toast.error("This product is currently unavailable");
      return;
    }
    const variants = product.variants ?? [];
    const hasVariants = product.hasVariants && variants.length > 0;
    if (hasVariants && variants.length === 1) {
      addToCartMutation.mutate({ product, variant: variants[0] });
      return;
    }
    if (hasVariants && variants.length > 1) {
      router.push(`/${product.category?.slug}/${product.slug}`);
      toast.info("Please select product options");
      return;
    }
    addToCartMutation.mutate({ product, variant: null });
  };

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
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      updateFilters({ minPrice: newRange[0], maxPrice: newRange[1], page: 1 });
    }, 400);
  };

  const handleSortChange = (newSort: typeof sortBy) => {
    setSortBy(newSort);
    const [field, order] = newSort.split("-");
    updateFilters({ sortBy: field, sortOrder: order, page: 1 });
  };

  const handleColorChange = (color: string) => {
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

  const handleFabricChange = (material: string) => {
    const updated = selectedFabric.includes(material)
      ? selectedFabric.filter((item) => item !== material)
      : [...selectedFabric, material];
    setSelectedFabric(updated);
    updateFilters({
      fabric: updated.length > 0 ? updated.join(",") : null,
      page: 1,
    });
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
    setSelectedFabric([]);
    setSelectedSize("");
    setInStockOnly(false);
    setSelectedSubCategory(null);
    setSearchQuery("");
    router.push(`/shop/${category.slug}`);
  };

  /* ------------------ FILTER SIDEBAR (logic unchanged) ------------------ */

  const FilterSidebar = memo(({ isMobile = false }: { isMobile?: boolean }) => (
    <motion.div
      initial={false}
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
          <h3 className="font-semibold text-gray-900 mb-4">Subcategories</h3>
          <ul className="space-y-2">
            <motion.li
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSubCategoryChange(null)}
              className={`cursor-pointer py-2 px-3 rounded-lg transition-colors ${
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
                className={`cursor-pointer py-2 px-3 rounded-lg transition-colors ${
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
            className="w-4 h-4 accent-main-primary rounded"
          />
          <span className="text-sm font-medium text-gray-700">
            In Stock Only
          </span>
        </label>
      </div>

      <div className="mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">Price Range</h3>
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
            className="w-full accent-main-primary"
          />
          <div className="flex justify-between text-sm text-gray-600">
            <span>₹{priceRange[0].toLocaleString("en-IN")}</span>
            <span>₹{priceRange[1].toLocaleString("en-IN")}</span>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">Fabric</h3>
        <ul className="space-y-2">
          {materials.map((material) => (
            <motion.li
              key={material}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2"
            >
              <input
                type="checkbox"
                checked={selectedFabric.includes(material)}
                onChange={() => handleFabricChange(material)}
                className="w-4 h-4 accent-main-primary"
              />
              <label className="text-gray-700 cursor-pointer">{material}</label>
            </motion.li>
          ))}
        </ul>
      </div>
    </motion.div>
  ));

  /* ------------------ ERROR STATE ------------------ */

  if (isError) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
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
            className="px-6 py-3 bg-black text-white text-sm tracking-widest uppercase hover:bg-gray-800 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  /* ------------------ RENDER ------------------ */

  return (
    <div className="min-h-screen bg-white">
      {/* ═══════════════════════════════════════════
          MOBILE HEADER
      ═══════════════════════════════════════════ */}
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
              <Link href="/wishlist">
                <Heart className="w-6 h-6" />
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Mobile sort chips */}
        <div className="flex gap-2 px-4 pb-3 overflow-x-auto scrollbar-none">
          {(
            [
              "createdAt-desc",
              "price-asc",
              "price-desc",
              "popularity-desc",
            ] as const
          ).map((val) => {
            const labels: Record<string, string> = {
              "createdAt-desc": "Featured",
              "price-asc": "Price ↑",
              "price-desc": "Price ↓",
              "popularity-desc": "Popular",
            };
            return (
              <motion.button
                key={val}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSortChange(val)}
                className={`px-4 py-1.5 rounded-full text-xs tracking-widest uppercase whitespace-nowrap transition-colors ${
                  sortBy === val
                    ? "bg-black text-white"
                    : "border border-gray-300 text-gray-600 hover:border-black"
                }`}
              >
                {labels[val]}
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* ═══════════════════════════════════════════
          DESKTOP LAYOUT
      ═══════════════════════════════════════════ */}
      <div className="max-w-[1600px] mx-auto">
        {/* ── SLIM TOP BAR: category title + filter toggle + sort ── */}
        {/*
          KEY UX FIX:
          - Removed the separate "Silk · Silk Coooptoon" sub-nav row
          - Merged everything into ONE slim bar (≈44px)
          - Not sticky on desktop so it doesn't eat vertical space
          - Products start immediately below
        */}
        <div className="hidden md:flex items-center justify-between px-8 xl:px-10 py-3 border-b border-gray-100">
          {/* LEFT: back crumb + title + count */}
          <div className="flex items-center gap-4">
            <Link
              href="/shop"
              className="text-xs tracking-widest uppercase text-gray-400 hover:text-black transition-colors"
            >
              Shop
            </Link>
            <span className="text-gray-200">›</span>
            <h1 className="text-sm tracking-widest uppercase font-medium text-black">
              {category.name}
            </h1>
            <span className="text-xs text-gray-400 tracking-wide">
              {total > 0 ? `${total} pieces` : ""}
            </span>
          </div>

          {/* RIGHT: subcategory chips + filter toggle + sort */}
          <div className="flex items-center gap-3">
            {/* Subcategory chips — inline in top bar, no separate row */}
            {category.children && category.children.length > 0 && (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleSubCategoryChange(null)}
                  className={`px-3 py-1 text-xs tracking-widest uppercase transition-colors border rounded-full ${
                    selectedSubCategory === null
                      ? "bg-black text-white border-black"
                      : "border-gray-300 text-gray-600 hover:border-black hover:text-black"
                  }`}
                >
                  All
                </button>
                {category.children.map((subCat) => (
                  <button
                    key={subCat.id}
                    onClick={() => handleSubCategoryChange(subCat.id)}
                    className={`px-3 py-1 text-xs tracking-widest uppercase transition-colors border rounded-full ${
                      selectedSubCategory === subCat.id
                        ? "bg-black text-white border-black"
                        : "border-gray-300 text-gray-600 hover:border-black hover:text-black"
                    }`}
                  >
                    {subCat.name}
                  </button>
                ))}
              </div>
            )}

            {/* Divider */}
            {category.children && category.children.length > 0 && (
              <span className="h-4 w-px bg-gray-200" />
            )}

            {/* Filter toggle */}
            <button
              onClick={() => setDesktopFilterOpen(!desktopFilterOpen)}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs tracking-widest uppercase border transition-colors rounded-full ${
                desktopFilterOpen
                  ? "bg-black text-white border-black"
                  : "border-gray-300 text-gray-600 hover:border-black hover:text-black"
              }`}
            >
              <SlidersHorizontal className="w-3 h-3" />
              Filter
            </button>

            {/* Sort dropdown */}
            <SortDropdown
              value={sortBy}
              onChange={(val) => handleSortChange(val as any)}
            />
          </div>
        </div>

        {/* ── MAIN CONTENT AREA ── */}
        <div className="flex">
          {/* DESKTOP FILTER SIDEBAR */}
          <AnimatePresence>
            {desktopFilterOpen && (
              <motion.aside
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 260 }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="hidden xl:block flex-shrink-0 border-r border-gray-100 overflow-hidden"
              >
                <div className="w-[260px] p-6 pt-8">
                  <FilterSidebar />
                </div>
              </motion.aside>
            )}
          </AnimatePresence>

          {/* PRODUCT GRID */}
          <div className="flex-1 min-w-0 px-4 md:px-8 xl:px-10 pt-6 pb-16">
            {/* Loading skeleton */}
            {isLoading && !productRes ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-px bg-gray-100">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white animate-pulse">
                    <div className="aspect-[3/4] bg-gray-100" />
                    <div className="p-4 space-y-2">
                      <div className="h-3 bg-gray-100 rounded w-3/4" />
                      <div className="h-3 bg-gray-100 rounded w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-40">
                <p className="text-xs tracking-widest uppercase text-gray-400 mb-6">
                  No products found
                </p>
                <button
                  onClick={clearAllFilters}
                  className="text-xs tracking-widest uppercase border border-black px-6 py-2 hover:bg-black hover:text-white transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="relative">
                {/* Fetching overlay */}
                {isFetching && (
                  <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-20 flex items-center justify-center">
                    <div className="w-8 h-8 border border-gray-300 border-t-black rounded-full animate-spin" />
                  </div>
                )}

                {/*
                  ═══════════════════════════════════════
                  EDITORIAL GRID
                  Matches shop page aesthetic:
                  - No rounded corners on images (editorial feel)
                  - Generous image height using aspect-[3/4]
                  - Minimal card chrome below image
                  - Thin hover underline on name, not bold
                  - Add to Cart button: full-width, black, flat
                  ═══════════════════════════════════════
                */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 md:gap-x-6 gap-y-10 md:gap-y-12">
                  {products?.map((product: Product, index: number) => {
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
                    const variants = product.variants ?? [];
                    const hasVariants =
                      product.hasVariants && variants.length > 0;
                    const selectedVariant =
                      hasVariants && variants.length === 1 ? variants[0] : null;

                    const cartItem = effectiveCartItems.find((i: any) => {
                      if (!selectedVariant)
                        return i.productId === product.id && !i.variantId;
                      return (
                        i.productId === product.id &&
                        i.variantId === selectedVariant.id
                      );
                    });

                    const handleIncrease = () => {
                      if (!cartItem) {
                        addToCartMutation.mutate({
                          product,
                          variant: selectedVariant,
                        });
                        return;
                      }
                      const newQty = cartItem.quantity + 1;
                      if (user)
                        updateQtyMutation.mutate({
                          itemId: cartItem.id,
                          quantity: newQty,
                        });
                      else updateQuantityLocal(cartItem.id, newQty);
                    };

                    const handleDecrease = () => {
                      if (!cartItem) return;
                      const newQty = cartItem.quantity - 1;
                      if (newQty <= 0) {
                        if (user) removeItemMutation.mutate(cartItem.id);
                        else removeItemLocal(cartItem.id);
                        return;
                      }
                      if (user)
                        updateQtyMutation.mutate({
                          itemId: cartItem.id,
                          quantity: newQty,
                        });
                      else updateQuantityLocal(cartItem.id, newQty);
                    };

                    return (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35, delay: index * 0.04 }}
                        className="group"
                      >
                        {/* ── IMAGE BLOCK ── */}
                        <Link
                          href={`/${product.category?.slug}/${product.slug}`}
                        >
                          <div className="relative overflow-hidden bg-[#f5f2ee]">
                            {/*
                              Use calc-based height: fill remaining viewport after
                              site header (~110px) + top bar (~44px) + card info (~90px).
                              = calc(100vh - 244px) for the image.
                              Capped at 520px so it never overflows on tall monitors.
                              On mobile (2-col) the shorter width naturally constrains height.
                            */}
                            <div
                              className="relative overflow-hidden w-full"
                              style={{
                                height: "min(calc(100vh - 260px), 520px)",
                              }}
                            >
                              <Image
                                src={
                                  product.media?.[0]?.url || "/placeholder.jpg"
                                }
                                alt={product.name}
                                fill
                                priority={index < 3}
                                className="object-cover object-top transition-transform duration-700 group-hover:scale-[1.04]"
                              />

                              {/* Subtle bottom gradient */}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                              {/* Discount badge — top left, matches shop page style */}
                              {!isOutOfStock && discount > 0 && (
                                <div className="absolute top-3 left-3 bg-main-primary text-main-secondary px-2.5 py-0.5 text-[10px] tracking-widest uppercase">
                                  {discount}% Off
                                </div>
                              )}

                              {/* Wishlist button */}
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  toggleWishlist(product.id);
                                }}
                                className="
absolute top-3 right-3 z-10
flex items-center justify-center
w-9 h-9 rounded-full
bg-white/90 backdrop-blur-sm shadow-sm
opacity-100 md:opacity-0 md:group-hover:opacity-100
transition-all duration-300
hover:bg-white
"
                              >
                                <Heart
                                  className={`w-4 h-4 ${
                                    isProductWishlisted(product.id)
                                      ? "fill-black text-black"
                                      : "text-black"
                                  }`}
                                />
                              </button>
                            </div>
                          </div>
                        </Link>

                        {/* ── CARD INFO — minimal, editorial ── */}
                        <div className="pt-3">
                          {/* Name — hover underline like shop page arrow */}
                          <Link
                            href={`/${product.category?.slug}/${product.slug}`}
                          >
                            <h3 className="min-h-[38px] md:min-h-[44px] text-[13px] md:text-sm text-gray-900 leading-[1.35] line-clamp-2 tracking-tight hover:underline underline-offset-2 decoration-gray-300">
                              {product.name}
                            </h3>
                          </Link>

                          {/* Price row */}
                          <div className="mt-1.5 flex items-baseline gap-2">
                            <span className="text-sm font-medium text-black tracking-tight">
                              ₹{displayPrice.toLocaleString("en-IN")}
                            </span>
                            {basePrice > displayPrice && (
                              <span className="text-xs text-gray-400 line-through">
                                ₹{basePrice.toLocaleString("en-IN")}
                              </span>
                            )}
                          </div>

                          {/* Action button */}
                          <div className="mt-3">
                            {showAddToCart ? (
                              hasVariants && variants.length > 1 ? (
                                <button
                                  onClick={() =>
                                    router.push(
                                      `/${product.category?.slug}/${product.slug}`,
                                    )
                                  }
                                  className="w-full py-2.5 border border-black text-xs tracking-widest uppercase hover:bg-black hover:text-white transition-colors"
                                >
                                  View Options
                                </button>
                              ) : cartItem && cartItem.quantity > 0 ? (
                                <div className="flex items-center border border-gray-200">
                                  <button
                                    onClick={handleDecrease}
                                    className="flex-1 py-2.5 text-sm hover:bg-gray-50 transition-colors"
                                  >
                                    −
                                  </button>
                                  <span className="flex-1 text-center text-sm font-medium">
                                    {cartItem.quantity}
                                  </span>
                                  <button
                                    onClick={handleIncrease}
                                    className="flex-1 py-2.5 text-sm hover:bg-gray-50 transition-colors"
                                  >
                                    +
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() =>
                                    addToCartMutation.mutate({
                                      product,
                                      variant: selectedVariant,
                                    })
                                  }
                                  className="w-full py-2.5 bg-black text-white text-xs tracking-widest uppercase hover:bg-gray-900 transition-colors"
                                >
                                  Add to Cart
                                </button>
                              )
                            ) : (
                              <div className="w-full py-2.5 bg-gray-50 text-gray-400 text-xs tracking-widest uppercase text-center">
                                {isOutOfStock ? "Out of Stock" : "Unavailable"}
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── PAGINATION ── */}
            {!isLoading && totalPages > 1 && (
              <div className="mt-20 flex justify-center items-center gap-1">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-5 py-2.5 text-xs tracking-widest uppercase border border-gray-200 hover:border-black disabled:opacity-30 transition-colors"
                >
                  Prev
                </button>
                {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                  let pageNum: number;
                  if (totalPages <= 5) pageNum = i + 1;
                  else if (currentPage <= 3) pageNum = i + 1;
                  else if (currentPage >= totalPages - 2)
                    pageNum = totalPages - 4 + i;
                  else pageNum = currentPage - 2 + i;
                  return (
                    <button
                      key={i}
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-10 h-10 text-xs tracking-widest transition-colors ${
                        currentPage === pageNum
                          ? "bg-black text-white"
                          : "border border-gray-200 hover:border-black"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-5 py-2.5 text-xs tracking-widest uppercase border border-gray-200 hover:border-black disabled:opacity-30 transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════
          MOBILE FILTER BUTTON (floating)
      ═══════════════════════════════════════════ */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3, type: "spring", stiffness: 380, damping: 30 }}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => setMobileFilterOpen(true)}
        className="md:hidden fixed bottom-5 left-1/2 -translate-x-1/2 bg-black text-white px-7 py-3 shadow-lg flex items-center gap-2 z-40 text-xs tracking-widest uppercase"
      >
        <SlidersHorizontal className="w-4 h-4" />
        Filter & Sort
      </motion.button>

      {/* ═══════════════════════════════════════════
          MOBILE FILTER MODAL
      ═══════════════════════════════════════════ */}
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
              className="fixed bottom-0 left-0 right-0 bg-white z-50 md:hidden max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b sticky top-0 bg-white">
                <span className="text-xs tracking-widest uppercase font-medium">
                  Filter & Sort
                </span>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setMobileFilterOpen(false)}
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>
              <FilterSidebar isMobile />
              <div className="p-5 border-t sticky bottom-0 bg-white">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setMobileFilterOpen(false)}
                  className="w-full bg-black text-white py-3.5 text-xs tracking-widest uppercase"
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
