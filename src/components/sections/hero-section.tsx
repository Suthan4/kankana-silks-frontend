"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import { type Banner, MediaType } from "@/lib/api/banner.api";

const AUTOPLAY_DELAY = 5000;
const MIN_SWIPE_DISTANCE = 50;
const TRANSITION_DURATION = 0.65;

interface IHeroSection {
  banners: Banner[];
  isError: boolean;
  isLoading: boolean;
  error: Error | null;
}

export default function HeroSection({
  banners,
  isError,
  isLoading,
}: IHeroSection) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);

  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const autoplayRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalSlides = banners.length;

  useEffect(() => {
    setCurrentSlide((current) =>
      totalSlides === 0 ? 0 : current % totalSlides,
    );
  }, [totalSlides]);

  // Clear autoplay timer
  const clearAutoplay = useCallback(() => {
    if (autoplayRef.current) {
      clearInterval(autoplayRef.current);
      autoplayRef.current = null;
    }
  }, []);

  // Next slide
  const nextSlide = useCallback(() => {
    if (totalSlides <= 1) return;

    setCurrentSlide((current) => (current + 1) % totalSlides);
  }, [totalSlides]);

  // Previous slide
  const prevSlide = useCallback(() => {
    if (totalSlides <= 1) return;

    setCurrentSlide((current) => (current - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  // Autoplay
  useEffect(() => {
    clearAutoplay();

    if (!autoPlay || totalSlides <= 1) return;

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
  }, [autoPlay, totalSlides, clearAutoplay]);

  // Manual interaction pauses autoplay
  const handleManualNavigation = useCallback((callback: () => void) => {
    setAutoPlay(false);
    callback();
  }, []);

  const goToSlide = useCallback(
    (index: number) => {
      if (index < 0 || index >= totalSlides) return;

      setAutoPlay(false);
      setCurrentSlide(index);
    },
    [totalSlides],
  );

  // Touch handling using refs to avoid stale React state
  const onTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    if (event.touches.length !== 1) return;

    touchStartX.current = event.touches[0].clientX;
    touchStartY.current = event.touches[0].clientY;
  };

  const onTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartX.current === null || touchStartY.current === null) {
      return;
    }

    const touch = event.changedTouches[0];

    const deltaX = touchStartX.current - touch.clientX;
    const deltaY = touchStartY.current - touch.clientY;

    touchStartX.current = null;
    touchStartY.current = null;

    // Ignore vertical scrolling
    if (Math.abs(deltaY) > Math.abs(deltaX)) return;

    if (Math.abs(deltaX) < MIN_SWIPE_DISTANCE) return;

    setAutoPlay(false);

    if (deltaX > 0) {
      nextSlide();
    } else {
      prevSlide();
    }
  };

  if (isLoading) {
    return (
      <section className="relative mt-[108px] flex aspect-[16/10] w-full items-center justify-center bg-black sm:mt-[108px] sm:aspect-auto sm:h-[75vh] sm:min-h-[480px] md:mt-0 md:h-[100svh] md:min-h-[640px]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/20 border-t-white" />
      </section>
    );
  }

  if (isError || totalSlides === 0) {
    return (
      <section className="relative mt-[108px] flex aspect-[16/10] w-full items-center justify-center bg-black sm:mt-[108px] sm:aspect-auto sm:h-[75vh] sm:min-h-[480px] md:mt-0 md:h-[100svh] md:min-h-[640px]">
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
      {/* SLIDER */}

      <div
        className="
          absolute inset-0
          touch-pan-y
          select-none
          overflow-hidden
        "
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onTouchCancel={() => {
          touchStartX.current = null;
          touchStartY.current = null;
        }}
      >
        <AnimatePresence initial={false}>
          <motion.div
            key={activeBanner.id}
            className="
              absolute inset-0
              overflow-hidden
              pointer-events-none
              [transform:translateZ(0)]
              [backface-visibility:hidden]
              will-change-[opacity]
            "
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              opacity: {
                duration: TRANSITION_DURATION,
                ease: [0.22, 1, 0.36, 1],
              },
            }}
          >
            {activeBanner.type === MediaType.IMAGE ? (
              <>
                {/* Desktop image */}
                <Image
                  src={activeBanner.url}
                  alt={activeBanner.title || "Promotional banner"}
                  fill
                  sizes="100vw"
                  priority
                  quality={90}
                  draggable={false}
                  className="
                    hidden md:block
                    object-cover object-center
                  "
                />

                {/* Mobile image */}
                <Image
                  src={activeBanner.mobileUrl || activeBanner.url}
                  alt={activeBanner.title || "Promotional banner"}
                  fill
                  sizes="100vw"
                  priority
                  quality={85}
                  draggable={false}
                  className="
                    block md:hidden
                    object-cover object-[50%_25%]
                  "
                />
              </>
            ) : (
              <video
                key={activeBanner.id}
                src={activeBanner.url}
                poster={activeBanner.thumbnailUrl || undefined}
                className="
                  h-full w-full
                  object-cover object-[50%_25%]
                  md:object-center
                "
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* BOTTOM GRADIENT */}

      <div
        className="
          pointer-events-none
          absolute inset-x-0 bottom-0 z-[5]
          h-24 bg-gradient-to-t
          from-black to-transparent
          sm:h-32 md:h-40
        "
      />

      {/* HERO CONTENT */}

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
            transition={{ duration: 0.35, ease: "easeOut" }}
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

      {/* DESKTOP ARROWS */}

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

          {/* INDICATORS */}

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
