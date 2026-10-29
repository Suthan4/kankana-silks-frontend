"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  ShoppingCart,
  Truck,
  RotateCcw,
  Shield,
  MapPin,
  Check,
  X,
  Zap,
  Video,
  AlertCircle,
  Palette,
  Loader2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  productApi,
  ProductVariant,
  type Product,
} from "@/lib/api/product.api";
import { wishlistApi } from "@/lib/api/wishlist.api";
import { cartApi } from "@/lib/api/cart.api";
import { shipmentApi } from "@/lib/api/shipment.api";
import { useAuthModal } from "@/store/useAuthModalStore";
import { toast } from "sonner";
import { useCartStore } from "@/store/useCartStore";
import { useCartDrawer } from "@/store/useCartDrawer";
import { useRouter } from "next/navigation";
import ProductRequestModal from "@/components/productRequestModal";
import { formatMaskedPrice } from "@/lib/utils/priceMasked";
import VideoConsultationModal from "../video-consultationModal";
import WishlistButton from "../ui/WishlistButton";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { formatColorText } from "@/lib/utils/colorValidationwithText";
import DOMPurify from "isomorphic-dompurify";
import { ZoomGallery } from "../ui/ZoomGallery";

interface ProductDetailsClientProps {
  initialProduct: Product;
}

const getVariantAttrValue = (variant: any, attrKey: string) => {
  const attrs = variant?.attributes;
  if (!attrs) return null;
  if (typeof attrs === "object" && !Array.isArray(attrs))
    return attrs[attrKey] ?? null;
  if (Array.isArray(attrs)) {
    const found = attrs.find((a) => a?.key === attrKey);
    return found?.value ?? null;
  }
  return null;
};

const normalizeVariantAttributesToRecord = (
  attrs: any,
): Record<string, string> => {
  if (!attrs) return {};
  if (typeof attrs === "object" && !Array.isArray(attrs)) {
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(attrs)) {
      if (String(k).trim() && String(v).trim()) out[String(k)] = String(v);
    }
    return out;
  }
  if (Array.isArray(attrs)) {
    const out: Record<string, string> = {};
    for (const row of attrs) {
      const k = String(row?.key ?? "").trim();
      const v = String(row?.value ?? "").trim();
      if (k && v) out[k] = v;
    }
    return out;
  }
  return {};
};

