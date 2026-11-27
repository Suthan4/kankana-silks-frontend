"use client";

import { HomeSection, Product, SectionMedia } from "@/lib/api/home-section.api";
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  type TouchEvent,
} from "react";
import HomeSectionHeading from "../common/homeSectionHeading";

interface BannerSlide {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  posterUrl?: string;
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

  if (section.products?.length) {
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
        posterUrl:
          primaryMedia && "thumbnailUrl" in primaryMedia &&
          typeof primaryMedia.thumbnailUrl === "string"
            ? primaryMedia.thumbnailUrl
            : undefined,
        mediaType: primaryMedia?.type || "IMAGE",
        link: `/products/${product.slug}`,
        badge,
        buttonText: "Shop Now",
      });
    });
  }

  if (section.media?.length) {
    section.media.forEach((media: SectionMedia) => {
      if (!media.url) return;

      slides.push({
        id: media.id,
        title: media.overlayTitle || media.title || section.title,
        subtitle: media.overlaySubtitle || section.subtitle || undefined,
        imageUrl: media.url,
        posterUrl: media.thumbnailUrl || undefined,
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
  const [failedVideos, setFailedVideos] = useState<Record<string, boolean>>({});

  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const isMultiple = slides.length > 1;

  const resetTimer = useCallback(() => {
    setTimerKey((key) => key + 1);
  }, []);

  // Keep current slide within valid bounds.
  useEffect(() => {
    if (slides.length === 0) {
      setCurrentIndex(0);
    } else if (currentIndex >= slides.length) {
      setCurrentIndex(slides.length - 1);
    }
  }, [slides.length, currentIndex]);

  // Navigation
  const handleNext = useCallback(() => {
    if (slides.length <= 1) return;

    setCurrentIndex((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const handlePrev = useCallback(() => {
    if (slides.length <= 1) return;

    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  const handleNextManual = useCallback(() => {
    handleNext();
    resetTimer();
  }, [handleNext, resetTimer]);

  const handlePrevManual = useCallback(() => {
    handlePrev();
    resetTimer();
  }, [handlePrev, resetTimer]);

  const handleDotClick = useCallback(
    (index: number) => {
      if (index === currentIndex || index < 0 || index >= slides.length) {
        return;
      }

      setCurrentIndex(index);
      resetTimer();
    },
    [currentIndex, slides.length, resetTimer],
  );

  // Mobile swipe navigation.
  // Vertical page scrolling is preserved.
  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    if (event.touches.length !== 1) return;

    touchStartX.current = event.touches[0].clientX;
    touchStartY.current = event.touches[0].clientY;
  };

  const handleTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    if (touchStartX.current === null || touchStartY.current === null) {
      return;
    }

    const touch = event.changedTouches[0];

    const deltaX = touchStartX.current - touch.clientX;
    const deltaY = touchStartY.current - touch.clientY;

    touchStartX.current = null;
    touchStartY.current = null;

    // Ignore vertical gestures.
    if (Math.abs(deltaX) < 45 || Math.abs(deltaX) <= Math.abs(deltaY)) {
      return;
    }

    if (deltaX > 0) {
      handleNextManual();
    } else {
      handlePrevManual();
    }
  };

  const handleTouchCancel = () => {
    touchStartX.current = null;
    touchStartY.current = null;
  };

  // Automatic slide navigation every 5 seconds.
  useEffect(() => {
    if (slides.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [slides.length, timerKey]);

  // Keyboard navigation.
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (slides.length <= 1) return;

      if (event.key === "ArrowLeft") {
        handlePrevManual();
      }

      if (event.key === "ArrowRight") {
        handleNextManual();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [slides.length, handleNextManual, handlePrevManual]);

  if (slides.length === 0) return null;

  return (
    <section
      className="relative w-full overflow-hidden py-4 md:py-8"
      style={{
        backgroundColor: section.backgroundColor || "transparent",
      }}
    >
      <div className="w-full">
        {/* Optional section heading */}
        <HomeSectionHeading
          title={section.title}
          subtitle={section.subtitle}
          showTitle={section.showTitle}
          showSubtitle={section.showSubtitle}
          textColor={section.textColor || "#4A2C2E"}
          className="mb-6 animate-fadeIn"
        />

        {/* Banner carousel */}
        <div
          className="relative aspect-[16/9] w-full overflow-hidden bg-black touch-pan-y select-none sm:aspect-[21/9] lg:aspect-auto lg:h-screen"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchCancel}
          role="region"
          aria-roledescription="carousel"
          aria-label={section.title || "Promotional banners"}
        >
          {/* Slides track */}
          <div
            className="flex h-full w-full will-change-transform [backface-visibility:hidden] transition-transform duration-500 ease-out motion-reduce:transition-none"
            style={{
              transform: `translateX(-${currentIndex * 100}%)`,
            }}
          >
            {slides.map((slide, index) => {
              const isActive = index === currentIndex;
              const hasError = failedImages[slide.id];

              return (
                <div
                  key={slide.id}
                  className="relative h-full w-full flex-shrink-0 overflow-hidden"
                  aria-hidden={!isActive}
                >
                  {/* Image / Video */}
                  {slide.mediaType === "VIDEO" ? (
                    failedVideos[slide.id] ? (
                      slide.posterUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={slide.posterUrl}
                          alt={slide.title || "Banner preview"}
                          className="h-full w-full object-cover object-center"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-neutral-900 text-neutral-400">
                          <p className="text-sm">Video temporarily unavailable</p>
                        </div>
                      )
                    ) : (
                      <video
                        src={isActive ? slide.imageUrl : undefined}
                        poster={slide.posterUrl}
                        className="h-full w-full object-cover object-center"
                        autoPlay={isActive}
                        loop
                        muted
                        playsInline
                        preload={isActive ? "auto" : "none"}
                        onError={() =>
                          setFailedVideos((prev) => ({
                            ...prev,
                            [slide.id]: true,
                          }))
                        }
                      />
                    )
                  ) : hasError ? (
                    <div className="flex h-full w-full items-center justify-center bg-neutral-900 text-neutral-400">
                      <p className="text-sm">Image unavailable</p>
                    </div>
                  ) : (
                    <Image
                      src={slide.imageUrl}
                      alt={slide.title || "Banner image"}
                      fill
                      sizes="100vw"
                      priority={index === 0}
                      loading={index === 0 ? undefined : "lazy"}
                      className="object-cover object-center"
                      onError={() =>
                        setFailedImages((prev) => ({
                          ...prev,
                          [slide.id]: true,
                        }))
                      }
                    />
                  )}

                  {/* PURE BLACK GRADIENT OVERLAY */}

                  <div
                    className="pointer-events-none absolute inset-0 z-[1]"
                    style={{
                      background:
                        "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.35) 25%, rgba(0,0,0,0.10) 100%)",
                    }}
                    aria-hidden="true"
                  />

                  {/* Discount badge */}
                  {slide.badge && (
                    <div className="absolute left-4 top-4 z-10 sm:left-6 sm:top-6">
                      <span className="inline-block rounded-full bg-black/75 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white backdrop-blur-sm">
                        {slide.badge}
                      </span>
                    </div>
                  )}

                  {/* Minimal text overlay - NO WHITE CARD */}
                  <div
                    className="
                      absolute inset-x-0 bottom-10 z-10
                      flex flex-col items-center justify-end
                      px-5 text-center
                      sm:bottom-14 sm:px-12
                      md:bottom-16 md:px-16
                    "
                  >
                    {slide.title && (
                      <h3
                        className="
                          max-w-3xl
                          text-xl font-semibold
                          uppercase tracking-[0.12em]
                          leading-tight text-white
                          drop-shadow-md
                          sm:text-3xl
                          lg:text-4xl
                        "
                      >
                        {slide.title}
                      </h3>
                    )}

                    {slide.subtitle && (
                      <p
                        className="
                          mt-2 max-w-2xl
                          text-xs font-normal
                          leading-relaxed text-white/90
                          drop-shadow-md
                          sm:text-sm
                          lg:text-base
                        "
                      >
                        {slide.subtitle}
                      </p>
                    )}

                    {/* Minimal CTA */}
                    {slide.link && (
                      <Link
                        href={slide.link}
                        className="
                          mt-4 inline-flex items-center gap-2
                          rounded-full
                          border border-white/30
                          bg-black/80
                          px-5 py-2.5
                          text-xs font-semibold
                          uppercase tracking-[0.15em]
                          text-white
                          shadow-md
                          backdrop-blur-sm
                          transition-all duration-200
                          hover:bg-black
                          active:scale-95
                          sm:px-7 sm:py-3
                        "
                      >
                        {slide.buttonText || "Explore"}
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop navigation arrows only */}
          {isMultiple && (
            <>
              <button
                type="button"
                onClick={handlePrevManual}
                aria-label="Previous banner"
                className="
                  absolute left-3 top-1/2 z-20 hidden
                  h-10 w-10 -translate-y-1/2
                  items-center justify-center
                  rounded-full border border-white/25
                  bg-black/55 text-white
                  shadow-lg backdrop-blur-sm
                  transition-all hover:bg-black/80
                  focus:outline-none focus:ring-2 focus:ring-white
                  active:scale-95
                  md:flex
                  sm:left-5 sm:h-11 sm:w-11
                "
              >
                <ChevronLeft className="h-6 w-6" />
              </button>

              <button
                type="button"
                onClick={handleNextManual}
                aria-label="Next banner"
                className="
                  absolute right-3 top-1/2 z-20 hidden
                  h-10 w-10 -translate-y-1/2
                  items-center justify-center
                  rounded-full border border-white/25
                  bg-black/55 text-white
                  shadow-lg backdrop-blur-sm
                  transition-all hover:bg-black/80
                  focus:outline-none focus:ring-2 focus:ring-white
                  active:scale-95
                  md:flex
                  sm:right-5 sm:h-11 sm:w-11
                "
              >
                <ChevronRight className="h-6 w-6" />
              </button>

              {/* Pagination indicators */}
              <div
                className="
                  absolute bottom-3 left-1/2 z-20
                  flex -translate-x-1/2 items-center gap-2
                  md:bottom-5
                "
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
                      className={`
                        rounded-full
                        transition-all duration-300
                        focus:outline-none focus:ring-2 focus:ring-white
                        ${
                          isActive
                            ? "h-[3px] w-8 bg-white"
                            : "h-2 w-2 bg-white/50 hover:bg-white"
                        }
                      `}
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
