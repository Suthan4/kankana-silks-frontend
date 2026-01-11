"use client";

import { HomeSection } from "@/lib/api/home-section.api.service";
import { useState, useRef, useEffect } from "react";

function MediaGridSection({ section }: { section: HomeSection }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState<number | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  if (!section.media || section.media.length === 0) return null;

  const itemsPerView = section.columns || 4;
  const showNavigation = section.media.length > itemsPerView;
  const totalSlides = Math.ceil(section.media.length / itemsPerView);

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
    const cols = section.columns || 4;
    const colMap: Record<number, string> = {
      1: "grid-cols-1",
      2: "grid-cols-1 md:grid-cols-2",
      3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
      4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
    };
    return colMap[cols] || "grid-cols-1 md:grid-cols-2 lg:grid-cols-4";
  };

  // Auto-play for carousel if more than itemsPerView
  useEffect(() => {
    if (!showNavigation) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % totalSlides);
    }, 5000);

    return () => clearInterval(interval);
  }, [showNavigation, totalSlides]);

  const renderMediaItem = (media: (typeof section.media)[0], index: number) => {
    const hasOverlay = media.overlayTitle || media.overlaySubtitle;
    const positionClass =
      media.overlayPosition === "bottom" ? "justify-end" : "justify-center";

    return (
      <div
        key={media.id}
        className="group relative overflow-hidden rounded-2xl aspect-[4/3] transform transition-all duration-500 hover:scale-[1.03] hover:shadow-2xl cursor-pointer"
        style={{ animationDelay: `${index * 0.1}s` }}
        onMouseEnter={() => setIsHovered(index)}
        onMouseLeave={() => setIsHovered(null)}
      >
        {media.type === "IMAGE" ? (
          <img
            src={media.url}
            alt={media.altText || media.title || "Media"}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
          />
        ) : (
          <video
            src={media.url}
            poster={media.thumbnailUrl || undefined}
            className="w-full h-full object-cover"
            loop
            muted
            playsInline
            autoPlay={isHovered === index}
          />
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />

        {hasOverlay && (
          <div
            className={`absolute inset-0 flex flex-col ${positionClass} p-6 md:p-8 text-white z-10`}
          >
            {media.overlayTitle && (
              <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2 transform transition-all duration-300 group-hover:translate-y-[-4px] drop-shadow-lg">
                {media.overlayTitle}
              </h3>
            )}
            {media.overlaySubtitle && (
              <p className="text-base md:text-lg text-white/90 mb-4 transform transition-all duration-300 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0">
                {media.overlaySubtitle}
              </p>
            )}

            {section.ctaButtons && section.ctaButtons.length > 0 && (
              <div className="flex flex-wrap gap-3 transform transition-all duration-300 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0">
                {section.ctaButtons.map((btn) => (
                  <a
                    key={btn.id}
                    href={btn.url}
                    target={btn.openNewTab ? "_blank" : "_self"}
                    rel={btn.openNewTab ? "noopener noreferrer" : ""}
                    className={`
                      px-5 py-2.5 rounded-full font-medium text-sm transition-all duration-300 inline-flex items-center gap-2 backdrop-blur-sm
                      ${
                        btn.style === "PRIMARY"
                          ? "bg-white text-gray-900 hover:bg-gray-100 shadow-lg"
                          : btn.style === "SECONDARY"
                          ? "bg-gray-900 text-white hover:bg-gray-800 shadow-lg"
                          : "border-2 border-white text-white hover:bg-white hover:text-gray-900"
                      }
                    `}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {btn.text}
                    {btn.icon && <span>{btn.icon}</span>}
                  </a>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Shine effect on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
        </div>
      </div>
    );
  };

  const visibleMedia = showNavigation
    ? section.media.slice(
        currentIndex * itemsPerView,
        (currentIndex + 1) * itemsPerView
      )
    : section.media;

  return (
    <section
      className="py-12 md:py-20 lg:py-24 relative overflow-hidden"
      style={{ backgroundColor: section.backgroundColor }}
    >
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute top-10 left-10 w-64 h-64 bg-current rounded-full blur-3xl"
          style={{ color: section.textColor }}
        />
        <div
          className="absolute bottom-10 right-10 w-96 h-96 bg-current rounded-full blur-3xl"
          style={{ color: section.textColor }}
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
          {/* Navigation buttons - only show if more items than columns */}
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
                aria-label="Previous slide"
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
                aria-label="Next slide"
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

          {/* Media grid */}
          <div
            ref={scrollContainerRef}
            className={`grid ${getGridColumns()} gap-4 md:gap-6 transition-all duration-500`}
          >
            {visibleMedia.map((media, index) => renderMediaItem(media, index))}
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

export default MediaGridSection;
