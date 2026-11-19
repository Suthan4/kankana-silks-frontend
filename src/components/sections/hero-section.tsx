"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { getImageProps } from "next/image";
import { preload } from "react-dom";
import { useCallback, useEffect, useRef, useState } from "react";

import { type Banner, MediaType } from "@/lib/api/banner.api";

const AUTOPLAY_DELAY = 5000;
const MIN_SWIPE_DISTANCE = 50;

interface IHeroSection {
  banners: Banner[];
  isError: boolean;
  isLoading: boolean;
  error: Error | null;
}

/**
 * One responsive, optimised banner image.
 * - Served through the Next.js image optimiser (AVIF/WebP, right-sized per
 *   screen) instead of the original 3840x2160 JPEG.
 * - Mobile gets its own source when the banner has a mobileUrl.
 * - Only the first slide is high priority; later slides load at low priority.
 */
function BannerPicture({
  banner,
  isFirst,
  isActive,
  onFirstSettled,
}: {
  banner: Banner;
  isFirst: boolean;
  isActive: boolean;
  onFirstSettled: () => void;
}) {
  const common = {
    alt: banner.title || "Promotional banner",
    fill: true,
    sizes: "100vw",
    quality: 60,
    draggable: false,
  } as const;

  const { props: desktop } = getImageProps({
    ...common,
    src: banner.url,
    loading: "eager" as const,
    fetchPriority: isFirst ? ("high" as const) : ("low" as const),
  });
  const { props: mobile } = getImageProps({
    ...common,
    src: banner.mobileUrl || banner.url,
  });
  const { srcSet: desktopSrcSet, ...imgProps } = desktop;

  // The first banner is the LCP element. Tell the browser about it in <head>
  // right away (one hint per screen size) so it starts downloading before the
  // page's JavaScript runs. (<picture> images are not preloaded by default.)
  if (isFirst) {
    preload(mobile.src, {
      as: "image",
      imageSrcSet: mobile.srcSet,
      imageSizes: "100vw",
      media: "(max-width: 767px)",
      fetchPriority: "high",
    });
    preload(desktop.src, {
      as: "image",
      imageSrcSet: desktopSrcSet,
      imageSizes: "100vw",
      media: "(min-width: 768px)",
      fetchPriority: "high",
    });
  }

  return (
    <picture
      className="absolute inset-0 h-full w-full"
      style={{ display: isActive ? "block" : "none" }}
      aria-hidden={!isActive}
    >
      <source media="(max-width: 767px)" srcSet={mobile.srcSet} sizes="100vw" />
      <source media="(min-width: 768px)" srcSet={desktopSrcSet} sizes="100vw" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        {...imgProps}
        ref={(node) => {
          // The image may finish loading before React hydrates.
          if (isFirst && node?.complete) onFirstSettled();
        }}
        onLoad={isFirst ? onFirstSettled : undefined}
        onError={isFirst ? onFirstSettled : undefined}
        className="absolute inset-0 block h-full w-full object-cover object-[50%_25%] md:object-center"
      />
    </picture>
  );
}

