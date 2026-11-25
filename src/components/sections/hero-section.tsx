"use client";

import "swiper/css";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { getImageProps } from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Swiper as SwiperInstance } from "swiper";
import { A11y, Autoplay, Keyboard } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import { type Banner, MediaType } from "@/lib/api/banner.api";

const AUTOPLAY_DELAY = 5000;

interface IHeroSection {
  banners: Banner[];
  isError: boolean;
  isLoading: boolean;
  error: Error | null;
}

const SECTION_SIZE = `
  relative mt-[108px]
  aspect-[16/10] h-auto w-full
  sm:mt-[108px] sm:aspect-auto
  sm:h-[75vh] sm:min-h-[480px]
  md:mt-0 md:h-[100svh] md:min-h-[640px]
`;

/**
 * One responsive, optimised banner image (same optimisation as before):
 * - Served through the Next.js image optimiser, right-sized per screen.
 * - Mobile gets its own source when the banner has a mobileUrl.
 * - Only the first slide is high priority.
 */
function BannerPicture({
  banner,
  isFirst,
  onFirstSettled,
}: {
  banner: Banner;
  isFirst: boolean;
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
    loading: isFirst ? ("eager" as const) : ("lazy" as const),
    fetchPriority: isFirst ? ("high" as const) : ("low" as const),
  });
  const { props: mobile } = getImageProps({
    ...common,
    src: banner.mobileUrl || banner.url,
  });
  const { srcSet: desktopSrcSet, ...imgProps } = desktop;

  return (
    <picture>
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
        // pointer-events-none stops the browser's native image drag from
        // fighting Swiper's mouse drag on desktop.
        className="pointer-events-none absolute inset-0 block h-full w-full select-none object-cover object-[50%_25%] md:object-center"
      />
    </picture>
  );
}

/** Video banner: plays only while its slide is the active one. */
function BannerVideo({
  banner,
  isActive,
}: {
  banner: Banner;
  isActive: boolean;
}) {
  const ref = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (isActive) {
      video.play().catch(() => {
        /* autoplay can be blocked; poster stays visible */
      });
    } else {
      video.pause();
    }
  }, [isActive]);

  return (
    <video
      ref={ref}
      src={banner.url}
      poster={banner.thumbnailUrl || undefined}
      className="pointer-events-none absolute inset-0 h-full w-full object-cover object-[50%_25%] md:object-center"
      muted
      loop
      playsInline
      preload={isActive ? "auto" : "metadata"}
      aria-hidden={!isActive}
    />
  );
}

