"use client";

import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import bannerService, { Banner, MediaType } from "@/lib/api/banner.api";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const [enableScrollAnim, setEnableScrollAnim] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const ref = useRef<HTMLDivElement | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  /* ------------------ FETCH BANNERS ------------------ */
  const {
    data: banners = [],
    isLoading: loading,
    isError,
  } = useQuery({
    queryKey: ["active-banners"],
    queryFn: () => bannerService.getActiveBanners(),
  });

  /* ------------------ SCROLL ANIMATION ------------------ */
  const { scrollYProgress } = useScroll(
    isMounted && ref.current
      ? {
          target: ref,
          offset: ["start start", "end center"],
        }
      : {},
  );

  const yTransform = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const y = enableScrollAnim ? yTransform : 0;

  useEffect(() => {
    const run = () => setEnableScrollAnim(true);

    if (typeof window !== "undefined") {
      if ("requestIdleCallback" in window) {
        (window as any).requestIdleCallback(run);
      } else {
        setTimeout(run, 1);
      }
    }
  }, []);

  /* ------------------ AUTOPLAY ------------------ */
  useEffect(() => {
    if (!autoPlay || banners.length === 0) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [autoPlay, banners.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length);
    setAutoPlay(false);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
    setAutoPlay(false);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setAutoPlay(false);
  };
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setAutoPlay(false);
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;

    if (distance > minSwipeDistance) {
      nextSlide();
    } else if (distance < -minSwipeDistance) {
      prevSlide();
    }
  };

  if (loading) {
    return (
      <section className="relative w-full h-screen overflow-hidden bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </section>
    );
  }

  if (banners.length === 0) {
    return (
      <section className="relative w-full h-screen overflow-hidden bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No banners available</p>
        </div>
      </section>
    );
  }

  return (
    // ✅ h-screen (not min-h-screen) + -mt to pull the section under the
    // fixed/transparent header, so it's truly full-bleed like Sabyasachi's hero.
    <section
      ref={ref}
      className="relative w-full h-screen overflow-hidden bg-background"
      style={{ contain: "layout paint size" }}
    >
      {/* ------------------ BACKGROUND MEDIA ------------------ */}
      <div
        className="
    absolute inset-0 w-full h-full overflow-hidden
    touch-pan-y
    select-none
    overscroll-x-contain
  "
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {banners.map((banner, index) => (
          <motion.div
            key={banner.id}
            className="absolute inset-0 w-full h-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: index === currentSlide ? 1 : 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            style={{ y }}
          >
            {banner.type === MediaType.IMAGE ? (
              <Image
                src={banner.url}
                alt={banner.title}
                fill
                sizes="100vw"
                priority={index === 0}
                className="object-cover"
              />
            ) : (
              <video
                src={banner.url}
                poster={banner.thumbnailUrl}
                className="w-full h-full object-cover"
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
              />
            )}
          </motion.div>
        ))}
        {/* Slight darkening so white header text/logo stays readable */}
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* ------------------ CONTENT ------------------ */}
      <div className="relative z-10 flex h-full items-center justify-center px-4">
        <motion.div
          className="text-center max-w-4xl"
          initial={{ opacity: 0, y: 70 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-6xl md:text-8xl font-light text-white mb-6 tracking-tight">
                {banners[currentSlide]?.title || "Timeless Elegance"}
              </h1>

              {banners[currentSlide]?.text && (
                <p className="text-xl md:text-2xl text-white/90 font-light mb-12">
                  {banners[currentSlide].text}
                </p>
              )}

              {banners[currentSlide]?.link && (
                <Link href={banners[currentSlide].link!}>
                  <button className="px-8 py-3 bg-white text-black font-medium rounded-full hover:scale-105 transition">
                    Explore Collection
                  </button>
                </Link>
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>

      {/* ------------------ LUXURY NAVIGATION ------------------ */}
      {banners.length > 1 && (
        <>
          {/* DESKTOP ONLY ARROWS */}
          <button
            onClick={prevSlide}
            className="
        hidden md:flex
        absolute left-6 top-1/2 -translate-y-1/2 z-30
        w-14 h-14
        items-center justify-center
        rounded-full
        bg-black/20
        backdrop-blur-2xl
        border border-white/10
        shadow-[0_10px_40px_rgba(0,0,0,0.25)]
        hover:bg-black/35
        hover:scale-105
        transition-all duration-500
      "
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>

          <button
            onClick={nextSlide}
            className="
        hidden md:flex
        absolute right-6 top-1/2 -translate-y-1/2 z-30
        w-14 h-14
        items-center justify-center
        rounded-full
        bg-black/20
        backdrop-blur-2xl
        border border-white/10
        shadow-[0_10px_40px_rgba(0,0,0,0.25)]
        hover:bg-black/35
        hover:scale-105
        transition-all duration-500
      "
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>

          {/* MOBILE SWIPE HINT */}
          <div className="md:hidden absolute bottom-24 left-1/2 -translate-x-1/2 z-30">
            <div
              className="
          px-4 py-1.5
          rounded-full
          bg-black/20
          backdrop-blur-xl
          border border-white/10
        "
            >
              <p className="text-[10px] uppercase tracking-[0.25em] text-white/70">
                Swipe
              </p>
            </div>
          </div>

          {/* PREMIUM DOTS */}
          <div
            className="
        absolute bottom-10 left-1/2 -translate-x-1/2
        z-30 flex items-center gap-2
      "
          >
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`
            rounded-full transition-all duration-500
            ${
              index === currentSlide
                ? "w-10 h-[3px] bg-white"
                : "w-2 h-2 bg-white/35"
            }
          `}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
