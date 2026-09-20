"use client";

import { HomeSection } from "@/lib/api/home-section.api";
import { useState } from "react";
import { Heart, ShoppingCart } from "lucide-react";
import { useAuthModal } from "@/store/useAuthModalStore";
import { useCartStore } from "@/store/useCartStore";
import { useCartDrawer } from "@/store/useCartDrawer";
import { cartApi } from "@/lib/api/cart.api";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import WishlistButton from "@/components/ui/WishlistButton";

function ProductGrid({ section }: { section: HomeSection }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);
  const [loadingProduct, setLoadingProduct] = useState<string | null>(null);

  const { user, openModal } = useAuthModal();
  const { addItem: addToLocalCart } = useCartStore();
  const { open: openCartDrawer } = useCartDrawer();
  const queryClient = useQueryClient();

  if (!section.products || section.products.length === 0) return null;

  const products = section.products;
  const itemsPerView = section.columns || 4;
  const showNavigation = products.length > itemsPerView;
  const totalSlides = Math.ceil(products.length / itemsPerView);

  const canGoNext = currentIndex < totalSlides - 1;
  const canGoPrev = currentIndex > 0;

  const handleNext = () => {
    if (canGoNext) setCurrentIndex((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (canGoPrev) setCurrentIndex((prev) => prev - 1);
  };

  const getGridColumns = () => {
    const cols = section.columns || 3;

    const colMap: Record<number, string> = {
      1: "grid-cols-1",
      2: "grid-cols-2",
      3: "grid-cols-2 md:grid-cols-3",
      4: "grid-cols-2 md:grid-cols-3 lg:grid-cols-3", // 👈 force clean layout
    };

    return colMap[cols] || "grid-cols-2 md:grid-cols-3";
  };

  const handleAddToCart = async (e: React.MouseEvent, product: any) => {
    e.preventDefault();
    e.stopPropagation();

    const availableStock = product.stock?.[0]?.quantity ?? 0;
    if (availableStock === 0) {
      toast.error("Product is out of stock");
      return;
    }

    setLoadingProduct(product.id);

    try {
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
          stock: [{ quantity: availableStock }],
        },
        variant: null,
      };

      addToLocalCart(cartItem);

      if (user) {
        await cartApi.addToCart({ productId: product.id, quantity: 1 });
        await queryClient.invalidateQueries({ queryKey: ["cartApi"] });
      }

      toast.success("Added to cart");
      openCartDrawer();
    } catch (error: any) {
      toast.error(error.message || "Failed to add to cart");
    } finally {
      setLoadingProduct(null);
    }
  };

  const visibleProducts = showNavigation
    ? products.slice(
        currentIndex * itemsPerView,
        (currentIndex + 1) * itemsPerView,
      )
    : products;

  return (
    <section
      className="relative pb-6 pt-4 md:pt-0 overflow-hidden"
      style={{ backgroundColor: section.backgroundColor }}
    >
      <div className="relative max-w-7xl mx-auto px-4 md:px-8">
        {(section.showTitle || section.showSubtitle) && (
          <div className="text-center mb-4 md:mb-10 animate-fadeIn">
            {section.showTitle && (
              <h2
                className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 tracking-tight"
                style={{ color: section.textColor }}
              >
                {section.title}
              </h2>
            )}
            {section.showSubtitle && section.subtitle && (
              <p
                className="text-base md:text-xl opacity-80 max-w-3xl mx-auto leading-relaxed"
                style={{ color: section.textColor }}
              >
                {section.subtitle}
              </p>
            )}
          </div>
        )}

        <div className="relative">
          {/* Navigation buttons */}
          {showNavigation && (
            <>
              <button
                onClick={handlePrev}
                disabled={!canGoPrev}
                className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-20 w-12 h-12 rounded-full backdrop-blur-xl shadow-lg flex items-center justify-center transition-all duration-300 ${
                  canGoPrev
                    ? "bg-white/90 hover:bg-white hover:scale-110 cursor-pointer"
                    : "bg-white/30 cursor-not-allowed opacity-50"
                }`}
                aria-label="Previous products"
              >
                <svg
                  className="w-6 h-6"
                  style={{ color: section.textColor }}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>

              <button
                onClick={handleNext}
                disabled={!canGoNext}
                className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-20 w-12 h-12 rounded-full backdrop-blur-xl shadow-lg flex items-center justify-center transition-all duration-300 ${
                  canGoNext
                    ? "bg-white/90 hover:bg-white hover:scale-110 cursor-pointer"
                    : "bg-white/30 cursor-not-allowed opacity-50"
                }`}
                aria-label="Next products"
              >
                <svg
                  className="w-6 h-6"
                  style={{ color: section.textColor }}
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
            </>
          )}

          {/* Products grid */}
          <div
            className={`grid ${getGridColumns()} gap-1 md:gap-12 transition-all duration-500`}
          >
            {visibleProducts.map((product, index) => {
              const productImage = product.media?.[0]?.url;
              const inStock = product.stock?.some((s) => s.quantity > 0);
              const discount =
                product.basePrice !== product.sellingPrice
                  ? Math.round(
                      ((product.basePrice - product.sellingPrice) /
                        product.basePrice) *
                        100,
                    )
                  : 0;
              const isLoading = loadingProduct === product.id;

              return (
                <a
                  key={product.id}
                  href={`/products/${product.slug}`}
                  className="group block"
                  onMouseEnter={() => setHoveredProduct(product.id)}
                  onMouseLeave={() => setHoveredProduct(null)}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Image Container */}
                  <div className="relative aspect-[2/3] md:aspect-[2/3] max-h-none md:max-h-[480px] overflow-hidden bg-transparent">
                    {productImage ? (
                      <img
                        src={productImage}
                        alt={product.name}
                        className="absolute top-0 left-0 w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-110"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-100">
                        <span className="text-6xl font-light text-gray-400">
                          {product.name[0]}
                        </span>
                      </div>
                    )}

                    {/* Badges */}
                    <div className="absolute top-0 left-0 flex flex-col gap-2">
                      {!inStock && (
                        <span className="bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                          Sold Out
                        </span>
                      )}
                      {discount > 0 && (
                        <div className="px-2.5 py-1 bg-main-primary/90 backdrop-blur-md">
                          <span className="text-[11px] font-medium text-main-secondary">
                            {discount}% OFF
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Quick action buttons */}
                    {/* <div className="absolute bottom-3 left-3 right-3 flex gap-2 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
            <button
              onClick={(e) => handleAddToCart(e, product)}
              disabled={!inStock || isLoading}
              className="flex-1 bg-white text-black py-2.5 rounded-full text-sm font-semibold hover:bg-gray-100 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-4 h-4" />
              {isLoading ? "Adding..." : "Quick Add"}
            </button>

            <WishlistButton
              productId={product.id}
              variant="icon"
              size="md"
              className="bg-white hover:bg-gray-100 shadow-lg"
            />
          </div> */}
                  </div>

                  {/* Product Info */}
                  <div className="pt-3" style={{ color: section.textColor }}>
                    {/* <div className="text-xs opacity-60 uppercase tracking-wider mb-1 font-medium">
            {product.category.name}
          </div> */}
                    <h3 className="font-medium text-sm md:text-base tracking-tight mb-2 line-clamp-2 group-hover:opacity-80 transition-opacity">
                      {product.name}
                    </h3>

                    {/* Price */}
                    <div className="flex items-baseline gap-2">
                      <span className="text-base md:text-lg font-semibold tracking-tight">
                        ₹{product.sellingPrice.toLocaleString()}
                      </span>
                      {product.basePrice !== product.sellingPrice && (
                        <span className="text-xs md:text-sm text-gray-400 line-through">
                          ₹{product.basePrice.toLocaleString()}
                        </span>
                      )}
                    </div>

                    {/* Stock indicator */}
                    {/* <div className="flex items-center gap-1.5 mt-2">
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${
                          inStock ? "bg-green-500" : "bg-red-500"
                        }`}
                      />
                      <span className="text-xs opacity-60">
                        {inStock ? "In Stock" : "Out of Stock"}
                      </span>
                    </div> */}
                  </div>
                </a>
              );
            })}
          </div>

          {/* Pagination dots */}
          {showNavigation && totalSlides > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: totalSlides }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? "w-8 opacity-100"
                      : "w-2 opacity-40 hover:opacity-70"
                  }`}
                  style={{ backgroundColor: section.textColor }}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default ProductGrid;
