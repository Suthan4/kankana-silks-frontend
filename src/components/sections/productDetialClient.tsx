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
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { productApi, ProductVariant, type Product } from "@/lib/api/product.api";
import { wishlistApi } from "@/lib/api/wishlist.api";
import { cartApi } from "@/lib/api/cart.api";
import { shipmentApi } from "@/lib/api/shipment.api";
import { useAuthModal } from "@/store/useAuthModalStore";
import { toast } from "@/store/useToastStore";
import { useCartStore } from "@/store/useCartStore";

interface ProductDetailsClientProps {
  initialProduct: Product;
}

export default function ProductDetailsClient({
  initialProduct,
}: ProductDetailsClientProps) {
  const { user, openModal } = useAuthModal();
  const { addItem: addToLocalCart } = useCartStore();

  // State
  const [product] = useState<Product>(initialProduct);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [activeTab, setActiveTab] = useState<"details" | "specs">("details");
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  // Pincode & Delivery State
  const [pincode, setPincode] = useState("");
  const [deliveryInfo, setDeliveryInfo] = useState<{
    isServiceable: boolean;
    estimatedDays: string;
    checked: boolean;
  } | null>(null);
  const [isCheckingDelivery, setIsCheckingDelivery] = useState(false);

  const hasVariants =
    product.hasVariants &&
    Array.isArray(product.variants) &&
    product.variants.length > 0;

  // ✅ Auto select first variant for single variant products
  useEffect(() => {
    if (hasVariants && product.variants?.length && !selectedVariant) {
      setSelectedVariant(product.variants[0]);
    }
  }, [hasVariants, product.variants, selectedVariant]);

  // ✅ Variant media fallback
  const images = useMemo(() => {
    const variantImages =
      selectedVariant?.media?.filter((m) => m.type === "IMAGE") || [];

    const productImages =
      product.media?.filter((m) => m.type === "IMAGE") || [];

    // ✅ If variant has media use it, else fallback to product media
    return variantImages.length > 0 ? variantImages : productImages;
  }, [product.media, selectedVariant?.media]);

  // ✅ Reset image index when variant changes (avoid out of range)
  useEffect(() => {
    setSelectedImageIndex(0);
  }, [selectedVariant?.id]);

  // ✅ Stock logic
  const availableStock = hasVariants
    ? selectedVariant?.stock?.[0]?.quantity ?? 0
    : product.stock?.[0]?.quantity ?? 0;

  // ✅ Price + discount (variant first priority)
  const displayPrice =
    hasVariants && selectedVariant
      ? Number(
          selectedVariant.sellingPrice ??
            selectedVariant.price ??
            product.sellingPrice
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

  // ✅ Variant attributes render (Pattern Style / Weave Type)
  const selectedVariantAttributes = useMemo(() => {
    const attrs = selectedVariant?.attributes;
    if (!attrs) return [];

    return Object.entries(attrs).map(([key, value]) => ({
      key,
      value: String(value),
    }));
  }, [selectedVariant?.attributes]);

  useEffect(() => {
    if (user) {
      checkWishlistStatus();
    }
    fetchRelatedProducts();

    // Load saved pincode
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
        (p) => p.id !== product.id
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

      setDeliveryInfo({
        isServiceable,
        estimatedDays,
        checked: true,
      });

      localStorage.setItem(
        "userLocation",
        JSON.stringify({
          pincode: pincodeToCheck,
          isServiceable,
        })
      );

      if (isServiceable) {
        toast.success(`Delivery available! Expected in ${estimatedDays}`);
      } else {
        toast.error("Sorry, delivery not available to this pincode");
      }
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

  const handleCheckDelivery = () => {
    checkDeliveryAvailability(pincode);
  };

  const toggleWishlist = async () => {
    if (!user) {
      openModal("login");
      return;
    }

    try {
      if (isWishlisted) {
        const wishlist = await wishlistApi.getWishlist();
        const item = wishlist.data.items?.find(
          (i: any) => i.productId === product.id
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

  const handleAddToCart = async () => {
    if (quantity > availableStock) {
      toast.error(`Only ${availableStock} items available`);
      return;
    }

    try {
      setLoading(true);

      const cartItem = {
        id: crypto.randomUUID(),
        productId: product.id,
        variantId: selectedVariant?.id,
        name: product.name,
        slug: product.slug,
        price: Number(displayPrice),
        basePrice: Number(basePrice),
        quantity,
        image: images?.[0]?.url ?? "/placeholder.jpg",
        stock: availableStock,

        variant: selectedVariant
          ? {
              size: selectedVariant.size ?? undefined,
              color: selectedVariant.color ?? undefined,
              fabric: selectedVariant.fabric ?? undefined,
              attributes: selectedVariant.attributes ?? undefined,
            }
          : undefined,
      };


      addToLocalCart(cartItem);
      toast.success("Added to cart");

      if (user) {
        try {
          await cartApi.addToCart({
            productId: product.id,
            variantId: selectedVariant?.id,
            quantity,
          });
        } catch (error) {
          console.error("Failed to sync with server:", error);
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to add to cart");
    } finally {
      setLoading(false);
    }
  };

  const nextImage = () => {
    if (!images.length) return;
    setSelectedImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    if (!images.length) return;
    setSelectedImageIndex((prev) =>
      prev === 0 ? images.length - 1 : prev - 1
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-sm text-gray-600 mb-6"
        >
          <Link href="/" className="hover:text-gray-900">
            Home
          </Link>
          <span>›</span>
          <Link href="/products" className="hover:text-gray-900">
            Products
          </Link>
          <span>›</span>
          <span className="text-gray-900">{product.name}</span>
        </motion.div>

        {/* Main Product Section */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Image Gallery */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-white shadow-xl">
              {images.length > 0 ? (
                <>
                  <Image
                    src={images[selectedImageIndex].url}
                    alt={images[selectedImageIndex].altText || product.name}
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />

                  {images.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 p-2 rounded-full shadow-lg hover:bg-white transition"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 p-2 rounded-full shadow-lg hover:bg-white transition"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </>
                  )}
                </>
              ) : (
                <div className="flex items-center justify-center h-full bg-gray-100">
                  <p className="text-gray-400">No image available</p>
                </div>
              )}

              {discount > 0 && (
                <div className="absolute top-4 left-4 bg-green-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  {discount}% OFF
                </div>
              )}
            </div>

            {/* Thumbnail Grid */}
            {images?.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {images?.map((img: any, idx: number) => (
                  <motion.button
                    key={img.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition ${
                      selectedImageIndex === idx
                        ? "border-yellow-500"
                        : "border-transparent"
                    }`}
                  >
                    <Image
                      src={img.url}
                      alt={img.altText || `${product.name} ${idx + 1}`}
                      width={200}
                      height={200}
                      className="w-full h-full object-cover"
                    />
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div>
              <h1 className="text-3xl md:text-4xl font-serif mb-2 text-gray-900">
                {product.name}
              </h1>
              <p className="text-gray-600">{product.category?.name}</p>

              {/* ✅ Price (Variant aware) */}
              <div className="flex items-baseline gap-3 mt-4">
                <span className="text-4xl font-bold text-gray-900">
                  ₹{displayPrice.toFixed(2)}
                </span>

                {discount > 0 && (
                  <>
                    <span className="text-xl text-gray-400 line-through">
                      ₹{basePrice.toFixed(2)}
                    </span>
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                      {discount}% OFF
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* ✅ Variant Attributes (Pattern Style / Weave Type) */}
            {hasVariants && selectedVariantAttributes.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="space-y-2">
                  {selectedVariantAttributes?.map((attr) => (
                    <div
                      key={attr.key}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-gray-600">{attr.key}</span>
                      <span className="font-medium text-gray-900">
                        {attr?.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Variants */}
            {hasVariants && (
              <div className="space-y-4">
                {/* Size Selection */}
                {product.variants?.some((v) => v.size) && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Select Size
                    </h3>

                    <div className="flex gap-2 flex-wrap">
                      {Array.from(
                        new Set(
                          product.variants.map((v) => v.size).filter(Boolean)
                        )
                      ).map((size) => {
                        const variant = product.variants!.find(
                          (v) => v.size === size
                        );
                        const isSelected = selectedVariant?.size === size;

                        return (
                          <motion.button
                            key={String(size)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() =>
                              variant && setSelectedVariant(variant)
                            }
                            className={`px-4 py-2 border-2 rounded-lg font-medium transition ${
                              isSelected
                                ? "border-yellow-500 bg-yellow-50 text-yellow-700"
                                : "border-gray-300 hover:border-gray-400"
                            }`}
                          >
                            {size}
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Stock Status */}
            <div>
              {availableStock > 0 ? (
                <p className="text-green-600 font-medium">
                  ✓ In Stock ({availableStock} available)
                </p>
              ) : (
                <p className="text-red-600 font-medium">✗ Out of Stock</p>
              )}
            </div>

            {/* Delivery Check */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-5 h-5 text-gray-700" />
                <h3 className="font-semibold text-gray-900">
                  Check Delivery Availability
                </h3>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter Pincode"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  maxLength={6}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") checkDeliveryAvailability(pincode);
                  }}
                />
                <button
                  onClick={handleCheckDelivery}
                  disabled={isCheckingDelivery}
                  className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 font-medium"
                >
                  {isCheckingDelivery ? "..." : "Check"}
                </button>
              </div>

              {deliveryInfo && deliveryInfo.checked && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mt-3 p-3 rounded-lg flex items-start gap-3 ${
                    deliveryInfo.isServiceable
                      ? "bg-green-50 border border-green-200"
                      : "bg-red-50 border border-red-200"
                  }`}
                >
                  {deliveryInfo.isServiceable ? (
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <X className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p
                      className={`font-medium ${
                        deliveryInfo.isServiceable
                          ? "text-green-900"
                          : "text-red-900"
                      }`}
                    >
                      {deliveryInfo.isServiceable
                        ? "Delivery Available"
                        : "Not Serviceable"}
                    </p>
                    {deliveryInfo.isServiceable && (
                      <p className="text-sm text-green-700 mt-1">
                        Expected delivery in {deliveryInfo.estimatedDays}
                      </p>
                    )}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Quantity Selector */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Quantity</h3>
              <div className="flex items-center gap-4">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center font-bold"
                >
                  -
                </motion.button>
                <span className="text-xl font-semibold w-12 text-center">
                  {quantity}
                </span>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() =>
                    setQuantity(Math.min(availableStock, quantity + 1))
                  }
                  className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center font-bold"
                >
                  +
                </motion.button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddToCart}
                disabled={availableStock === 0 || loading}
                className="flex-1 bg-black text-white py-4 rounded-full font-semibold shadow-lg hover:shadow-xl transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart className="w-5 h-5" />
                {loading ? "Adding..." : "Add to Cart"}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleWishlist}
                className="p-4 border-2 border-gray-300 rounded-full hover:border-red-500 transition"
              >
                <Heart
                  className={`w-6 h-6 ${
                    isWishlisted ? "fill-red-500 text-red-500" : "text-gray-600"
                  }`}
                />
              </motion.button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200">
              <div className="text-center">
                <Truck className="w-6 h-6 mx-auto mb-2 text-gray-700" />
                <p className="text-xs text-gray-600">Free Shipping</p>
              </div>
              <div className="text-center">
                <RotateCcw className="w-6 h-6 mx-auto mb-2 text-gray-700" />
                <p className="text-xs text-gray-600">7 Days Return</p>
              </div>
              <div className="text-center">
                <Shield className="w-6 h-6 mx-auto mb-2 text-gray-700" />
                <p className="text-xs text-gray-600">Secure Payment</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Tabs Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-12"
        >
          <div className="flex gap-6 border-b border-gray-200 mb-6">
            {(["details", "specs"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 font-semibold transition relative capitalize ${
                  activeTab === tab ? "text-black" : "text-gray-500"
                }`}
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
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <p className="text-gray-700 leading-relaxed">
                  {product.description}
                </p>
              </motion.div>
            )}

            {activeTab === "specs" && (
              <motion.div
                key="specs"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                {product.specifications && product.specifications.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-4">
                    {product.specifications.map((spec) => (
                      <div
                        key={spec.id}
                        className="flex justify-between py-2 border-b"
                      >
                        <span className="font-medium text-gray-700">
                          {spec.key}
                        </span>
                        <span className="text-gray-600">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No specifications available</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              You May Also Like
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {relatedProducts.map((relatedProduct, idx) => (
                <Link
                  key={relatedProduct.id}
                  href={`/products/${relatedProduct.slug}`}
                >
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0 + idx * 0.1 }}
                    whileHover={{ y: -8 }}
                    className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition cursor-pointer"
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
                    <div className="p-4">
                      <h4 className="font-semibold text-sm mb-2 line-clamp-2">
                        {relatedProduct.name}
                      </h4>
                      <p className="font-bold">
                        ₹{Number(relatedProduct.sellingPrice).toFixed(2)}
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
  );
}
