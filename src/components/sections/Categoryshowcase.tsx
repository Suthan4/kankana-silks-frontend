"use client";

import { Category } from "@/lib/api/home-section.api.service";
import { useState, useRef } from "react";

function CategoryShowcase({
  title,
  subtitle,
  categories,
  backgroundColor = "#ffffff",
  textColor = "#000000",
  showTitle = true,
  showSubtitle = true,
  columns = 3,
}: {
  title: string;
  subtitle?: string;
  categories: Category[];
  backgroundColor?: string;
  textColor?: string;
  showTitle?: boolean;
  showSubtitle?: boolean;
  columns?: number;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!categories || categories.length === 0) return null;

  const itemsPerView = columns;
  const showNavigation = categories.length > itemsPerView;
  const totalSlides = Math.ceil(categories.length / itemsPerView);

  const canGoNext = currentIndex < totalSlides - 1;
  const canGoPrev = currentIndex > 0;

  const handleNext = () => {
    if (canGoNext) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (canGoPrev) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const getGridColumns = () => {
    const colMap: Record<number, string> = {
      1: "grid-cols-1",
      2: "grid-cols-1 md:grid-cols-2",
      3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
      4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
    };
    return colMap[columns] || "grid-cols-1 md:grid-cols-3";
  };

  const visibleCategories = showNavigation
    ? categories.slice(
        currentIndex * itemsPerView,
        (currentIndex + 1) * itemsPerView
      )
    : categories;

  return (
    <section
      className="py-12 md:py-20 lg:py-24 relative overflow-hidden"
      style={{ backgroundColor }}
    >
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute top-20 right-20 w-72 h-72 rounded-full blur-3xl"
          style={{ backgroundColor: textColor }}
        />
        <div
          className="absolute bottom-20 left-20 w-96 h-96 rounded-full blur-3xl"
          style={{ backgroundColor: textColor }}
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
          {/* Navigation buttons - only show if more categories than columns */}
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
                aria-label="Previous categories"
              >
                <svg
                  className="w-6 h-6"
                  style={{ color: textColor }}
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
                aria-label="Next categories"
              >
                <svg
                  className="w-6 h-6"
                  style={{ color: textColor }}
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

          {/* Categories grid */}
          <div
            className={`grid ${getGridColumns()} gap-4 md:gap-6 transition-all duration-500`}
          >
            {visibleCategories.map((category, index) => (
              <a
                key={category.id}
                href={`/category/${category.slug}`}
                className="group relative overflow-hidden rounded-2xl aspect-[3/4] transform transition-all duration-500 hover:scale-[1.03] hover:shadow-2xl"
                style={{ animationDelay: `${index * 0.1}s` }}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {category.image ? (
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-100">
                    <span className="text-6xl md:text-8xl font-light text-gray-400">
                      {category.name[0]}
                    </span>
                  </div>
                )}

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                {/* Content */}
                <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8">
                  <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2 tracking-tight transform transition-transform duration-300 group-hover:translate-y-[-4px] drop-shadow-lg">
                    {category.name}
                  </h3>

                  {category.description && (
                    <p className="text-white/90 text-sm md:text-base leading-relaxed mb-4 transform transition-all duration-300 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 line-clamp-2">
                      {category.description}
                    </p>
                  )}

                  <div className="flex items-center text-white font-semibold transform transition-all duration-300 translate-x-0 group-hover:translate-x-2">
                    <span className="text-sm md:text-base">
                      Explore Collection
                    </span>
                    <svg
                      className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1"
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
                  </div>
                </div>

                {/* Hover effect overlay */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                </div>

                {/* Border glow on hover */}
                <div className="absolute inset-0 rounded-2xl border-2 border-white/0 group-hover:border-white/20 transition-all duration-300" />
              </a>
            ))}
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
                  style={{ backgroundColor: textColor }}
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

export default CategoryShowcase;
