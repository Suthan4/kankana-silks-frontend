"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import bannerService, { type Banner, MediaType } from "@/lib/api/banner.api";

const AUTOPLAY_DELAY = 5000;
const MIN_SWIPE_DISTANCE = 50;

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const {
    data: banners = [],
    isLoading,
    isError,
  } = useQuery<Banner[]>({
    queryKey: ["active-banners"],
    queryFn: () => bannerService.getActiveBanners(),
  });

  useEffect(() => {
    if (banners.length === 0) {
      setCurrentSlide(0);
      return;
    }

    setCurrentSlide((current) => (current >= banners.length ? 0 : current));
  }, [banners.length]);

  useEffect(() => {
    if (!autoPlay || banners.length <= 1) return;

    const interval = window.setInterval(() => {
      setCurrentSlide((current) => (current + 1) % banners.length);
    }, AUTOPLAY_DELAY);

    return () => window.clearInterval(interval);
  }, [autoPlay, banners.length]);

  const nextSlide = () => {
    if (banners.length <= 1) return;

    setCurrentSlide((current) => (current + 1) % banners.length);
    setAutoPlay(false);
  };

  const prevSlide = () => {
    if (banners.length <= 1) return;

    setCurrentSlide(
      (current) => (current - 1 + banners.length) % banners.length,
    );
    setAutoPlay(false);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setAutoPlay(false);
  };

  const onTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    setAutoPlay(false);
    setTouchEnd(null);
    setTouchStart(event.targetTouches[0].clientX);
  };

  const onTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
    setTouchEnd(event.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (touchStart === null || touchEnd === null) return;

    const distance = touchStart - touchEnd;

    if (distance > MIN_SWIPE_DISTANCE) {
      nextSlide();
    } else if (distance < -MIN_SWIPE_DISTANCE) {
      prevSlide();
    }

    setTouchStart(null);
    setTouchEnd(null);
  };

  if (isLoading) {
    return (
      <section className="relative flex h-[100svh] min-h-[640px] w-full items-center justify-center overflow-hidden bg-black">
        <div className="text-center">
          <div className="mx-auto mb-4 h-11 w-11 animate-spin rounded-full border-4 border-white/25 border-t-white" />
          <p className="text-sm text-white/70">Loading...</p>
        </div>
      </section>
    );
  }

  if (isError || banners.length === 0) {
    return (
      <section className="relative flex h-[100svh] min-h-[640px] w-full items-center justify-center overflow-hidden bg-black">
        <p className="text-sm text-white/70">
          {isError ? "Unable to load banners" : "No banners available"}
        </p>
      </section>
    );
  }

  const activeBanner = banners[currentSlide];

  return (
    <section
      className="relative h-[100svh] min-h-[640px] w-full overflow-hidden bg-black"
      aria-roledescription="carousel"
      aria-label="Promotional banners"
    >
      <div
        className="absolute inset-0 touch-pan-y select-none overscroll-x-contain"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {banners.map((banner, index) => (
          <motion.div
            key={banner.id}
            className="absolute inset-0"
            initial={false}
            animate={{
              opacity: index === currentSlide ? 1 : 0,
              visibility: index === currentSlide ? "visible" : "hidden",
            }}
            transition={{
              opacity: {
                duration: 0.85,
                ease: "easeInOut",
              },
            }}
            aria-hidden={index !== currentSlide}
          >
            {banner.type === MediaType.IMAGE ? (
              <Image
                src={banner.url}
                alt={banner.title || "Promotional banner"}
                fill
                sizes="100vw"
                priority={index === 0}
                quality={90}
                /*
                 * Preserve the original proportions.
                 * Never use object-fill here because that stretches faces.
                 */
                className="object-cover object-center"
              />
            ) : (
              <video
                src={banner.url}
                poster={banner.thumbnailUrl}
                className="h-full w-full object-cover object-center"
                autoPlay={index === currentSlide}
                muted
                loop
                playsInline
                preload={index === 0 ? "auto" : "metadata"}
              />
            )}
          </motion.div>
        ))}
      </div>

      <div className="relative z-10 flex h-full items-end justify-center px-5 pb-20 sm:px-8 sm:pb-24 lg:pb-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeBanner.id}
            className="mx-auto max-w-5xl text-center"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl font-semibold uppercase leading-tight tracking-[0.12em] text-white drop-shadow-lg sm:text-4xl lg:text-5xl">
              {activeBanner.title || "Timeless Elegance"}
            </h1>

            {activeBanner.text && (
              <p className="mx-auto mt-4 max-w-3xl text-sm font-light tracking-wide text-white/90 drop-shadow sm:text-base lg:text-lg">
                {activeBanner.text}
              </p>
            )}

            {activeBanner.link && (
              <Link
                href={activeBanner.link}
                className="mt-7 inline-flex min-w-40 items-center justify-center border border-white bg-black/15 px-8 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-white backdrop-blur-sm transition-colors hover:bg-white hover:text-black sm:text-sm"
              >
                Explore Collection
              </Link>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {banners.length > 1 && (
        <>
          <button
            type="button"
            onClick={prevSlide}
            className="absolute left-4 top-1/2 z-30 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/20 text-white backdrop-blur-md transition-all hover:bg-black/45 md:flex lg:left-8"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={nextSlide}
            className="absolute right-4 top-1/2 z-30 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/20 text-white backdrop-blur-md transition-all hover:bg-black/45 md:flex lg:right-8"
            aria-label="Next slide"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <div className="absolute bottom-7 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2 sm:bottom-9">
            {banners.map((banner, index) => (
              <button
                key={banner.id}
                type="button"
                onClick={() => goToSlide(index)}
                className={`rounded-full transition-all duration-300 ${
                  index === currentSlide
                    ? "h-[3px] w-10 bg-white"
                    : "h-2 w-2 bg-white/40 hover:bg-white/70"
                }`}
                aria-label={`Go to slide ${index + 1}`}
                aria-current={index === currentSlide}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
