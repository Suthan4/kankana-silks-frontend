"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ShoppingCart,
  Check,
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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { trackAddToCart, trackViewItem } from "@/lib/analytics";
import { ProductDeliveryChecker, ProductQuantitySelector, ProductDetailsTabs, RelatedProducts } from "@/features/product/components/ProductDetailSections";
import { ProductInformation } from "@/features/product/components/ProductInformation";
import { ProductStockStatus } from "@/features/product/components/ProductStockStatus";
import { ProductImageGallery } from "@/features/product/components/ProductImageGallery";
import { ProductVariantSelector } from "@/features/product/components/ProductVariantSelector";
import { useProductVariants } from "@/features/product/hooks/useProductVariants";
import { getProductStock } from "@/features/product/utils/productStockAdapter";

import VideoConsultationModal from "../video-consultationModal";
import WishlistButton from "../ui/WishlistButton";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { trackAddToCart, trackViewItem } from "@/lib/analytics";

interface ProductDetailsClientProps {
  initialProduct: Product;
}

export default function ProductDetailsClient({
  initialProduct,
}: ProductDetailsClientProps) {
  const { user, openModal } = useAuthModal();
  const { addItem: addToLocalCart } = useCartStore();
  const { open: openCartDrawer } = useCartDrawer();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [product] = useState<Product>(initialProduct);
  const {hasVariants,selectedVariant,images,options:variantOptions,getSelectedAttributeValue,getSwatchImage,selectAttribute}=useProductVariants(initialProduct);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
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

  const { state: stockState, message: stockMessage } = getProductStock({
    product,
    variant: hasVariants ? selectedVariant : undefined,
    quantity,
  });
  const availableStock = stockState.available;
  const maxAllowedQuantity = stockState.maxAllowed;
  const isOutOfStock = stockState.isOutOfStock;

  useEffect(() => {
    setQuantity((current) => Math.max(1, Math.min(current, maxAllowedQuantity)));
  }, [selectedVariant?.id, maxAllowedQuantity]);

  const hasVideoConsultation = product.hasVideoConsultation ?? false;
  const videoPurchasingEnabled = product.videoPurchasingEnabled ?? false;
  const videoConsultationNote = product.videoConsultationNote;
  const allowOutOfStockOrders = product.allowOutOfStockOrders ?? false;

  const displayPrice =
    hasVariants && selectedVariant
      ? Number(
          selectedVariant.sellingPrice ??
            selectedVariant.price ??
            product.sellingPrice,
        )
      : Number(product.sellingPrice);

  const basePrice =
    hasVariants && selectedVariant
      ? Number(selectedVariant.basePrice ?? product.basePrice)
      : Number(product.basePrice);

  const discount =
    basePrice > displayPrice
      ? Math.round(((basePrice - displayPrice) / basePrice) * 100)
      : 0;

  const handleSelectAnyAttribute = (key: string, value: string) => {
    if (!selectAttribute(key, value)) {
      toast.error("Variant not found for selected option");
    }
  };

  useEffect(() => {
    if (hasVariants && !selectedVariant) return;
    trackViewItem({
      item_id: product.id,
      item_name: product.name,
      item_category: product.category?.name,
      item_variant: selectedVariant?.id,
      price: displayPrice,
    });
  }, [product.id, product.name, product.category?.name, selectedVariant?.id, hasVariants, displayPrice]);

  useEffect(() => {
    if (user) checkWishlistStatus();
  }, [user, product.id]);

  useEffect(() => {
    const savedLocation = localStorage.getItem("userLocation");
    if (!savedLocation) return;
    try {
      const location = JSON.parse(savedLocation);
      if (location?.pincode) {
        setPincode(location.pincode);
        checkDeliveryAvailability(location.pincode);
      }
    } catch {
      localStorage.removeItem("userLocation");
    }
  }, [product.id]);

  const { data: relatedProducts = [] } = useQuery({
    queryKey: ["relatedProducts", product.categoryId, product.id],
    queryFn: async () => {
      const response = await productApi.getProducts({
        categoryId: product.categoryId,
        limit: 8,
        isActive: true,
      });
      return response.data.products
        .filter((relatedProduct) => relatedProduct.id !== product.id)
        .slice(0, 4);
    },
    enabled: Boolean(product.categoryId),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const checkWishlistStatus = async () => {
    if (!user) return;
    try {
      const response = await wishlistApi.checkProduct(product.id);
      setIsWishlisted(response.data.isInWishlist);
    } catch (error) {
      console.error("Error checking wishlist:", error);
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
      quantity,
    }: {
      product: Product;
      variant?: ProductVariant | null;
      quantity: number;
    }) => {
      const cartItem = {
        id: crypto.randomUUID(),
        cartId: "local",
        productId: product.id,
        variantId: variant?.id,
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
              url: product.media?.[0]?.url ?? "/placeholder.jpg",
              altText: product.name,
              isActive: true,
            },
          ],
          stock: product.stock?.map((stock) => ({
            ...stock,
            lowStockThreshold: stock.lowStockThreshold ?? 0,
          })) ?? [],
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
          quantity,
        });
    },
    onSuccess: (_data, variables) => {
      trackAddToCart({
        item_id: variables.product.id,
        item_name: variables.product.name,
        item_category: variables.product.category?.name,
        item_variant: variables.variant?.id,
        price: Number(variables.variant?.sellingPrice ?? variables.variant?.price ?? variables.product.sellingPrice),
        quantity: variables.quantity,
      });
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
    if (product.hasVariants && !variant) {
      toast.error("Please select product options before adding to cart.");
      return;
    }
    if (stockState.isOutOfStock || 1 > maxAllowedQuantity) {
      toast.error(stockMessage?.message ?? "This product is currently unavailable");
      return;
    }
    addToCartMutation.mutate({ product, variant, quantity });
  };

  const handleBuyNow = async () => {
    if (stockState.isOutOfStock || quantity > maxAllowedQuantity) {
      toast.error(
        stockMessage?.message ??
          (stockState.isLimited
            ? "Only one item can be ordered at this time."
            : "Only " + availableStock + " items available"),
      );
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
          <div className="flex flex-col md:grid md:grid-cols-2 gap-5 pb-28 md:pb-6 pt-10">
            {/* ── Left: Image Gallery ── */}
            <ProductImageGallery
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
                <ProductInformation name={product.name} categoryName={product.category?.name} displayPrice={displayPrice} basePrice={basePrice} discount={discount} isOutOfStock={isOutOfStock} />

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

                <ProductVariantSelector hasVariants={hasVariants} options={variantOptions} getSelectedAttributeValue={getSelectedAttributeValue} getSwatchImage={getSwatchImage} onSelectAttribute={handleSelectAnyAttribute} />

                <ProductStockStatus stockState={stockState} availableStock={availableStock} stockMessage={stockMessage} />

                <ProductDeliveryChecker
                  isOutOfStock={isOutOfStock}
                  pincode={pincode}
                  onPincodeChange={setPincode}
                  deliveryInfo={deliveryInfo}
                  isCheckingDelivery={isCheckingDelivery}
                  onCheckDelivery={handleCheckDelivery}
                  onCheckDeliveryAvailability={checkDeliveryAvailability}
                />

                <ProductQuantitySelector
                  isOutOfStock={isOutOfStock}
                  quantity={quantity}
                  maxAllowedQuantity={maxAllowedQuantity}
                  onQuantityChange={setQuantity}
                />
              </div>

              {/* ── Desktop-only sticky CTA footer ── */}
              <div className="hidden md:block flex-none pt-3 space-y-2.5 border-t border-gray-200 mt-2">
                {/* Action Buttons */}
                <div className="flex gap-2.5">
                  {isOutOfStock ? (
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
                        disabled={stockState.isOutOfStock || addToCartMutation.isPending}
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
                        disabled={stockState.isOutOfStock}
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
          {isOutOfStock ? (
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
                disabled={stockState.isOutOfStock || addToCartMutation.isPending}
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
                disabled={stockState.isOutOfStock}
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
          <ProductDetailsTabs product={product} />
          <RelatedProducts products={relatedProducts} />
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
