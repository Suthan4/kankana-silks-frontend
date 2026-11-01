"use client";
import { useState, useCallback, useMemo, memo, useRef, useEffect } from "react";
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
import { mergeCartLines } from "@/lib/utils/cartItems";
import { getColorHex, isValidCSSColor } from "@/lib/utils/colorValidation";
import { useWishlist } from "@/hooks/useWishlist";
import SortDropdown from "./customDropdown";
import { useCartDrawer } from "@/store/useCartDrawer";
import ProductRequestModal from "./productRequestModal";
import PriceRangeSlider from "./ui/PriceRangeSlider";
import { wishlistApi } from "@/lib/api/wishlist.api";

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
  // ✅ Prevents hydration mismatch: badge counts come from localStorage/API
  // which the server doesn't have. Only render counts after first client paint.
  const [isMounted, setIsMounted] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [desktopFilterOpen, setDesktopFilterOpen] = useState(false);
  const [gridCols, setGridCols] = useState<2 | 3 | 4>(3);
  const [mobileGrid, setMobileGrid] = useState<1 | 2>(2);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [requestProduct, setRequestProduct] = useState<Product | null>(null);
  const [requestVariant, setRequestVariant] = useState<any>(null);

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
    const sortByParam = searchParams.get("sortBy") || "price";
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
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);
  useEffect(() => {
    const el = scrollRef.current;

    if (!el) return;

    const updateArrows = () => {
      setShowLeftArrow(el.scrollLeft > 5);

      setShowRightArrow(el.scrollLeft + el.clientWidth < el.scrollWidth - 5);
    };

    updateArrows();

    el.addEventListener("scroll", updateArrows);
    window.addEventListener("resize", updateArrows);

    return () => {
      el.removeEventListener("scroll", updateArrows);
      window.removeEventListener("resize", updateArrows);
    };
  }, [category.children]);

  const scrollCategories = (direction: "left" | "right") => {
    const el = scrollRef.current;

    if (!el) return;

    const scrollAmount = 220;

    el.scrollBy({
      left: direction === "right" ? scrollAmount : -scrollAmount,
      behavior: "smooth",
    });
  };

  const handleRequestProduct = (product: Product, variant: any = null) => {
    if (!user) {
      openModal("login");
      toast.info("Please login to request this product");
      return;
    }

    setRequestProduct(product);
    setRequestVariant(variant);
    setIsRequestModalOpen(true);
  };
  /* -------------------- WISHLIST API QUERY -------------------- */
  const { data: wishlistData } = useQuery({
    queryKey: ["wishlist", user?.id],
    queryFn: async () => {
      const res = await wishlistApi.getWishlist();
      return res.data;
    },
    enabled: !!user,
  });
  const wishlistCount = isMounted
    ? user
      ? (wishlistData?.totalItems ?? 0)
      : 0
    : 0;
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
  console.log("category", category);
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

    params.sortBy = (searchParams.get("sortBy") || "price") as any;
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
          isActive: product.isActive,
          hasVariants: product.hasVariants ?? false,
          allowOutOfStockOrders: product.allowOutOfStockOrders ?? false,
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
              stock:
                variant.stock?.map((stock: any) => ({
                  ...stock,
                  lowStockThreshold: stock.lowStockThreshold ?? 0,
                })) ?? [],
            }
          : null,
      };
      if (!user) addToLocalCart(cartItem);
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
    staleTime: 15_000,
    refetchOnWindowFocus: false,
  });

  const removeItemMutation = useMutation({
    mutationFn: async (itemId: string) => await cartApi.removeFromCart(itemId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cartApi"] }),
    onError: () => toast.error("Failed to remove item"),
  });

  const cartItems = useCartStore((state) => state.items);
  const effectiveCartItems = useMemo(
    () => mergeCartLines(user ? (cartData?.items ?? []) : cartItems),
    [user, cartData?.items, cartItems],
  );
  const updateQuantityLocal = useCartStore((state) => state.updateQuantity);
  const removeItemLocal = useCartStore((state) => state.removeItem);

  const isProductUnavailable = (product: Product) => {
    const allowOut = product.allowOutOfStockOrders ?? false;

    // Variable-product cards must respect their variant inventory. If every
    // variant has inventory data and none can be purchased, keep the existing
    // Out of Stock card action instead of showing Add to Cart.
    const variants = product.hasVariants ? (product.variants ?? []) : [];
    const allVariantsHaveInventory =
      variants.length > 0 &&
      variants.every(
        (variant) => Array.isArray(variant.stock) && variant.stock.length > 0,
      );

    if (allVariantsHaveInventory) {
      // When variant inventory is known, it is the source of truth for the card.
      return variants.every((variant) => {
        const qty = Number(variant.stock?.[0]?.quantity ?? 0);
        const threshold = Number(variant.stock?.[0]?.lowStockThreshold ?? 0);
        if (qty <= 0) return true;
        if (allowOut) return false;
        return qty <= threshold;
      });
    }

    // Preserve the existing simple-product and fallback inventory rules.
    const qty = Number(product.stock?.[0]?.quantity ?? 0);
    const threshold = Number(product.stock?.[0]?.lowStockThreshold ?? 0);
    if (qty <= 0) return true;
    if (allowOut) return false;
    if (qty <= threshold) return true;
    return false;
  };

  const canAddToCart = (product: Product) => !isProductUnavailable(product);
  const isProductOutOfStock = (product: Product) => {
    // For variable products, mask the parent price only when every variant
    // has known inventory and all variants are out of stock.
    if (product.hasVariants && product.variants?.length) {
      const everyVariantHasStock = product.variants.every(
        (variant) => Array.isArray(variant.stock) && variant.stock.length > 0,
      );
      // Only mask the parent price when all variant inventory is known and
      // confirms every variant is out of stock. Unknown data should not hide prices.
      return (
        everyVariantHasStock &&
        product.variants.every((variant) => {
          const qty = Number(variant.stock?.[0]?.quantity ?? 0);
          return Number.isFinite(qty) && qty <= 0;
        })
      );
    }
    return Number(product.stock?.[0]?.quantity ?? 0) <= 0;
  };

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

      {/* <div className="mb-6">
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
      </div> */}

      <div className="mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">Price Range</h3>
        <div className="space-y-4">
          <PriceRangeSlider
            value={priceRange}
            min={0}
            max={100000}
            step={500}
            onChange={setPriceRange}
          />
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
            {/* Grid toggles */}
            <button
              onClick={() => setMobileGrid(1)}
              className={`p-1.5 border ${
                mobileGrid === 1
                  ? "bg-black text-white border-black"
                  : "border-gray-300"
              }`}
            >
              <div className="grid gap-[2px]">
                <div className="w-3 h-[2px] bg-current" />
                <div className="w-3 h-[2px] bg-current" />
                <div className="w-3 h-[2px] bg-current" />
              </div>
            </button>
            <button
              onClick={() => setMobileGrid(2)}
              className={`p-1.5 border ${
                mobileGrid === 2
                  ? "bg-black text-white border-black"
                  : "border-gray-300"
              }`}
            >
              <div className="grid grid-cols-2 gap-[2px]">
                <div className="w-1.5 h-1.5 bg-current" />
                <div className="w-1.5 h-1.5 bg-current" />
                <div className="w-1.5 h-1.5 bg-current" />
                <div className="w-1.5 h-1.5 bg-current" />
              </div>
            </button>
            {/* Wishlist */}
            <motion.div whileTap={{ scale: 0.9 }} className="relative">
              <Link href="/wishlist" className="relative inline-flex">
                <Heart className="w-6 h-6" />

                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-2 text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-medium bg-black text-white">
                    {wishlistCount}
                  </span>
                )}
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
      <div className="max-w-[1450px]mx-auto">
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
              {total > 0 ? `${total} sarees` : ""}
            </span>
          </div>

          {/* RIGHT: subcategory chips + filter toggle + sort */}
          <div className="flex items-center gap-3">
            {/* Subcategory chips */}
            {category.children && category.children.length > 0 && (
              <div className="relative flex items-center max-w-[720px]">
                {/* Left Arrow */}
                {showLeftArrow && (
                  <button
                    onClick={() => scrollCategories("left")}
                    className="absolute left-0 z-10 h-8 w-8 flex items-center justify-center rounded-full bg-white border border-gray-200 shadow-xl hover:border-black transition"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                )}

                {/* Scroll Area */}
                <div
                  ref={scrollRef}
                  className="
        flex items-center gap-1.5
        overflow-x-auto scrollbar-none
        scroll-smooth
        px-10
      "
                >
                  <button
                    onClick={() => handleSubCategoryChange(null)}
                    className={`shrink-0 px-3 py-1 text-xs tracking-widest uppercase transition-colors border rounded-full whitespace-nowrap ${
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
                      className={`shrink-0 px-3 py-1 text-xs tracking-widest uppercase transition-colors border rounded-full whitespace-nowrap ${
                        selectedSubCategory === subCat.id
                          ? "bg-black text-white border-black"
                          : "border-gray-300 text-gray-600 hover:border-black hover:text-black"
                      }`}
                    >
                      {subCat.name}
                    </button>
                  ))}
                </div>

                {/* Right Arrow */}
                {showRightArrow && (
                  <button
                    onClick={() => scrollCategories("right")}
                    className="absolute right-0 z-10 h-8 w-8 flex items-center justify-center rounded-full shadow-xl bg-white border border-gray-200 shadow-sm hover:border-black transition"
                  >
                    <ChevronLeft className="w-4 h-4 rotate-180" />
                  </button>
                )}
              </div>
            )}

            {/* Divider */}
            {category.children && category.children.length > 0 && (
              <span className="h-4 w-px bg-gray-200" />
            )}

            <div className="hidden md:flex items-center gap-1 border-r border-gray-200 pr-4 mr-2">
              <button
                onClick={() => setGridCols(2)}
                className={`p-2 border transition-colors ${
                  gridCols === 2
                    ? "bg-black text-white border-black"
                    : "border-gray-300 text-gray-500 hover:border-black hover:text-black"
                }`}
              >
                <div className="grid grid-cols-2 gap-[2px]">
                  <div className="w-2 h-2 bg-current" />
                  <div className="w-2 h-2 bg-current" />
                  <div className="w-2 h-2 bg-current" />
                  <div className="w-2 h-2 bg-current" />
                </div>
              </button>

              <button
                onClick={() => setGridCols(3)}
                className={`p-2 border transition-colors ${
                  gridCols === 3
                    ? "bg-black text-white border-black"
                    : "border-gray-300 text-gray-500 hover:border-black hover:text-black"
                }`}
              >
                <div className="grid grid-cols-3 gap-[2px]">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <div key={i} className="w-1.5 h-1.5 bg-current" />
                  ))}
                </div>
              </button>

              <button
                onClick={() => setGridCols(4)}
                className={`p-2 border transition-colors ${
                  gridCols === 4
                    ? "bg-black text-white border-black"
                    : "border-gray-300 text-gray-500 hover:border-black hover:text-black"
                }`}
              >
                <div className="grid grid-cols-4 gap-[1px]">
                  {Array.from({ length: 16 }).map((_, i) => (
                    <div key={i} className="w-1 h-1 bg-current" />
                  ))}
                </div>
              </button>
            </div>

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
          <div className="flex-1 min-w-0 px-4 md:px-8 xl:px-10 pt-10 md:pt-20 pb-16">
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
                <div
                  className={`
    grid
    ${mobileGrid === 1 ? "grid-cols-1" : "grid-cols-2"}

${
  gridCols === 2
    ? "md:grid-cols-3 xl:grid-cols-3"
    : gridCols === 3
      ? "md:grid-cols-4 xl:grid-cols-4"
      : "md:grid-cols-5 xl:grid-cols-5"
}

    gap-x-3 md:gap-x-6
    gap-y-8 md:gap-y-12
  `}
                >
                  {" "}
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
                      const newQty = Number(cartItem.quantity) + 1;
                      if (user)
                        updateQtyMutation.mutate({
                          itemId: String(cartItem.id),
                          quantity: newQty,
                        });
                      else updateQuantityLocal(String(cartItem.id), newQty);
                    };

                    const handleDecrease = () => {
                      if (!cartItem) return;
                      const newQty = Number(cartItem.quantity) - 1;
                      if (newQty <= 0) {
                        if (user)
                          removeItemMutation.mutate(String(cartItem.id));
                        else removeItemLocal(String(cartItem.id));
                        return;
                      }
                      if (user)
                        updateQtyMutation.mutate({
                          itemId: String(cartItem.id),
                          quantity: newQty,
                        });
                      else updateQuantityLocal(String(cartItem.id), newQty);
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
                            <div className="relative w-full overflow-hidden bg-[#f5f2ee] aspect-[3/4]">
                              {" "}
                              <Image
                                src={
                                  product.media?.[0]?.url || "/placeholder.jpg"
                                }
                                alt={product.name}
                                fill
                                priority={index < 3}
                                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                                className="object-cover object-top transition-transform duration-700 group-hover:scale-[1.03]"
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
                              {isOutOfStock
                                ? formatMaskedPrice(displayPrice)
                                : `₹${displayPrice.toLocaleString("en-IN")}`}
                            </span>
                            {basePrice > displayPrice && (
                              <span className="text-xs text-gray-400 line-through">
                                {isOutOfStock
                                  ? formatMaskedPrice(basePrice)
                                  : `₹${basePrice.toLocaleString("en-IN")}`}
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
                              ) : cartItem && Number(cartItem.quantity) > 0 ? (
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
                                    disabled={
                                      Number(cartItem.quantity) >=
                                      Number(
                                        selectedVariant?.stock?.[0]?.quantity ??
                                          product.stock?.[0]?.quantity ??
                                          0,
                                      )
                                    }
                                    className="flex-1 py-2.5 text-sm hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                  >
                                    +
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() =>
                                    addToCartMutation.mutate({
                                      product,
                                      variant: selectedVariant,
                                    })
                                  }
                                  disabled={addToCartMutation.isPending}
                                  aria-busy={addToCartMutation.isPending}
                                  className="w-full py-2.5 bg-black text-white text-xs tracking-widest uppercase hover:bg-gray-900 transition-colors disabled:cursor-wait disabled:opacity-70"
                                >
                                  {addToCartMutation.isPending
                                    ? "Adding..."
                                    : "Add to Cart"}
                                </button>
                              )
                            ) : (
                              <motion.button
                                whileTap={{ scale: 0.97 }}
                                onClick={() =>
                                  handleRequestProduct(product, selectedVariant)
                                }
                                className="w-full py-2.5 flex items-center justify-center gap-2 bg-black text-white text-xs tracking-widest uppercase hover:bg-gray-900 transition-colors disabled:cursor-wait disabled:opacity-70"
                              >
                                <AlertCircle className="w-4 h-4" />
                                Request Product
                              </motion.button>
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

      {/* ====================================
           PRODUCT REQUEST MODAL
          ================================*/}
      {requestProduct && (
        <ProductRequestModal
          isOpen={isRequestModalOpen}
          onClose={() => {
            setIsRequestModalOpen(false);
            setRequestProduct(null);
            setRequestVariant(null);
          }}
          product={requestProduct}
          selectedVariant={requestVariant}
        />
      )}
    </div>
  );
}
