"use client";

import { HomeSection } from "@/lib/api/home-section.api";
import { useState } from "react";

function ProductGrid({ section }: { section: HomeSection }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);

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
    const cols = section.columns || 4;
    const colMap: Record<number, string> = {
      1: "grid-cols-1",
      2: "grid-cols-1 md:grid-cols-2",
      3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
      4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
    };
    return colMap[cols] || "grid-cols-1 md:grid-cols-4";
  };

  const visibleProducts = showNavigation
    ? products.slice(
        currentIndex * itemsPerView,
        (currentIndex + 1) * itemsPerView
      )
    : products;

  return (
    <section
      className="py-12 md:py-20 lg:py-24 relative overflow-hidden"
      style={{ backgroundColor: section.backgroundColor }}
    >
      {/* Background decorations */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute top-20 left-10 w-64 h-64 rounded-full blur-3xl"
          style={{ backgroundColor: section.textColor }}
        />
        <div
          className="absolute bottom-20 right-10 w-96 h-96 rounded-full blur-3xl"
          style={{ backgroundColor: section.textColor }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 md:px-8">
        {(section.showTitle || section.showSubtitle) && (
          <div className="text-center mb-10 md:mb-16 animate-fadeIn">
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
          {/* Navigation buttons - only if more products than columns */}
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
            className={`grid ${getGridColumns()} gap-6 transition-all duration-500`}
          >
            {visibleProducts.map((product, index) => {
              const productImage = product.media?.[0]?.url;
              const inStock = product.stock?.some((s) => s.quantity > 0);
              const discount =
                product.basePrice !== product.sellingPrice
                  ? Math.round(
                      ((product.basePrice - product.sellingPrice) /
                        product.basePrice) *
                        100
                    )
                  : 0;

              return (
                <a
                  key={product.id}
                  href={`/products/${product.slug}`}
                  className="group block"
                  onMouseEnter={() => setHoveredProduct(product.id)}
                  onMouseLeave={() => setHoveredProduct(null)}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Product Card */}
                  <div className="bg-white/5 backdrop-blur-sm rounded-2xl overflow-hidden transition-all duration-500 hover:shadow-2xl hover:scale-[1.02]">
                    {/* Image Container */}
                    <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
                      {productImage ? (
                        <img
                          src={productImage}
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-100">
                          <span className="text-6xl font-light text-gray-400">
                            {product.name[0]}
                          </span>
                        </div>
                      )}

                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                      {/* Badges */}
                      <div className="absolute top-3 right-3 flex flex-col gap-2">
                        {!inStock && (
                          <span className="bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                            Sold Out
                          </span>
                        )}
                        {discount > 0 && (
                          <span className="bg-green-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg animate-pulse">
                            -{discount}%
                          </span>
                        )}
                      </div>

                      {/* Quick action buttons */}
                      <div className="absolute bottom-3 left-3 right-3 flex gap-2 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            // Add to cart logic
                          }}
                          className="flex-1 bg-white text-black py-2.5 rounded-full text-sm font-semibold hover:bg-gray-100 transition-all duration-300 shadow-lg"
                        >
                          Quick Add
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            // Add to wishlist logic
                          }}
                          className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-all duration-300 shadow-lg"
                        >
                          <svg
                            className="w-5 h-5 text-black"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="p-4" style={{ color: section.textColor }}>
                      <div className="text-xs opacity-60 uppercase tracking-wider mb-1 font-medium">
                        {product.category.name}
                      </div>
                      <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:opacity-80 transition-opacity">
                        {product.name}
                      </h3>

                      {/* Price */}
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-bold">
                          ₹{product.sellingPrice.toLocaleString()}
                        </span>
                        {product.basePrice !== product.sellingPrice && (
                          <span className="text-sm opacity-50 line-through">
                            ₹{product.basePrice.toLocaleString()}
                          </span>
                        )}
                      </div>

                      {/* Stock indicator */}
                      <div className="flex items-center gap-1.5 mt-2">
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${
                            inStock ? "bg-green-500" : "bg-red-500"
                          }`}
                        />
                        <span className="text-xs opacity-60">
                          {inStock ? "In Stock" : "Out of Stock"}
                        </span>
                      </div>
                    </div>
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
