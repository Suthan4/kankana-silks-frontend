"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { Video } from "lucide-react";
import Link from "next/link";
import type { Product, ProductVariant } from "@/lib/api/product.api";
import { useAuthModal } from "@/store/useAuthModalStore";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
const ProductRequestModal = dynamic(() => import("@/components/productRequestModal"));
const VideoConsultationModal = dynamic(() => import("@/components/video-consultationModal"));
import { trackViewItem } from "@/lib/analytics";
import { ProductDeliveryChecker } from "@/features/product/components/ProductDeliveryChecker";
import { ProductQuantitySelector } from "@/features/product/components/ProductQuantitySelector";
import { ProductDetailsTabs } from "@/features/product/components/ProductDetailsTabs";
import { RelatedProductsSection } from "@/features/product/components/RelatedProductsSection";
import { ProductInformation } from "@/features/product/components/ProductInformation";
import {
  ProductDesktopPurchaseActions,
  ProductMobilePurchaseActions,
} from "@/features/product/components/ProductPurchaseActions";
import { ProductStockStatus } from "@/features/product/components/ProductStockStatus";
import { ProductImageGallery } from "@/features/product/components/ProductImageGallery";
import { ProductVariantSelector } from "@/features/product/components/ProductVariantSelector";
import { useProductVariants } from "@/features/product/hooks/useProductVariants";
import { useProductDelivery } from "@/features/product/hooks/useProductDelivery";
import { useProductCart } from "@/features/product/hooks/useProductCart";
import { getProductStock } from "@/features/product/utils/productStockAdapter";
import { canIncreaseCartItemQuantity } from "@/lib/utils/cartStock";

interface ProductDetailsClientProps {
  initialProduct: Product;
}