export default function ProductDetailsClient({
  initialProduct,
}: ProductDetailsClientProps) {
  const { user, openModal } = useAuthModal();
  const { addItem: addToLocalCart } = useCartStore();
  const { open: openCartDrawer } = useCartDrawer();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [product] = useState<Product>(initialProduct);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    null,
  );
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [activeTab, setActiveTab] = useState<"details" | "specs">("details");
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  const [pincode, setPincode] = useState("");
  const [deliveryInfo, setDeliveryInfo] = useState<{
    isServiceable: boolean;
    estimatedDays: string;
    checked: boolean;
  } | null>(null);
  const [isCheckingDelivery, setIsCheckingDelivery] = useState(false);
  console.log("product", product);

  const hasVariants =
    product.hasVariants &&
    Array.isArray(product.variants) &&
    product.variants.length > 0;

  const findVariantForAttr = (
    attrKey: string,
    attrValue: string,
  ): ProductVariant | null => {
    if (!product.variants?.length) return null;
    return (
      product.variants.find((v: ProductVariant) => {
        if (attrKey === "Size" && v.size === attrValue) return true;
        if (attrKey === "Color" && v.color === attrValue) return true;
        if (attrKey === "Fabric" && v.fabric === attrValue) return true;
        const vVal = getVariantAttrValue(v, attrKey);
        return String(vVal) === String(attrValue);
      }) ?? null
    );
  };

  const getSwatchImage = (attrKey: string, attrValue: string): string => {
    const variant = findVariantForAttr(attrKey, attrValue);
    const img =
      variant?.media?.find(
        (m: { type: string; url: string }) => m.type === "IMAGE",
      )?.url ??
      product.media?.find(
        (m: { type: string; url: string }) => m.type === "IMAGE",
      )?.url;
    return img ?? "/placeholder.jpg";
  };

  useEffect(() => {
    if (hasVariants && product.variants?.length && !selectedVariant)
      setSelectedVariant(product.variants[0]);
  }, [hasVariants, product.variants, selectedVariant]);

  const images = useMemo(() => {
    const variantImages =
      selectedVariant?.media?.filter((m) => m.type === "IMAGE") || [];
    const productImages =
      product.media?.filter((m) => m.type === "IMAGE") || [];
    return variantImages.length > 0 ? variantImages : productImages;
  }, [product.media, selectedVariant?.media]);

  useEffect(() => {
    setSelectedImageIndex(0);
  }, [selectedVariant?.id]);

  // Use the selected variant's stock as the source of truth for variants.
  // This avoids a zero-stock parent record blocking a variant that has stock.
  const activeVariant = selectedVariant ?? (hasVariants ? product.variants?.[0] : undefined);
  const activeStockRow = hasVariants ? activeVariant?.stock?.[0] : product.stock?.[0];
  const availableStock = Math.max(0, Number(activeStockRow?.quantity ?? 0));
  const stockThreshold = Math.max(0, Number(activeStockRow?.lowStockThreshold ?? 0));
  const isOutOfStock = availableStock <= stockThreshold;

  const hasVideoConsultation = product.hasVideoConsultation ?? false;
  const videoPurchasingEnabled = product.videoPurchasingEnabled ?? false;
  const videoConsultationNote = product.videoConsultationNote;
  const allowOutOfStockOrders = product.allowOutOfStockOrders ?? false;

  const displayPrice =
    hasVariants && activeVariant
      ? Number(
          activeVariant.sellingPrice ??
            activeVariant.price ??
            product.sellingPrice,
        )
      : Number(product.sellingPrice);

  const basePrice =
    hasVariants && activeVariant
      ? Number(activeVariant.basePrice ?? product.basePrice)
      : Number(product.basePrice);

  const discount =
    basePrice > displayPrice
      ? Math.round(((basePrice - displayPrice) / basePrice) * 100)
      : 0;

  const attributeOptions = useMemo(() => {
    if (!hasVariants || !product.variants?.length) return [];
    const map = new Map<string, Set<string>>();
    for (const variant of product.variants) {
      const record = normalizeVariantAttributesToRecord(variant.attributes);
      for (const [key, value] of Object.entries(record)) {
        if (!key || !value) continue;
        if (!map.has(key)) map.set(key, new Set());
        map.get(key)!.add(value);
      }
    }
    return Array.from(map.entries()).map(([key, valuesSet]) => ({
      key,
      values: Array.from(valuesSet),
    }));
  }, [hasVariants, product.variants]);

  const selectedVariantAttributes = useMemo(
    () => normalizeVariantAttributesToRecord(selectedVariant?.attributes),
    [selectedVariant?.attributes],
  );

  const productSpecificationsAsAttrs = useMemo(
    () =>
      (product.specifications ?? []).map((s) => ({
        key: s.key,
        value: String(s.value),
      })),
    [product.specifications],
  );

  const getAllVariantOptions = useMemo(() => {
    if (!hasVariants || !product.variants?.length) return [];
    const optionsMap = new Map<string, Set<string>>();
    for (const variant of product.variants) {
      if (variant.size) {
        if (!optionsMap.has("Size")) optionsMap.set("Size", new Set());
        optionsMap.get("Size")!.add(variant.size);
      }
      if (variant.color) {
        if (!optionsMap.has("Color")) optionsMap.set("Color", new Set());
        optionsMap.get("Color")!.add(variant.color);
      }
      if (variant.fabric) {
        if (!optionsMap.has("Fabric")) optionsMap.set("Fabric", new Set());
        optionsMap.get("Fabric")!.add(variant.fabric);
      }
      const record = normalizeVariantAttributesToRecord(variant.attributes);
      for (const [key, value] of Object.entries(record)) {
        if (!key || !value) continue;
        if (!optionsMap.has(key)) optionsMap.set(key, new Set());
        optionsMap.get(key)!.add(value);
      }
    }
    return Array.from(optionsMap.entries()).map(([key, valuesSet]) => ({
      key,
      values: Array.from(valuesSet),
    }));
  }, [hasVariants, product.variants]);

  const getSelectedAttributeValue = (attrKey: string): string | null => {
    if (!selectedVariant) return null;
    if (attrKey === "Size") return selectedVariant.size || null;
    if (attrKey === "Color") return selectedVariant.color || null;
    if (attrKey === "Fabric") return selectedVariant.fabric || null;
    return getVariantAttrValue(selectedVariant, attrKey);
  };

  const handleSelectAnyAttribute = (attrKey: string, attrValue: string) => {
    if (!product.variants?.length) return;
    const matched = product.variants.find((v) => {
      if (attrKey === "Size" && v.size === attrValue) return true;
      if (attrKey === "Color" && v.color === attrValue) return true;
      if (attrKey === "Fabric" && v.fabric === attrValue) return true;
      const vVal = getVariantAttrValue(v, attrKey);
      return String(vVal) === String(attrValue);
    });
    if (matched) setSelectedVariant(matched);
    else toast.error("Variant not found for selected option");
  };

  const finalAttributesToShow =
    attributeOptions.length > 0
      ? selectedVariantAttributes
      : productSpecificationsAsAttrs;

  useEffect(() => {
    if (user) checkWishlistStatus();
    fetchRelatedProducts();
    const savedLocation = localStorage.getItem("userLocation");
    if (savedLocation) {
      const location = JSON.parse(savedLocation);
      setPincode(location.pincode);
      checkDeliveryAvailability(location.pincode);
    }
  }, [user, product.id]);

  const checkWishlistStatus = async () => {
    if (!user) return;
    try {
      const response = await wishlistApi.checkProduct(product.id);
      setIsWishlisted(response.data.isInWishlist);
    } catch (error) {
      console.error("Error checking wishlist:", error);
    }
  };

  const fetchRelatedProducts = async () => {
    try {
      const response = await productApi.getProducts({
        categoryId: product.categoryId,
        limit: 4,
        isActive: true,
      });
      const filtered = response.data.products.filter(
        (p) => p.id !== product.id,
      );
      setRelatedProducts(filtered.slice(0, 4));
    } catch (error) {
      console.error("Error fetching related products:", error);
    }
  };

  const checkDeliveryAvailability = async (pincodeToCheck: string) => {
    if (pincodeToCheck.length !== 6 || !/^\d+$/.test(pincodeToCheck)) {
      toast.error("Please enter a valid 6-digit pincode");
      return;
    }
    setIsCheckingDelivery(true);
    try {
      const response = await shipmentApi.checkServiceability({
        pickupPincode: process.env.NEXT_PUBLIC_WAREHOUSE_PINCODE || "110001",
        deliveryPincode: pincodeToCheck,
      });
      const couriers = response.data.couriers;
      const isServiceable = response.data.serviceable && couriers.length > 0;
      let estimatedDays = "3-5 days";
      if (isServiceable && couriers.length > 0) {
        const fastestCourier = couriers.reduce((prev: any, curr: any) => {
          const prevDays = parseInt(prev.estimated_delivery_days.split("-")[0]);
          const currDays = parseInt(curr.estimated_delivery_days.split("-")[0]);
          return prevDays < currDays ? prev : curr;
        });
        estimatedDays = fastestCourier.estimated_delivery_days + " days";
      }
      setDeliveryInfo({ isServiceable, estimatedDays, checked: true });
      localStorage.setItem(
        "userLocation",
        JSON.stringify({ pincode: pincodeToCheck, isServiceable }),
      );
      if (isServiceable)
        toast.success(`Delivery available! Expected in ${estimatedDays}`);
      else toast.error("Sorry, delivery not available to this pincode");
    } catch (error) {
      console.error("Error checking delivery:", error);
      toast.error("Failed to check delivery availability");
      setDeliveryInfo({
        isServiceable: false,
        estimatedDays: "N/A",
        checked: true,
      });
    } finally {
      setIsCheckingDelivery(false);
    }
  };

  const handleSelectCustomAttribute = (attrKey: string, attrValue: string) => {
    if (!product.variants?.length) return;
    const matched = product.variants.find((v) => {
      const vVal = getVariantAttrValue(v, attrKey);
      return String(vVal) === String(attrValue);
    });
    if (matched) setSelectedVariant(matched);
    else toast.error("Variant not found for selected option");
  };

  const handleCheckDelivery = () => checkDeliveryAvailability(pincode);

  const toggleWishlist = async () => {
    if (!user) {
      openModal("login");
      return;
    }
    try {
      if (isWishlisted) {
        const wishlist = await wishlistApi.getWishlist();
        const item = wishlist.data.items?.find(
          (i: any) => i.productId === product.id,
        );
        if (item) {
          await wishlistApi.removeFromWishlist(item.id);
          setIsWishlisted(false);
          toast.success("Removed from wishlist");
        }
      } else {
        await wishlistApi.addToWishlist({ productId: product.id });
        setIsWishlisted(true);
        toast.success("Added to wishlist");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update wishlist");
    }
  };

  const handleVideoConsultation = () => {
    if (!user) {
      openModal("login");
      toast.info("Please login to book a consultation");
      return;
    }
    setIsVideoModalOpen(true);
  };

  const handleRequestProduct = () => {
    if (!user) {
      openModal("login");
      toast.info("Please login to request this product");
      return;
    }
    setIsRequestModalOpen(true);
  };

  const addToCartMutation = useMutation({
    mutationFn: async ({
      product,
      variant,
    }: {
      product: Product;
      variant?: ProductVariant | null;
    }) => {
      const availableStock = product.stock?.[0]?.quantity ?? 0;
      const cartItem = {
        id: crypto.randomUUID(),
        cartId: "local",
        productId: product.id,
        variantId: variant?.id,
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
              size: variant.size ?? undefined,
              color: variant.color ?? undefined,
              fabric: variant.fabric ?? undefined,
              attributes: variant.attributes,
              stock: variant.stock?.map((s) => ({
                ...s,
                lowStockThreshold: s.lowStockThreshold ?? 0,
              })),
            }
          : undefined,
      };
      if (!user) addToLocalCart(cartItem);
      if (user)
        await cartApi.addToCart({
          productId: product.id,
          variantId: variant?.id,
          quantity: 1,
        });
    },
    onSuccess: () => {
      if (user) {
        queryClient.invalidateQueries({ queryKey: ["cartApi"] });
      }
      toast.success("Added to cart");
      openCartDrawer();
    },
    onError: () => toast.error("Failed to add to cart"),
  });

  const handleAddToCart = (
    product: Product,
    variant?: ProductVariant | null,
  ) => {
    if (isOutOfStock && !allowOutOfStockOrders) {
      toast.error("This product is currently unavailable");
      return;
    }
    addToCartMutation.mutate({ product, variant });
  };

  const handleBuyNow = async () => {
    if (isOutOfStock && !allowOutOfStockOrders) {
      toast.error("Product is out of stock");
      return;
    }
    if (quantity > availableStock && !allowOutOfStockOrders) {
      toast.error(`Only ${availableStock} items available`);
      return;
    }
    if (hasVariants && !selectedVariant) {
      toast.error("Please select product options");
      return;
    }
    const buyNowItem = {
      id: crypto.randomUUID(),
      productId: product.id,
      variantId: selectedVariant?.id,
      quantity,
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
            url: images?.[0]?.url ?? "/placeholder.jpg",
            altText: product.name,
            isActive: true,
          },
        ],
        stock:
          product.stock?.map((s) => ({
            ...s,
            lowStockThreshold: s.lowStockThreshold ?? 0,
          })) ?? [],
      },
      variant: selectedVariant
        ? {
            id: selectedVariant.id,
            sellingPrice: Number(selectedVariant.sellingPrice),
            basePrice: Number(selectedVariant.basePrice),
            size: selectedVariant.size ?? undefined,
            color: selectedVariant.color ?? undefined,
            fabric: selectedVariant.fabric ?? undefined,
            attributes: selectedVariant.attributes,
            stock:
              selectedVariant.stock?.map((s) => ({
                ...s,
                lowStockThreshold: s.lowStockThreshold ?? 0,
              })) ?? [],
          }
        : undefined,
    };
    if (!user) {
      sessionStorage.setItem("pendingAction", "buyNow");
      sessionStorage.setItem("buyNowData", JSON.stringify(buyNowItem));
      openModal("login");
      toast.info("Please login to continue");
      return;
    }
    try {
      sessionStorage.setItem("buyNowItem", JSON.stringify(buyNowItem));
      router.push("/checkout?mode=buyNow");
    } catch (error) {
      toast.error("Failed to proceed to checkout");
    }
    console.log("buyNowItem", buyNowItem);
  };

  const nextImage = () => {
    if (!images.length) return;
    setSelectedImageIndex((prev) => (prev + 1) % images.length);
  };
  const prevImage = () => {
    if (!images.length) return;
    setSelectedImageIndex((prev) =>
      prev === 0 ? images.length - 1 : prev - 1,
    );
  };

  return (
    <>
      <div className="bg-gradient-to-br from-amber-50 via-white to-orange-50">
        <div className="max-w-7xl mx-auto px-4 flex flex-col">
          {/* Breadcrumb */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-xs text-gray-500 py-2 flex-none"
          >
            <Link href="/" className="hover:text-gray-900">
              Home
            </Link>
            <span>›</span>
            <Link href="/shop" className="hover:text-gray-900">
              Products
            </Link>
            <span>›</span>
            <span className="text-gray-900 font-medium truncate max-w-40">
              {product.name}
            </span>
          </motion.div>

          {/* ── Main Product Section ── */}
          {/*
            Mobile: single column, content flows naturally.
            Desktop: side-by-side grid.
            On mobile we add pb-28 so content isn't hidden behind the floating bar.
          */}
          <div className="flex flex-col md:grid md:grid-cols-2 gap-5 pb-28 md:pb-6">
            {/* ── Left: Image Gallery ── */}
            <ZoomGallery
              images={images}
              selectedImageIndex={selectedImageIndex}
              setSelectedImageIndex={setSelectedImageIndex}
              prevImage={prevImage}
              nextImage={nextImage}
              product={product}
              discount={discount}
              isOutOfStock={isOutOfStock}
            />

            {/* ── Right: Product Info ── */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col"
            >
              {/* Scrollable content area */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {/* Name + Price */}
                <div>
                  <h1 className="text-2xl md:text-3xl font-serif text-gray-900 leading-tight">
                    {product.name}
                  </h1>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {product.category?.name}
                  </p>

                  <div className="flex items-baseline gap-2.5 mt-2">
                    {isOutOfStock ? (
                      <>
                        <span className="text-3xl font-bold text-gray-900">
                          {formatMaskedPrice(displayPrice)}
                        </span>
                        {discount > 0 && (
                          <>
                            <span className="text-lg text-gray-400 line-through">
                              {formatMaskedPrice(basePrice)}
                            </span>
                            <span className="bg-main-primary text-main-secondary px-2 py-0.5 rounded-full text-xs font-semibold">
                              {discount}% OFF
                            </span>
                          </>
                        )}
                      </>
                    ) : (
                      <>
                        <span className="text-3xl font-bold text-gray-900">
                          ₹
                          {displayPrice.toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                        {discount > 0 && (
                          <>
                            <span className="text-lg text-gray-400 line-through">
                              ₹
                              {basePrice.toLocaleString("en-IN", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </span>
                            <span className="bg-main-primary text-main-secondary px-2 py-0.5 rounded-full text-xs font-semibold">
                              {discount}% OFF
                            </span>
                          </>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Video Consultation */}
                {hasVideoConsultation &&
                  videoPurchasingEnabled &&
                  !isOutOfStock && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-3"
                    >
                      <div className="flex items-center gap-3">
                        <Video className="w-5 h-5 text-purple-600 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 text-sm">
                            Video Consultation Available
                          </h3>
                          {videoConsultationNote && (
                            <p className="text-xs text-gray-600 line-clamp-1">
                              {videoConsultationNote}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={handleVideoConsultation}
                          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 hover:shadow-md transition flex-shrink-0"
                        >
                          <Video className="w-3 h-3" /> Book
                        </button>
                      </div>
                    </motion.div>
                  )}

                {/* Variant Selector */}
                {hasVariants && getAllVariantOptions.length > 0 && (
                  <div className="bg-white rounded-xl border border-gray-200 p-3">
                    <h3 className="font-semibold text-gray-900 text-sm mb-3">
                      Select Options
                    </h3>
                    <div className="space-y-3">
                      {getAllVariantOptions.map((attr) => {
                        const currentValue = getSelectedAttributeValue(
                          attr.key,
                        );
                        return (
                          <div key={attr.key} className="space-y-1.5">
                            <p className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                              {attr.key}
                              {/* {attr.key === "Color" && (
                                <Palette className="h-3 h-3 text-purple-500" />
                              )} */}
                            </p>
                            <div className="flex gap-2 flex-wrap">
                              {attr.values.map((val) => {
                                const isSelected =
                                  String(currentValue) === String(val);

                                if (attr.key.toLowerCase() === "color") {
                                  return (
                                    <motion.button
                                      key={val}
                                      whileHover={{ scale: 1.05 }}
                                      whileTap={{ scale: 0.95 }}
                                      onClick={() =>
                                        handleSelectAnyAttribute(attr.key, val)
                                      }
                                      className={`group relative flex flex-col items-center gap-1`}
                                    >
                                      <span
                                        className={`relative block h-12 w-12 overflow-hidden rounded-full border-2 transition ${
                                          isSelected
                                            ? "border-main-primary ring-2 ring-main-primary/40"
                                            : "border-gray-200 group-hover:border-gray-400"
                                        }`}
                                      >
                                        <Image
                                          src={getSwatchImage(attr.key, val)}
                                          alt={formatColorText(val)}
                                          fill
                                          sizes="48px"
                                          className="object-cover"
                                        />
                                        {isSelected && (
                                          <span className="absolute inset-0 flex items-center justify-center bg-black/20">
                                            <Check className="w-4 h-4 text-white drop-shadow" />
                                          </span>
                                        )}
                                      </span>
                                      <span
                                        className={`text-[10px] font-medium ${
                                          isSelected
                                            ? "text-gray-900"
                                            : "text-gray-500"
                                        }`}
                                      >
                                        {formatColorText(val)}
                                      </span>
                                    </motion.button>
                                  );
                                }

                                return (
                                  <motion.button
                                    key={val}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() =>
                                      handleSelectAnyAttribute(attr.key, val)
                                    }
                                    className={`px-3 py-1.5 border-2 rounded-lg font-medium transition text-xs ${
                                      isSelected
                                        ? "border-main-primary bg-main-primary text-main-secondary"
                                        : "border-gray-300 hover:border-gray-400"
                                    }`}
                                  >
                                    {val}
                                  </motion.button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Stock Status */}
                <div>
                  {isOutOfStock && !allowOutOfStockOrders ? (
                    <div className="space-y-1">
                      <p className="text-red-600 font-medium text-sm flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4" /> Out of Stock
                      </p>
                      {allowOutOfStockOrders && (
                        <p className="text-xs text-gray-500">
                          Request to be notified when back in stock.
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-main-secondary font-medium text-sm">
                      ✓ In Stock ({availableStock} available)
                    </p>
                  )}
                </div>

                {/* Delivery Check */}
                {!isOutOfStock && (
                  <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
                    <div className="flex items-center gap-1.5 mb-2">
                      <MapPin className="w-4 h-4 text-gray-700" />
                      <h3 className="font-semibold text-gray-900 text-xs">
                        Check Delivery
                      </h3>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Enter Pincode"
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                        maxLength={6}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-sm"
                        onKeyDown={(e) => {
                          if (e.key === "Enter")
                            checkDeliveryAvailability(pincode);
                        }}
                      />
                      <button
                        onClick={handleCheckDelivery}
                        disabled={isCheckingDelivery}
                        className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition text-xs font-medium disabled:opacity-50"
                      >
                        {isCheckingDelivery ? "..." : "Check"}
                      </button>
                    </div>

                    {deliveryInfo?.checked && (
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`mt-2 p-3 rounded-xl flex items-center gap-2 ${
                          deliveryInfo.isServiceable
                            ? "bg-[#58292C]/10 border border-[#58292C]/20"
                            : "bg-red-50 border border-red-200"
                        }`}
                      >
                        {deliveryInfo.isServiceable ? (
                          <Check className="w-4 h-4 text-main-secondary flex-shrink-0" />
                        ) : (
                          <X className="w-4 h-4 text-red-600 flex-shrink-0" />
                        )}
                        <div>
                          <p
                            className={`font-medium text-sm ${
                              deliveryInfo.isServiceable
                                ? "text-main-primary"
                                : "text-red-900"
                            }`}
                          >
                            {deliveryInfo.isServiceable
                              ? "Delivery Available"
                              : "Not Serviceable"}
                          </p>
                          {deliveryInfo.isServiceable && (
                            <p className="text-xs text-main-secondary">
                              Expected in {deliveryInfo.estimatedDays}
                            </p>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </div>
                )}

                {/* Quantity */}
                {!isOutOfStock && (
                  <div>
                    <h3 className="font-semibold text-gray-900 text-xs mb-1.5">
                      Quantity
                    </h3>
                    <div className="flex items-center gap-3">
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center font-bold text-sm"
                      >
                        −
                      </motion.button>
                      <span className="text-lg font-semibold w-8 text-center">
                        {quantity}
                      </span>
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() =>
                          setQuantity(Math.min(availableStock, quantity + 1))
                        }
                        className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center font-bold text-sm"
                      >
                        +
                      </motion.button>
                    </div>
                  </div>
                )}
              </div>

              {/* ── Desktop-only sticky CTA footer ── */}
              <div className="hidden md:block flex-none pt-3 space-y-2.5 border-t border-gray-200 mt-2">
                {/* Action Buttons */}
                <div className="flex gap-2.5">
                  {isOutOfStock && !allowOutOfStockOrders ? (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleRequestProduct}
                      className="flex-1 bg-black text-white py-3 rounded-xl font-semibold shadow flex items-center justify-center gap-2 text-sm"
                    >
                      <AlertCircle className="w-4 h-4" /> Request Product
                    </motion.button>
                  ) : (
                    <>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() =>
                          handleAddToCart(product, selectedVariant)
                        }
                        disabled={(availableStock === 0 && !allowOutOfStockOrders) || addToCartMutation.isPending}
                        className="flex-1 bg-gray-900 text-white py-3 rounded-xl font-semibold shadow hover:shadow-md transition flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {addToCartMutation.isPending ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Adding...</span>
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="w-4 h-4" />
                            <span>Add to Cart</span>
                          </>
                        )}
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleBuyNow}
                        disabled={(isOutOfStock && !allowOutOfStockOrders)}
                        className="flex-1 bg-main-primary text-main-secondary py-3 rounded-xl font-semibold shadow hover:shadow-md transition flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Zap className="w-4 h-4" /> Buy Now
                      </motion.button>
                    </>
                  )}
                  <WishlistButton
                    productId={product.id}
                    variant="icon"
                    size="md"
                    className="bg-white hover:bg-gray-100 shadow border border-gray-200 rounded-xl px-3"
                  />
                </div>

                {/* Trust badges */}
                {/* <div className="grid grid-cols-3 gap-2">
                  {[{ icon: Shield, label: "Secure Payment" }].map(
                    ({ icon: Icon, label }) => (
                      <div
                        key={label}
                        className="flex items-center justify-center gap-1.5 py-1.5 bg-gray-50 rounded-lg"
                      >
                        <Icon className="w-3.5 h-3.5 text-gray-600 flex-shrink-0" />
                        <p className="text-[10px] text-gray-600 font-medium">
                          {label}
                        </p>
                      </div>
                    ),
                  )}
                </div> */}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          MOBILE FLOATING CTA BAR
          Fixed to bottom, above everything. Hidden on md+ screens.
          Shows: Add to Cart | Buy Now | Wishlist icon
      ══════════════════════════════════════════════════════════════ */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.12)]">
        {/* Price strip */}
        <div className="flex items-center justify-between px-4 pt-2.5 pb-1">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-gray-900">
              {isOutOfStock
                ? formatMaskedPrice(displayPrice)
                : `₹${displayPrice.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            </span>
            {discount > 0 && (
              <span className="text-xs text-gray-400 line-through">
                {isOutOfStock
                  ? formatMaskedPrice(basePrice)
                  : `₹${basePrice.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              </span>
            )}
          </div>
          {discount > 0 && !isOutOfStock && (
            <span className="bg-main-primary text-main-secondary text-[10px] font-bold px-2 py-0.5 rounded-full">
              {discount}% OFF
            </span>
          )}
        </div>

        {/* Buttons row */}
        <div
          className="flex items-center gap-2 px-4 pb-4 pt-1"
          style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 12px)" }}
        >
          {isOutOfStock && !allowOutOfStockOrders ? (
            /* Out of stock — Request button full width */
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleRequestProduct}
              className="flex-1 bg-black text-white py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg"
            >
              <AlertCircle className="w-4 h-4" />
              Request Product
            </motion.button>
          ) : (
            <>
              {/* Add to Cart */}
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => handleAddToCart(product, selectedVariant)}
                disabled={(isOutOfStock && !allowOutOfStockOrders) || addToCartMutation.isPending}
                className="flex-1 bg-gray-900 text-white py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {addToCartMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Adding to Cart...</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4" />
                    <span>Add to Cart</span>
                  </>
                )}
              </motion.button>

              {/* Buy Now */}
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleBuyNow}
                disabled={(isOutOfStock && !allowOutOfStockOrders)}
                className="flex-1 bg-main-primary text-main-secondary py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Zap className="w-4 h-4" />
                Buy Now
              </motion.button>

              {/* Wishlist icon button */}
              <WishlistButton
                productId={product.id}
                variant="icon"
                size="md"
                className="w-12 h-12 flex-shrink-0 bg-gray-100 hover:bg-gray-200 rounded-xl border border-gray-200 flex items-center justify-center"
              />
            </>
          )}
        </div>
      </div>

      {/* ── Below-fold: Tabs + Related (normal scroll) ── */}
      <div className="bg-gradient-to-br from-amber-50 via-white to-orange-50">
        <div className="max-w-7xl mx-auto px-4 pb-12">
          {/* Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow p-5 md:p-7 mb-10 mt-4"
          >
            <div className="flex gap-6 border-b border-gray-200 mb-5">
              {(["details", "specs"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-2.5 font-semibold transition relative capitalize text-sm ${activeTab === tab ? "text-black" : "text-gray-400"}`}
                >
                  {tab}
                  {activeTab === tab && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-black"
                    />
                  )}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {activeTab === "details" && (
                <motion.div
                  key="details"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                >
                  <div
                    className="product-description"
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(product.description),
                    }}
                  />
                </motion.div>
              )}
              {activeTab === "specs" && (
                <motion.div
                  key="specs"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                >
                  {product.specifications &&
                  product.specifications.length > 0 ? (
                    <div className="grid md:grid-cols-2 gap-3">
                      {product.specifications.map((spec) => (
                        <div
                          key={spec.id}
                          className="flex justify-between py-2 border-b text-sm"
                        >
                          <span className="font-medium text-gray-700">
                            {spec.key}
                          </span>
                          <span className="text-gray-600">{spec.value}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">
                      No specifications available
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-5">
                You May Also Like
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {relatedProducts.map((relatedProduct, idx) => (
                  <Link
                    key={relatedProduct.id}
                    href={`/products/${relatedProduct.slug}`}
                  >
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.08 }}
                      whileHover={{ y: -6 }}
                      className="bg-white rounded-xl overflow-hidden shadow hover:shadow-xl transition cursor-pointer"
                    >
                      <div className="aspect-square overflow-hidden relative">
                        <Image
                          src={
                            relatedProduct.media?.[0]?.url || "/placeholder.jpg"
                          }
                          alt={relatedProduct.name}
                          fill
                          sizes="(max-width: 768px) 50vw, 25vw"
                          className="object-cover"
                        />
                      </div>
                      <div className="p-3">
                        <h4 className="font-semibold text-sm mb-1 line-clamp-2">
                          {relatedProduct.name}
                        </h4>
                        <p className="font-bold text-sm">
                          ₹
                          {Number(relatedProduct.sellingPrice).toLocaleString(
                            "en-IN",
                            {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            },
                          )}
                        </p>
                      </div>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      <ProductRequestModal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        product={product}
        selectedVariant={selectedVariant}
      />
      <VideoConsultationModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        productId={product.id}
        productName={product.name}
        categoryId={product.categoryId}
        onSuccess={() =>
          toast.success("We'll contact you soon to confirm your consultation!")
        }
      />
    </>
  );
}
