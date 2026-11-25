"use client";

import { HomeSection } from "@/lib/api/home-section.api";
import { useEffect, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { A11y, Autoplay, Keyboard } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import SmartImage from "../common/smartImage";

const AUTOPLAY_MS = 5000;

function HeroSlider({ section }: { section: HomeSection }) {
  const slides = section.media ?? [];
  const slideCount = slides.length;

  const swiperRef = useRef<SwiperType | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Play / pause button (desktop). Swiper owns the timer.
  useEffect(() => {
    const swiper = swiperRef.current;
    if (!swiper?.autoplay) return;
    if (isAutoPlaying) swiper.autoplay.start();
    else swiper.autoplay.stop();
  }, [isAutoPlaying]);

  // Hooks above must run on every render, so this early return stays below them.
  if (slideCount === 0) return null;

  const hasMultiple = slideCount > 1;
  // Swiper's loop needs 3+ slides to look right; with 2 we rewind instead.
  const useLoop = slideCount > 2;

  return (
    <section
      data-testid="hero-slider"
      // svh (not vh): iOS Safari's vh ignores the collapsing toolbar, so a
      // vh-sized hero jumps/resizes as the toolbar shows and hides.
      className="relative w-full h-svh min-h-[600px] overflow-hidden"
      style={{ backgroundColor: section.backgroundColor }}
    >
      <Swiper
        modules={[Autoplay, Keyboard, A11y]}
        className="h-full w-full select-none"
        slidesPerView={1}
        speed={600}
        // Swipe settings: touch drag on mobile, mouse drag on desktop.
        allowTouchMove={hasMultiple}
        simulateTouch={hasMultiple}
        grabCursor={hasMultiple}
        threshold={5}
        touchStartPreventDefault={false}
        loop={hasMultiple && useLoop}
        rewind={hasMultiple && !useLoop}
        keyboard={{ enabled: hasMultiple }}
        autoplay={
          hasMultiple
            ? {
                delay: AUTOPLAY_MS,
                // Keep autoplay going after a swipe; the pause button and
                // hover-pause still work.
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }
            : false
        }
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
        }}
        onSlideChange={(swiper) => setCurrentIndex(swiper.realIndex)}
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={slide.id} className="relative !h-full">
            {slide.type === "IMAGE" ? (
              <SmartImage
                src={slide.url}
                alt={slide.altText || slide.title || "Hero slide"}
                fill
                sizes="100vw"
                quality={60}
                priority={index === 0}
                loading={index === 0 ? undefined : "lazy"}
                className="object-cover"
                draggable={false}
              />
            ) : (
              <video
                src={slide.url}
                poster={slide.thumbnailUrl || undefined}
                className="w-full h-full object-cover"
                autoPlay
                loop
                muted
                playsInline
              />
            )}

            {/* Gradient overlay */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-white/75 via-white/20 to-transparent" />

            {/* Content overlay */}
            {(slide.overlayTitle || slide.overlaySubtitle) && (
              <div
                className={`absolute inset-0 flex flex-col ${
                  slide.overlayPosition === "bottom"
                    ? "justify-end pb-20 md:pb-32"
                    : "justify-center"
                } items-center text-center px-4 md:px-8`}
              >
                <div className="hero-text mx-auto max-w-5xl space-y-3 px-5 py-4 text-center sm:space-y-4 sm:px-8 sm:py-6">
                  {slide.overlayTitle && (
                    <h1 className="home-editorial-title text-2xl font-semibold uppercase leading-tight tracking-[0.08em] text-white text-shadow-hero sm:text-4xl lg:text-5xl">
                      {slide.overlayTitle}
                    </h1>
                  )}
                  {slide.overlaySubtitle && (
                    <p className="mx-auto max-w-3xl text-sm leading-relaxed text-white/90 text-shadow-hero-sm sm:text-base lg:text-lg">
                      {slide.overlaySubtitle}
                    </p>
                  )}

                  {/* CTA Buttons */}
                  {section.ctaButtons && section.ctaButtons.length > 0 && (
                    <div className="flex flex-wrap gap-4 justify-center pt-4">
                      {section.ctaButtons.map((btn) => (
                        <a
                          key={btn.id}
                          href={btn.url}
                          target={btn.openNewTab ? "_blank" : "_self"}
                          rel={btn.openNewTab ? "noopener noreferrer" : ""}
                          className={`
                            px-8 py-4 rounded-full font-semibold text-base md:text-lg transition-all duration-300 inline-flex items-center gap-3 shadow-brand-float md:backdrop-blur-sm transform hover:scale-[1.02]
                            ${
                              btn.style === "PRIMARY"
                                ? "brand-button"
                                : btn.style === "SECONDARY"
                                  ? "brand-gold-button"
                                  : "border border-white/90 bg-brand-primary-deep/20 text-white hover:bg-brand-primary hover:text-white"
                            }
                          `}
                        >
                          {btn.text}
                          {btn.icon && (
                            <span className="text-xl">{btn.icon}</span>
                          )}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Navigation Controls - only show if multiple slides */}
      {hasMultiple && (
        <>
          {/* DESKTOP ONLY ARROWS */}
          <button
            onClick={() => swiperRef.current?.slidePrev()}
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
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <button
            onClick={() => swiperRef.current?.slideNext()}
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
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>

          {/* MOBILE SWIPE INDICATOR */}
          <div className="pointer-events-none md:hidden absolute bottom-24 left-1/2 -translate-x-1/2 z-30">
            <div
              className="
        px-4 py-1.5
        rounded-full
        bg-black/35
        border border-white/10
      "
            >
              <p className="text-[10px] tracking-[0.25em] uppercase text-white/75">
                Swipe
              </p>
            </div>
          </div>

          {/* PREMIUM PAGINATION */}
          <div
            className="
      absolute bottom-10 md:bottom-12
      left-1/2 -translate-x-1/2
      z-30
      flex items-center gap-2
    "
          >
            {slides.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => {
                  if (useLoop) swiperRef.current?.slideToLoop(index);
                  else swiperRef.current?.slideTo(index);
                }}
                className="flex h-11 min-w-11 shrink-0 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                aria-label={`Go to slide ${index + 1}`}
                aria-current={index === currentIndex}
              >
                <span
                  aria-hidden="true"
                  className={`block rounded-full transition-[width,height,background-color] duration-500 ${
                    index === currentIndex
                      ? "h-[3px] w-10 bg-white"
                      : "h-2 w-2 bg-white/60"
                  }`}
                />
              </button>
            ))}
          </div>

          {/* AUTOPLAY BUTTON DESKTOP ONLY */}
          <button
            onClick={() => setIsAutoPlaying((v) => !v)}
            className="
        hidden md:flex
        absolute bottom-10 right-8 z-30
        w-10 h-10
        items-center justify-center
        rounded-full
        bg-black/20
        backdrop-blur-xl
        border border-white/10
        hover:bg-black/35
        transition-all duration-300
      "
            aria-label={isAutoPlaying ? "Pause autoplay" : "Resume autoplay"}
          >
            {isAutoPlaying ? (
              <svg
                className="w-4 h-4 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 9v6m4-6v6"
                />
              </svg>
            ) : (
              <svg
                className="w-4 h-4 text-white ml-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14.752 11.168l-6.518-3.759A1 1 0 007 8.236v7.528a1 1 0 001.234.972l6.518-3.759a1 1 0 000-1.736z"
                />
              </svg>
            )}
          </button>
        </>
      )}

      {/* Scroll indicator */}
      <div className="pointer-events-none hidden md:block absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
        <svg
          className="w-6 h-6 text-white opacity-70"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      </div>
    </section>
  );
}

export default HeroSlider;