export default function ProductDetailsClient({
  initialProduct,
}: ProductDetailsClientProps) {
  const { user, openModal } = useAuthModal();
  const router = useRouter();

  const product = initialProduct;
  const {
    hasVariants,
    selectedVariant,
    images,
    productImages,
    hasVariantImages,
    options: variantOptions,
    getSelectedAttributeValue,
    getSwatchImage,
    selectAttribute,
  } = useProductVariants(initialProduct);
  const {
    pincode,
    setPincode,
    deliveryInfo,
    isCheckingDelivery,
    checkDeliveryAvailability,
    checkDelivery: handleCheckDelivery,
  } = useProductDelivery(initialProduct.id);
  const { addToCartMutation } = useProductCart();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [useProductImagesFallback, setUseProductImagesFallback] = useState(false);
  const galleryImages =
    useProductImagesFallback && productImages.length > 0
      ? productImages
      : images;

  useEffect(() => {
    setSelectedImageIndex(0);
    setUseProductImagesFallback(false);
  }, [selectedVariant?.id]);
  const [quantity, setQuantity] = useState(1);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [hasOpenedRequestModal, setHasOpenedRequestModal] = useState(false);
  const [hasOpenedVideoModal, setHasOpenedVideoModal] = useState(false);

  const { item: stockItem, state: stockState, message: stockMessage } = getProductStock({
    product,
    variant: hasVariants ? selectedVariant : undefined,
    quantity,
  });
  const availableStock = stockState.available;
  const maxAllowedQuantity = stockState.maxAllowed;
  const isOutOfStock = stockState.isOutOfStock;
  const canIncreaseQuantity =
    (!hasVariants || Boolean(selectedVariant)) &&
    canIncreaseCartItemQuantity({ ...stockItem, quantity }, quantity + 1);

  useEffect(() => {
    setQuantity((current) =>
      Math.max(1, Math.min(current, maxAllowedQuantity)),
    );
  }, [selectedVariant?.id, maxAllowedQuantity]);

  const hasVideoConsultation = product.hasVideoConsultation ?? false;
  const videoPurchasingEnabled = product.videoPurchasingEnabled ?? false;
  const videoConsultationNote = product.videoConsultationNote;

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
  }, [
    product.id,
    product.name,
    product.category?.name,
    selectedVariant?.id,
    hasVariants,
    displayPrice,
  ]);



  const handleVideoConsultation = () => {
    if (!user) {
      openModal("login");
      toast.info("Please login to book a consultation");
      return;
    }
    setHasOpenedVideoModal(true);
    setIsVideoModalOpen(true);
  };

  const handleRequestProduct = () => {
    if (!user) {
      openModal("login");
      toast.info("Please login to request this product");
      return;
    }
    setHasOpenedRequestModal(true);
    setIsRequestModalOpen(true);
  };

  const handleAddToCart = (
    product: Product,
    variant?: ProductVariant | null,
  ) => {
    if (product.hasVariants && !variant) {
      toast.error("Please select product options before adding to cart.");
      return;
    }
    if (stockState.isOutOfStock || 1 > maxAllowedQuantity) {
      toast.error(
        stockMessage?.message ?? "This product is currently unavailable",
      );
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
            url: galleryImages?.[0]?.url ?? "/placeholder.jpg",
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
  
  };

  const nextImage = () => {
    if (!galleryImages.length) return;
    setSelectedImageIndex((prev) => (prev + 1) % galleryImages.length);
  };
  const prevImage = () => {
    if (!galleryImages.length) return;
    setSelectedImageIndex((prev) =>
      prev === 0 ? galleryImages.length - 1 : prev - 1,
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
              images={galleryImages}
              onImageError={() => {
                if (hasVariantImages && !useProductImagesFallback && productImages.length > 0) {
                  setUseProductImagesFallback(true);
                  setSelectedImageIndex(0);
                }
              }}
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
                <ProductInformation
                  name={product.name}
                  categoryName={product.category?.name}
                  displayPrice={displayPrice}
                  basePrice={basePrice}
                  discount={discount}
                  isOutOfStock={isOutOfStock}
                />

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
                        <Video className="w-5 h-5 text-main-primary flex-shrink-0" />
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
                          className="brand-button min-h-9 flex-shrink-0 rounded-lg px-3 py-1.5 text-xs normal-case tracking-normal"
                        >
                          <Video className="w-3 h-3" /> Book
                        </button>
                      </div>
                    </motion.div>
                  )}

                <ProductVariantSelector
                  hasVariants={hasVariants}
                  options={variantOptions}
                  getSelectedAttributeValue={getSelectedAttributeValue}
                  getSwatchImage={getSwatchImage}
                  onSelectAttribute={handleSelectAnyAttribute}
                />

                <ProductStockStatus
                  stockState={stockState}
                  availableStock={availableStock}
                  stockMessage={stockMessage}
                />

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
                  canIncreaseQuantity={canIncreaseQuantity}
                  onQuantityChange={setQuantity}
                />
              </div>

              <ProductDesktopPurchaseActions
                productId={product.id}
                variantId={selectedVariant?.id}
                isOutOfStock={isOutOfStock}
                isAddingToCart={addToCartMutation.isPending}
                onAddToCart={() => handleAddToCart(product, selectedVariant)}
                onBuyNow={handleBuyNow}
                onRequestProduct={handleRequestProduct}
                displayPrice={displayPrice}
                basePrice={basePrice}
                discount={discount}
              />
            </motion.div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          MOBILE FLOATING CTA BAR
          Fixed to bottom, above everything. Hidden on md+ screens.
          Shows: Add to Cart | Buy Now | Wishlist icon
      ══════════════════════════════════════════════════════════════ */}

      <ProductMobilePurchaseActions
        productId={product.id}
        variantId={selectedVariant?.id}
        isOutOfStock={isOutOfStock}
        isAddingToCart={addToCartMutation.isPending}
        onAddToCart={() => handleAddToCart(product, selectedVariant)}
        onBuyNow={handleBuyNow}
        onRequestProduct={handleRequestProduct}
        displayPrice={displayPrice}
        basePrice={basePrice}
        discount={discount}
      />

      {/* ── Below-fold: Tabs + Related (normal scroll) ── */}
      <div className="bg-gradient-to-br from-amber-50 via-white to-orange-50">
        <div className="max-w-7xl mx-auto px-4 pb-12">
          <ProductDetailsTabs product={product} />
          <RelatedProductsSection categoryId={product.categoryId} productId={product.id} />
        </div>
      </div>

      {hasOpenedRequestModal && (
        <ProductRequestModal
          isOpen={isRequestModalOpen}
          onClose={() => setIsRequestModalOpen(false)}
          product={product}
          selectedVariant={selectedVariant}
        />
      )}
      {hasOpenedVideoModal && (
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
      )}
    </>
  );
}