export default function HeroSection({
  banners,
  isError,
  isLoading,
}: IHeroSection) {
  const swiperRef = useRef<SwiperInstance | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [firstLoaded, setFirstLoaded] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  // Slides whose media has been mounted. Once mounted a slide stays mounted,
  // so swiping back never flashes black.
  const [mounted, setMounted] = useState<Set<number>>(() => new Set([0]));

  const totalSlides = banners.length;

  const handleFirstSettled = useCallback(() => setFirstLoaded(true), []);

  // A video first slide is "ready" immediately; a slow first image must not
  // block autoplay forever, so give up waiting after 4 seconds.
  const firstIsImage = banners[0]?.type === MediaType.IMAGE;
  const ready = firstLoaded || !firstIsImage;

  useEffect(() => {
    if (ready || totalSlides === 0) return;
    const timer = setTimeout(() => setFirstLoaded(true), 4000);
    return () => clearTimeout(timer);
  }, [ready, totalSlides]);

  // Respect "reduce motion": no autoplay, swiping still works.
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  // After the first banner is ready, load only the neighbours of the active
  // slide (next for autoplay, previous for swiping back), never all at once.
  useEffect(() => {
    if (!ready || totalSlides === 0) return;
    setMounted((prev) => {
      const next = new Set(prev);
      next.add(activeIndex);
      next.add((activeIndex + 1) % totalSlides);
      next.add((activeIndex - 1 + totalSlides) % totalSlides);
      return next.size === prev.size ? prev : next;
    });
  }, [activeIndex, ready, totalSlides]);

  // Autoplay only starts once the first banner has painted.
  useEffect(() => {
    const swiper = swiperRef.current;
    if (!swiper?.autoplay) return;
    if (ready && !reducedMotion && totalSlides > 1) {
      swiper.autoplay.start();
    } else {
      swiper.autoplay.stop();
    }
  }, [ready, reducedMotion, totalSlides]);

  // Keep the active index valid if the banner list shrinks.
  useEffect(() => {
    if (totalSlides > 0 && activeIndex >= totalSlides) {
      setActiveIndex(0);
      swiperRef.current?.slideTo(0, 0);
    }
  }, [totalSlides, activeIndex]);

  const goPrev = useCallback(() => swiperRef.current?.slidePrev(), []);
  const goNext = useCallback(() => swiperRef.current?.slideNext(), []);
  const goTo = useCallback(
    (index: number) => swiperRef.current?.slideTo(index),
    [],
  );

  // Loading state.
  if (isLoading) {
    return (
      <section
        className={`${SECTION_SIZE} flex items-center justify-center bg-black`}
      >
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/20 border-t-white" />
      </section>
    );
  }

  // Error / empty state.
  if (isError || totalSlides === 0) {
    return (
      <section
        className={`${SECTION_SIZE} flex items-center justify-center bg-black`}
      >
        <p className="text-sm text-white/70">
          {isError ? "Unable to load banners" : "No banners available"}
        </p>
      </section>
    );
  }

  return (
    <section
      data-testid="hero-banner"
      className={`${SECTION_SIZE} isolate overflow-hidden bg-black`}
      aria-roledescription="carousel"
      aria-label="Promotional banners"
    >
      {/* =====================================
          SWIPER
          Mobile: finger swipe (vertical scroll still works).
          Desktop: mouse drag, arrows, dots and arrow keys.
          Autoplay pauses while the pointer is over the hero.
      ====================================== */}
      <div className="absolute inset-0">
        <Swiper
          className="h-full w-full md:cursor-grab md:active:cursor-grabbing"
          modules={[Autoplay, Keyboard, A11y]}
          slidesPerView={1}
          speed={600}
          rewind
          grabCursor
          threshold={8}
          touchAngle={30}
          resistanceRatio={0.6}
          keyboard={{ enabled: true, onlyInViewport: true }}
          autoplay={{
            delay: AUTOPLAY_DELAY,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          a11y={{
            prevSlideMessage: "Previous slide",
            nextSlideMessage: "Next slide",
          }}
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
            if (!ready) swiper.autoplay?.stop();
          }}
          onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
        >
          {banners.map((banner, index) => {
            const isActive = index === activeIndex;
            const shouldMount =
              index === 0 || index === activeIndex || mounted.has(index);

            return (
              <SwiperSlide key={banner.id} className="!h-full">
                <div className="relative h-full w-full">
                  {shouldMount &&
                    (banner.type === MediaType.IMAGE ? (
                      <BannerPicture
                        banner={banner}
                        isFirst={index === 0}
                        onFirstSettled={handleFirstSettled}
                      />
                    ) : (
                      <BannerVideo banner={banner} isActive={isActive} />
                    ))}

                  {/* Bottom gradient keeps the text readable. */}
                  <div
                    className="absolute inset-0  from-white/75 via-white/20 to-transparent"
                    aria-hidden="true"
                  />

                  {/* Slide text travels with its own image while swiping. */}
                  <div className="absolute inset-0 flex items-end justify-center px-5 pb-14 sm:px-8 sm:pb-24">
                    <div className="mx-auto w-full max-w-5xl text-center">
                      {/* Only the first slide is the page's h1. */}
                      {index === 0 ? (
                        <h1 className={HEADING_CLASS}>
                          {banner.title || "Timeless Elegance"}
                        </h1>
                      ) : (
                        <h2 className={HEADING_CLASS}>
                          {banner.title || "Timeless Elegance"}
                        </h2>
                      )}

                      {banner.text && (
                        <p className="mx-auto mt-4 hidden max-w-3xl text-base font-light tracking-wide text-white/90 text-shadow-hero-sm sm:block lg:text-lg">
                          {banner.text}
                        </p>
                      )}

                      {banner.link && (
                        <Link
                          href={banner.link}
                          tabIndex={isActive ? 0 : -1}
                          // min-h-11 = 44px, the recommended touch target.
                          className="mt-4 inline-flex min-h-11 min-w-36 items-center justify-center border border-white bg-black/30 px-6 text-xs font-semibold uppercase tracking-[0.16em] text-white transition-colors hover:bg-white hover:text-black focus-visible:bg-white focus-visible:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black active:scale-[0.98] sm:mt-7 sm:min-w-44 sm:px-8 sm:text-sm md:bg-black/15 md:backdrop-blur-sm"
                        >
                          Explore Collection
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>

      {totalSlides > 1 && (
        <>
          {/* =====================================
              DESKTOP ARROWS (mobile uses swipe)
          ====================================== */}
          <button
            type="button"
            onClick={goPrev}
            className={`${ARROW_CLASS} left-4 lg:left-8`}
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          <button
            type="button"
            onClick={goNext}
            className={`${ARROW_CLASS} right-4 lg:right-8`}
            aria-label="Next slide"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          {/* =====================================
              SLIDE INDICATORS
              Each dot has a 32px tall tap area even though it looks small.
          ====================================== */}
          <div className="absolute bottom-3 left-1/2 z-30 flex -translate-x-1/2 items-center sm:bottom-6">
            {banners.map((banner, index) => {
              const isActive = index === activeIndex;
              return (
                <button
                  key={banner.id}
                  type="button"
                  onClick={() => goTo(index)}
                  className="group flex h-8 items-center px-1 focus-visible:outline-none"
                  aria-label={`Go to slide ${index + 1}`}
                  aria-current={isActive ? "true" : undefined}
                >
                  <span
                    className={`block rounded-full transition-[width,height,background-color] duration-300 group-focus-visible:ring-2 group-focus-visible:ring-white group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-black ${
                      isActive
                        ? "h-[3px] w-10 bg-white"
                        : "h-2 w-2 bg-white/50 group-hover:bg-white/80"
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}

const HEADING_CLASS =
  "text-xl font-semibold uppercase leading-tight tracking-[0.08em] text-white text-shadow-hero sm:text-4xl sm:tracking-[0.12em] lg:text-5xl";

const ARROW_CLASS =
  "absolute top-1/2 z-30 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-black/30 text-white backdrop-blur-md transition-all hover:scale-105 hover:bg-black/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white active:scale-95 md:flex";