export default function HeroSection({
  banners,
  isError,
  isLoading,
}: IHeroSection) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  // The first banner decides when autoplay may start and when the next
  // banner is allowed to download (never all banners at once).
  const [firstLoaded, setFirstLoaded] = useState(false);

  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const autoplayRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalSlides = banners.length;

  const handleFirstSettled = useCallback(() => setFirstLoaded(true), []);

  // A video first slide is "ready" immediately; a slow first image must not
  // block autoplay forever, so give up waiting after 4 seconds.
  const firstIsImage = banners[0]?.type === MediaType.IMAGE;
  const ready = firstLoaded || !firstIsImage;

  useEffect(() => {
    if (ready || banners.length === 0) return;
    const timer = setTimeout(() => setFirstLoaded(true), 4000);
    return () => clearTimeout(timer);
  }, [ready, banners.length]);

  // Keep slide index within the available banner range.
  useEffect(() => {
    setCurrentSlide((current) =>
      totalSlides === 0 ? 0 : current % totalSlides,
    );
  }, [totalSlides]);

  // Clear autoplay.
  const clearAutoplay = useCallback(() => {
    if (autoplayRef.current !== null) {
      clearInterval(autoplayRef.current);
      autoplayRef.current = null;
    }
  }, []);

  // Next slide.
  const nextSlide = useCallback(() => {
    if (totalSlides <= 1) return;

    setCurrentSlide((current) => (current + 1) % totalSlides);
  }, [totalSlides]);

  // Previous slide.
  const prevSlide = useCallback(() => {
    if (totalSlides <= 1) return;

    setCurrentSlide((current) => (current - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  // Autoplay.
  useEffect(() => {
    clearAutoplay();

    if (!autoPlay || !ready || totalSlides <= 1) {
      return;
    }

    const startAutoplay = () => {
      clearAutoplay();

      if (document.hidden) return;

      autoplayRef.current = setInterval(() => {
        setCurrentSlide((current) => (current + 1) % totalSlides);
      }, AUTOPLAY_DELAY);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        clearAutoplay();
      } else {
        startAutoplay();
      }
    };

    startAutoplay();

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearAutoplay();

      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [autoPlay, ready, totalSlides, clearAutoplay]);

  // Manual navigation pauses autoplay.
  const handleManualNavigation = useCallback((callback: () => void) => {
    setAutoPlay(false);
    callback();
  }, []);

  // Navigate to a particular slide.
  const goToSlide = useCallback(
    (index: number) => {
      if (index < 0 || index >= totalSlides) return;

      setAutoPlay(false);
      setCurrentSlide(index);
    },
    [totalSlides],
  );

  // Touch start.
  const onTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    if (event.touches.length !== 1) return;

    touchStartX.current = event.touches[0].clientX;
    touchStartY.current = event.touches[0].clientY;
  };

  // Touch end.
  const onTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartX.current === null || touchStartY.current === null) {
      return;
    }

    const touch = event.changedTouches[0];

    const deltaX = touchStartX.current - touch.clientX;
    const deltaY = touchStartY.current - touch.clientY;

    touchStartX.current = null;
    touchStartY.current = null;

    // Ignore vertical scrolling.
    if (Math.abs(deltaY) > Math.abs(deltaX)) return;

    if (Math.abs(deltaX) < MIN_SWIPE_DISTANCE) return;

    setAutoPlay(false);

    if (deltaX > 0) {
      nextSlide();
    } else {
      prevSlide();
    }
  };

  // Reset touch tracking.
  const onTouchCancel = () => {
    touchStartX.current = null;
    touchStartY.current = null;
  };

  // Loading state.
  if (isLoading) {
    return (
      <section
        className="
        relative mt-[108px] flex aspect-[16/10] w-full
        items-center justify-center bg-black
        sm:mt-[108px] sm:aspect-auto sm:h-[75vh]
        sm:min-h-[480px]
        md:mt-0 md:h-[100svh] md:min-h-[640px]
      "
      >
        <div
          className="
          h-10 w-10 animate-spin rounded-full
          border-4 border-white/20 border-t-white
        "
        />
      </section>
    );
  }

  // Error state.
  if (isError || totalSlides === 0) {
    return (
      <section
        className="
        relative mt-[108px] flex aspect-[16/10] w-full
        items-center justify-center bg-black
        sm:mt-[108px] sm:aspect-auto sm:h-[75vh]
        sm:min-h-[480px]
        md:mt-0 md:h-[100svh] md:min-h-[640px]
      "
      >
        <p className="text-sm text-white/70">
          {isError ? "Unable to load banners" : "No banners available"}
        </p>
      </section>
    );
  }

  const activeBanner = banners[currentSlide];

  return (
    <section
      className="
        relative mt-[108px]
        aspect-[16/10] h-auto w-full
        overflow-hidden bg-black
        isolate
        sm:mt-[108px] sm:aspect-auto
        sm:h-[75vh] sm:min-h-[480px]
        md:mt-0 md:h-[100svh] md:min-h-[640px]
      "
      aria-roledescription="carousel"
      aria-label="Promotional banners"
    >
      {/* =====================================
          STABLE BANNER SLIDER
          No image animations or crossfades.
      ====================================== */}

      <div
        className="
          absolute inset-0
          touch-pan-y
          select-none
          overflow-hidden
        "
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onTouchCancel={onTouchCancel}
      >
        {banners.map((banner, index) => {
          const isActive = index === currentSlide;

          // Image banners.
          if (banner.type === MediaType.IMAGE) {
            // Mount the visible slide and, once the first banner is ready,
            // only the NEXT one (never all banners at once).
            const nextIndex = (currentSlide + 1) % totalSlides;
            const shouldMount =
              index === 0 ||
              index === currentSlide ||
              (ready && index === nextIndex);
            if (!shouldMount) return null;

            return (
              <BannerPicture
                key={banner.id}
                banner={banner}
                isFirst={index === 0}
                isActive={isActive}
                onFirstSettled={handleFirstSettled}
              />
            );
          }

          // Video banners.
          return (
            <video
              key={banner.id}
              src={banner.url}
              poster={banner.thumbnailUrl || undefined}
              className="
                absolute inset-0
                h-full w-full
                object-cover
                object-[50%_25%]
                md:object-center
              "
              style={{
                display: isActive ? "block" : "none",
              }}
              autoPlay={isActive}
              muted
              loop
              playsInline
              preload={isActive ? "auto" : "none"}
              aria-hidden={!isActive}
            />
          );
        })}
      </div>

      {/* =====================================
          BOTTOM GRADIENT
      ====================================== */}

      <div
        className="
          pointer-events-none
          absolute inset-x-0 bottom-0 z-[5]
          h-24 bg-gradient-to-t
          from-black to-transparent
          sm:h-32 md:h-40
        "
        aria-hidden="true"
      />

      {/* =====================================
          HERO CONTENT
      ====================================== */}

      <div
        className="
          relative z-10
          flex h-full items-end justify-center
          px-5 pb-8
          sm:px-8 sm:pb-20
          lg:pb-20
        "
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeBanner.id}
            className="mx-auto w-full max-w-5xl text-center"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{
              duration: 0.35,
              ease: "easeOut",
            }}
          >
            <h1
              className="
                text-xl font-semibold uppercase
                leading-tight tracking-[0.08em]
                text-white drop-shadow-lg
                sm:text-4xl sm:tracking-[0.12em]
                lg:text-5xl
              "
            >
              {activeBanner.title || "Timeless Elegance"}
            </h1>

            {activeBanner.text && (
              <p
                className="
                  mx-auto mt-4 hidden max-w-3xl
                  text-base font-light tracking-wide
                  text-white/90 drop-shadow
                  sm:block lg:text-lg
                "
              >
                {activeBanner.text}
              </p>
            )}

            {activeBanner.link && (
              <Link
                href={activeBanner.link}
                className="
                  mt-4 inline-flex min-w-32
                  items-center justify-center
                  border border-white bg-black/15
                  px-5 py-2 text-[10px]
                  font-semibold uppercase tracking-[0.16em]
                  text-white backdrop-blur-sm
                  transition-colors
                  hover:bg-white hover:text-black
                  sm:mt-7 sm:min-w-40 sm:px-8
                  sm:py-3 sm:text-sm
                "
              >
                Explore Collection
              </Link>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* =====================================
          DESKTOP ARROWS
      ====================================== */}

      {totalSlides > 1 && (
        <>
          <button
            type="button"
            onClick={() => handleManualNavigation(prevSlide)}
            className="
              absolute left-4 top-1/2 z-30
              hidden h-12 w-12
              -translate-y-1/2
              items-center justify-center
              rounded-full border border-white/30
              bg-black/20 text-white
              backdrop-blur-md transition-all
              hover:bg-black/45
              md:flex lg:left-8
            "
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={() => handleManualNavigation(nextSlide)}
            className="
              absolute right-4 top-1/2 z-30
              hidden h-12 w-12
              -translate-y-1/2
              items-center justify-center
              rounded-full border border-white/30
              bg-black/20 text-white
              backdrop-blur-md transition-all
              hover:bg-black/45
              md:flex lg:right-8
            "
            aria-label="Next slide"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          {/* =====================================
              SLIDE INDICATORS
          ====================================== */}

          <div
            className="
              absolute bottom-5 left-1/2 z-30
              flex -translate-x-1/2
              items-center gap-2
              sm:bottom-9
            "
          >
            {banners.map((banner, index) => (
              <button
                key={banner.id}
                type="button"
                onClick={() => goToSlide(index)}
                className={`
                  rounded-full transition-all duration-300
                  ${
                    index === currentSlide
                      ? "h-[3px] w-10 bg-white"
                      : "h-2 w-2 bg-white/40 hover:bg-white/70"
                  }
                `}
                aria-label={`Go to slide ${index + 1}`}
                aria-current={index === currentSlide ? "true" : undefined}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
