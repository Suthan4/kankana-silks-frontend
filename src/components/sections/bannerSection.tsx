"use client";

import { HomeSection, Product, SectionMedia } from "@/lib/api/home-section.api";
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect, useCallback } from "react";

interface BannerSlide {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  mediaType: "IMAGE" | "VIDEO";
  link?: string;
  badge?: string;
  buttonText?: string;
}

function stripHtml(html: string): string {
  if (!html) return "";
  return html.replace(/<[^>]*>?/gm, "").trim();
}

function extractSlides(section: HomeSection): BannerSlide[] {
  const slides: BannerSlide[] = [];

  // 1. If products are attached to the banner section
  if (section.products && section.products.length > 0) {
    section.products.forEach((product: Product) => {
      const primaryMedia = product.media?.[0];
      const imageUrl = primaryMedia?.url || "";
      if (!imageUrl) return;

      let badge: string | undefined;
      const basePrice = Number(product.basePrice);
      const sellingPrice = Number(product.sellingPrice);
      if (basePrice > 0 && sellingPrice > 0 && basePrice > sellingPrice) {
        const discount = Math.round(
          ((basePrice - sellingPrice) / basePrice) * 100,
        );
        if (discount > 0) {
          badge = `${discount}% OFF`;
        }
      }

      slides.push({
        id: product.id,
        title: product.name,
        subtitle: product.description
          ? stripHtml(product.description)
          : undefined,
        imageUrl,
        mediaType: primaryMedia?.type || "IMAGE",
        link: `/products/${product.slug}`,
        badge,
        buttonText: "Shop Now",
      });
    });
  }

  // 2. If media items are attached to the banner section
  if (section.media && section.media.length > 0) {
    section.media.forEach((media: SectionMedia) => {
      if (!media.url) return;

      slides.push({
        id: media.id,
        title:
          media.overlayTitle ||
          media.title ||
          section.title ||
          "Promotional Banner",
        subtitle: media.overlaySubtitle || section.subtitle || undefined,
        imageUrl: media.url,
        mediaType: media.type,
        link: section.ctaButtons?.[0]?.url || undefined,
        buttonText: section.ctaButtons?.[0]?.text || "Explore Collection",
      });
    });
  }

  return slides;
}

