"use client";

import { Product } from "@/lib/api/home-section.api";
import { useState, useEffect } from "react";
import { Heart, ShoppingCart } from "lucide-react";
import { useAuthModal } from "@/store/useAuthModalStore";
import { useCartStore } from "@/store/useCartStore";
import { cartApi } from "@/lib/api/cart.api";
import { wishlistApi } from "@/lib/api/wishlist.api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import WishlistButton from "../ui/WishlistButton";

function ProductCarousel({
  title,
  subtitle,
  products,
  backgroundColor = "#000000",
  textColor = "#ffffff",
  showTitle = true,
  showSubtitle = true,
}: {
  title: string;
  subtitle?: string;
  products: Product[];
  backgroundColor?: string;
  textColor?: string;
  showTitle?: boolean;
  showSubtitle?: boolean;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [wishlistedProducts, setWishlistedProducts] = useState<Set<string>>(
    new Set(),
  );
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const { user, openModal } = useAuthModal();
  const { addItem: addToLocalCart } = useCartStore();
  const router = useRouter();

  if (!products || products.length === 0) return null;

  const showNavigation = products.length > 1;
  const currentProduct = products[currentIndex];
  const firstImage = currentProduct.media?.[0]?.url;
  const inStock = currentProduct.stock?.some((s) => s.quantity > 0);
  const availableStock = currentProduct.stock?.[0]?.quantity ?? 0;
  const discount =
    currentProduct.basePrice !== currentProduct.sellingPrice
      ? Math.round(
          ((currentProduct.basePrice - currentProduct.sellingPrice) /
            currentProduct.basePrice) *
            100,
        )
      : 0;
  const isWishlisted = wishlistedProducts.has(currentProduct.id);

  const handlePrev = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : products.length - 1));
    setTimeout(() => setIsAnimating(false), 500);
  };

  const handleNext = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev < products.length - 1 ? prev + 1 : 0));
    setTimeout(() => setIsAnimating(false), 500);
  };

  const handleAddToCart = async () => {
    if (!inStock || availableStock === 0) {
      toast.error("Product is out of stock");
      return;
    }

    setLoadingAction("cart");

    try {
      const cartItem = {
        id: crypto.randomUUID(),
        cartId: "local",
        productId: currentProduct.id,
        variantId: null,
        quantity: 1,
        product: {
          id: currentProduct.id,
          name: currentProduct.name,
          slug: currentProduct.slug,
          categoryId: currentProduct.category.id,
          sellingPrice: Number(currentProduct.sellingPrice),
          basePrice: Number(currentProduct.basePrice),
          media: [
            {
              url: currentProduct.media?.[0]?.url ?? "/placeholder.jpg",
              altText: currentProduct.name,
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

      // Add to local cart
      addToLocalCart(cartItem);
      toast.success("Added to cart");

      // Sync with server if logged in
      if (user) {
        try {
          await cartApi.addToCart({
            productId: currentProduct.id,
            quantity: 1,
          });
        } catch (error) {
          console.error("Failed to sync with server:", error);
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to add to cart");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleToggleWishlist = async () => {
    if (!user) {
      openModal("login");
      toast.info("Please login to add to wishlist");
      return;
    }

    setLoadingAction("wishlist");

    try {
      if (isWishlisted) {
        // Remove from wishlist
        const wishlist = await wishlistApi.getWishlist();
        const item = wishlist.data.items?.find(
          (i: any) => i.productId === currentProduct.id,
        );

        if (item) {
          await wishlistApi.removeFromWishlist(item.id);
          setWishlistedProducts((prev) => {
            const newSet = new Set(prev);
            newSet.delete(currentProduct.id);
            return newSet;
          });
          toast.success("Removed from wishlist");
        }
      } else {
        // Add to wishlist
        await wishlistApi.addToWishlist({ productId: currentProduct.id });
        setWishlistedProducts((prev) => new Set(prev).add(currentProduct.id));
        toast.success("Added to wishlist");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update wishlist");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleViewDetails = () => {
    router.push(`/products/${currentProduct.slug}`);
  };

  // Auto-advance carousel
  useEffect(() => {
    if (!showNavigation) return;

    const interval = setInterval(() => {
      handleNext();
    }, 6000);

    return () => clearInterval(interval);
  }, [currentIndex, showNavigation]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <section
      className="py-12 md:py-20 lg:py-24 relative overflow-hidden"
      style={{ backgroundColor }}
    >
      {/* Animated background gradients */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 bg-gradient-to-br from-gray-900/50 via-black to-gray-900/50 animate-pulse"
          style={{ animationDuration: "8s" }}
        />
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-float" />
        <div
          className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "2s" }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 md:px-8">
        {(showTitle || showSubtitle) && (
          <div className="text-center mb-10 md:mb-16 animate-fadeIn">
            {showTitle && (
              <h2
                className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 tracking-tight"
                style={{ color: textColor }}
              >
                {title}
              </h2>
            )}
            {showSubtitle && subtitle && (
              <p
                className="text-base md:text-xl opacity-80 max-w-3xl mx-auto leading-relaxed"
                style={{ color: textColor }}
              >
                {subtitle}
              </p>
            )}
          </div>
        )}

        <div className="relative">
          <div className="overflow-hidden rounded-3xl">
            <div
              className="flex transition-all duration-500 ease-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {products.map((product) => {
                const productImage = product.media?.[0]?.url;
                const productInStock = product.stock?.some(
                  (s) => s.quantity > 0,
                );
                const productDiscount =
                  product.basePrice !== product.sellingPrice
                    ? Math.round(
                        ((product.basePrice - product.sellingPrice) /
                          product.basePrice) *
                          100,
                      )
                    : 0;

                return (
                  <div
                    key={product.id}
                    className="w-full flex-shrink-0 px-0 md:px-4"
                  >
                    <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center min-h-[500px] md:min-h-[600px]">
                      {/* Product Image */}
                      <div className="relative aspect-[4/5] md:aspect-[3/4] rounded-3xl overflow-hidden group shadow-2xl">
                        {productImage ? (
                          <img
                            src={productImage}
                            alt={product.name}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                            <span className="text-6xl md:text-8xl font-light text-gray-600">
                              {product.name[0]}
                            </span>
                          </div>
                        )}

                        {/* Overlay gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                        {/* Badges */}
                        <div className="absolute top-4 right-4 flex flex-col gap-2">
                          {!productInStock && (
                            <div className="bg-red-500 text-white px-4 py-2 rounded-full text-xs md:text-sm font-bold shadow-lg backdrop-blur-sm">
                              Out of Stock
                            </div>
                          )}
                          {productDiscount > 0 && (
                            <div className="bg-green-500 text-white px-4 py-2 rounded-full text-xs md:text-sm font-bold shadow-lg backdrop-blur-sm animate-pulse">
                              {productDiscount}% OFF
                            </div>
                          )}
                        </div>

                        {/* Quick view button */}
                        <div className="absolute bottom-4 left-4 right-4 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                          <a
                            href={`/products/${product.slug}`}
                            className="block w-full bg-white/95 backdrop-blur-sm text-black py-3 rounded-full font-medium text-center hover:bg-white transition-all duration-300 shadow-lg"
                          >
                            Quick View
                          </a>
                        </div>
                      </div>

                      {/* Product Details */}
                      <div
                        className="space-y-4 md:space-y-6 px-4 md:px-0"
                        style={{ color: textColor }}
                      >
                        <div className="space-y-2">
                          <div className="text-xs md:text-sm opacity-60 uppercase tracking-widest font-semibold">
                            {product.category.name}
                          </div>
                          <h3 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight tracking-tight">
                            {product.name}
                          </h3>
                        </div>

                        {product.description && (
                          <p className="text-base md:text-lg leading-relaxed opacity-80 max-w-xl">
                            {product.description}
                          </p>
                        )}

                        <div className="flex items-baseline gap-3 py-2">
                          <span className="text-3xl md:text-4xl lg:text-5xl font-bold">
                            ₹{product.sellingPrice.toLocaleString()}
                          </span>
                          {product.basePrice !== product.sellingPrice && (
                            <span className="text-lg md:text-xl opacity-50 line-through">
                              ₹{product.basePrice.toLocaleString()}
                            </span>
                          )}
                        </div>

                        {/* Stock indicator */}
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              productInStock ? "bg-green-500" : "bg-red-500"
                            }`}
                          />
                          <span className="text-sm opacity-70">
                            {productInStock ? "In Stock" : "Out of Stock"}
                          </span>
                        </div>

                        {/* CTA Buttons - Only show for current product */}
                        {product.id === currentProduct.id && (
                          <div className="flex flex-wrap gap-4 pt-4">
                            <button
                              onClick={handleViewDetails}
                              className="inline-flex items-center gap-2 bg-white text-black px-8 py-4 rounded-full font-semibold hover:bg-gray-100 transition-all duration-300 hover:gap-4 shadow-lg group"
                            >
                              <span>View Details</span>
                              <svg
                                className="w-5 h-5 transition-transform group-hover:translate-x-1"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 5l7 7-7 7"
                                />
                              </svg>
                            </button>

                            {productInStock && (
                              <button
                                onClick={handleAddToCart}
                                disabled={loadingAction === "cart"}
                                className="inline-flex items-center gap-2 border-2 border-white/30 text-white px-8 py-4 rounded-full font-semibold hover:bg-white/10 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <ShoppingCart className="w-5 h-5" />
                                {loadingAction === "cart"
                                  ? "Adding..."
                                  : "Add to Cart"}
                              </button>
                            )}

                            <WishlistButton
                              productId={product.id}
                              variant="icon"
                              size="md"
                              className="bg-white hover:bg-gray-100 shadow-lg"
                            />
                            {/* <button
                              onClick={handleToggleWishlist}
                              disabled={loadingAction === "wishlist"}
                              className="inline-flex items-center justify-center w-14 h-14 border-2 border-white/30 rounded-full hover:bg-white/10 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Heart
                                className={`w-6 h-6 ${
                                  isWishlisted
                                    ? "fill-red-500 text-red-500"
                                    : "text-white"
                                }`}
                              />
                            </button> */}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Navigation - only show if multiple products */}
          {showNavigation && (
            <>
              <button
                onClick={handlePrev}
                disabled={isAnimating}
                className="absolute left-0 md:left-4 top-1/2 -translate-y-1/2 w-12 h-12 md:w-14 md:h-14 bg-white/95 backdrop-blur-xl rounded-full shadow-2xl flex items-center justify-center hover:bg-white hover:scale-110 transition-all duration-300 z-10 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Previous product"
              >
                <svg
                  className="w-6 h-6 text-black"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>

              <button
                onClick={handleNext}
                disabled={isAnimating}
                className="absolute right-0 md:right-4 top-1/2 -translate-y-1/2 w-12 h-12 md:w-14 md:h-14 bg-white/95 backdrop-blur-xl rounded-full shadow-2xl flex items-center justify-center hover:bg-white hover:scale-110 transition-all duration-300 z-10 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Next product"
              >
                <svg
                  className="w-6 h-6 text-black"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>

              {/* Pagination dots */}
              <div className="flex justify-center gap-2 mt-8">
                {products.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      if (!isAnimating) {
                        setIsAnimating(true);
                        setCurrentIndex(index);
                        setTimeout(() => setIsAnimating(false), 500);
                      }
                    }}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      index === currentIndex
                        ? "w-8 bg-white"
                        : "w-2 bg-white/30 hover:bg-white/50"
                    }`}
                    aria-label={`Go to product ${index + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

export default ProductCarousel;