export default function BannerSection({ section }: { section: HomeSection }) {
  const slides = extractSlides(section);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timerKey, setTimerKey] = useState(0);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  const isMultiple = slides.length > 1;

  // Reset timer on user interaction
  const resetTimer = useCallback(() => {
    setTimerKey((k) => k + 1);
  }, []);

  // Bounds check
  useEffect(() => {
    if (slides.length === 0) {
      setCurrentIndex(0);
    } else if (currentIndex >= slides.length) {
      setCurrentIndex(Math.max(0, slides.length - 1));
    }
  }, [slides.length, currentIndex]);

  const handleNext = useCallback(() => {
    if (slides.length <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const handlePrev = useCallback(() => {
    if (slides.length <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  const handleNextManual = () => {
    handleNext();
    resetTimer();
  };

  const handlePrevManual = () => {
    handlePrev();
    resetTimer();
  };

  const handleDotClick = (index: number) => {
    if (index === currentIndex || index < 0 || index >= slides.length) return;
    setCurrentIndex(index);
    resetTimer();
  };

  // 5-second continuous autoplay
  useEffect(() => {
    if (slides.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [slides.length, timerKey]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (slides.length <= 1) return;
      if (e.key === "ArrowLeft") handlePrevManual();
      if (e.key === "ArrowRight") handleNextManual();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [slides.length, handleNextManual, handlePrevManual]);

  if (slides.length === 0) return null;

  return (
    <section
      className="relative py-4 md:py-8 overflow-hidden w-full"
      style={{ backgroundColor: section.backgroundColor || "transparent" }}
    >
      <div className="w-full">
        {/* Section Header if showTitle or showSubtitle */}
        {(section.showTitle || section.showSubtitle) && (
          <div className="max-w-7xl mx-auto text-center mb-4 md:mb-6 animate-fadeIn px-4 md:px-8">
            {section.showTitle && section.title && (
              <h2
                className="text-2xl md:text-4xl font-bold tracking-tight"
                style={{ color: section.textColor || "#000000" }}
              >
                {section.title}
              </h2>
            )}
            {section.showSubtitle && section.subtitle && (
              <p
                className="text-sm md:text-base opacity-80 mt-1.5 max-w-2xl mx-auto"
                style={{ color: section.textColor || "#666666" }}
              >
                {section.subtitle}
              </p>
            )}
          </div>
        )}

        {/* Hero Section Carousel Frame — full-bleed on every breakpoint */}
        <div
          className="relative w-full overflow-hidden rounded-none bg-neutral-900 shadow-lg border-0 aspect-[16/9] sm:aspect-[21/9] lg:aspect-auto lg:h-screen"
          role="region"
          aria-roledescription="carousel"
          aria-label={section.title || "Promotional banners"}
        >
          {/* Horizontal Track */}
          <div
            className="flex h-full w-full transition-transform duration-500 ease-out motion-reduce:transition-none"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {slides.map((slide, index) => {
              const isActive = index === currentIndex;
              const hasError = failedImages[slide.id];

              return (
                <div
                  key={slide.id}
                  className="relative h-full w-full flex-shrink-0 select-none overflow-hidden"
                  aria-hidden={!isActive}
                >
                  {/* Image / Video Media */}
                  {slide.mediaType === "VIDEO" ? (
                    <video
                      src={slide.imageUrl}
                      className="w-full h-full object-cover object-center"
                      autoPlay={isActive}
                      loop
                      muted
                      playsInline
                    />
                  ) : hasError ? (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-neutral-800 text-neutral-400 p-6 text-center">
                      <p className="text-sm font-medium">Image unavailable</p>
                    </div>
                  ) : (
                    <Image
                      src={slide.imageUrl}
                      alt={slide.title || "Banner image"}
                      fill
                      sizes="100vw"
                      priority={index === 0}
                      className="object-cover object-center"
                      onError={() =>
                        setFailedImages((prev) => ({
                          ...prev,
                          [slide.id]: true,
                        }))
                      }
                    />
                  )}

                  {/* Gradient Overlay for Text Legibility */}
                  <div
                    className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/10"
                    aria-hidden="true"
                  />

                  {/* Discount / Promo Badge */}
                  {slide.badge && (
                    <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-10">
                      <span className="inline-block px-3 py-1 rounded-full bg-amber-600 text-white text-xs font-bold uppercase tracking-wider shadow-md backdrop-blur-sm">
                        {slide.badge}
                      </span>
                    </div>
                  )}

                  {/* Slide Content Overlay */}
                  <div className="absolute inset-x-0 bottom-6 sm:bottom-10 lg:bottom-12 z-10 px-6 sm:px-12 md:px-16 text-center flex flex-col items-center justify-center">
                    <h3 className="text-xl sm:text-3xl lg:text-4xl font-extrabold uppercase tracking-wider text-white drop-shadow-lg max-w-3xl line-clamp-1">
                      {slide.title}
                    </h3>

                    {slide.subtitle && (
                      <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm lg:text-base text-white/90 max-w-2xl font-light drop-shadow line-clamp-2">
                        {slide.subtitle}
                      </p>
                    )}

                    {slide.link && (
                      <Link
                        href={slide.link}
                        className="mt-3 sm:mt-4 inline-flex items-center gap-1.5 px-5 py-2 sm:px-6 sm:py-2.5 text-xs font-semibold uppercase tracking-widest text-black bg-white hover:bg-neutral-100 rounded-full shadow-lg transition-all duration-200 transform hover:scale-105 active:scale-95"
                      >
                        {slide.buttonText || "Explore"}
                        <ExternalLink className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Previous / Next Arrow Controls (Multiple slides only) */}
          {isMultiple && (
            <>
              <button
                type="button"
                onClick={handlePrevManual}
                aria-label="Previous banner"
                className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-white/80 active:scale-95"
              >
                <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>

              <button
                type="button"
                onClick={handleNextManual}
                aria-label="Next banner"
                className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-white/80 active:scale-95"
              >
                <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>

              {/* Black Pagination Dots */}
              <div
                className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/85 backdrop-blur-md shadow-md border border-white/40"
                role="tablist"
                aria-label="Banner pagination"
              >
                {slides.map((_, index) => {
                  const isActive = index === currentIndex;
                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleDotClick(index)}
                      aria-label={`Go to banner ${index + 1}`}
                      aria-current={isActive ? "true" : undefined}
                      className={`transition-all duration-300 rounded-full focus:outline-none focus:ring-2 focus:ring-black ${
                        isActive
                          ? "w-7 sm:w-8 h-2.5 bg-black"
                          : "w-2.5 h-2.5 bg-gray-400 hover:bg-gray-700"
                      }`}
                    />
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
