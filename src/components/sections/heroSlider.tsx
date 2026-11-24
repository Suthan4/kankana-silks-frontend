"use client";

import { HomeSection } from "@/lib/api/home-section.api";
import { useCallback, useEffect, useRef, useState, type TouchEvent } from "react";
import SmartImage from "../common/smartImage";

const AUTOPLAY_MS = 5000;
const MIN_SWIPE_DISTANCE = 50;

function HeroSlider({ section }: { section: HomeSection }) {
  const slides = section.media ?? [];
  const slideCount = slides.length;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Touch tracking lives in refs: storing it in state re-rendered the whole
  // slider (and its full-screen images) on every touchmove, which janks on iOS.
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % slideCount);
  }, [slideCount]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + slideCount) % slideCount);
  }, [slideCount]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
  };

  const onTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    if (event.touches.length !== 1) return;
    setIsAutoPlaying(false);
    touchStartX.current = event.touches[0].clientX;
    touchStartY.current = event.touches[0].clientY;
  };

  const onTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const touch = event.changedTouches[0];
    const deltaX = touchStartX.current - touch.clientX;
    const deltaY = touchStartY.current - touch.clientY;
    touchStartX.current = null;
    touchStartY.current = null;
    if (Math.abs(deltaX) < MIN_SWIPE_DISTANCE || Math.abs(deltaX) <= Math.abs(deltaY)) return;
    if (deltaX > 0) handleNext();
    else handlePrev();
  };

  // Auto-play. currentIndex is a dependency so a manual change restarts the timer.
  useEffect(() => {
    if (!isAutoPlaying || slideCount <= 1) return;

    const interval = setInterval(handleNext, AUTOPLAY_MS);
    return () => clearInterval(interval);
  }, [isAutoPlaying, currentIndex, slideCount, handleNext]);

  // Keyboard navigation
  useEffect(() => {
    if (slideCount <= 1) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [slideCount, handleNext, handlePrev]);

  // Hooks above must run on every render, so this early return stays below them.
  if (slideCount === 0) return null;

  return (
    <section
      data-testid="hero-slider"
      // svh (not vh): iOS Safari's vh ignores the collapsing toolbar, so a
      // vh-sized hero jumps/resizes as the toolbar shows and hides.
      className="relative w-full h-svh min-h-[600px] overflow-hidden"
      style={{ backgroundColor: section.backgroundColor }}
    >
      {/* Slides */}
      <div
        className="
  relative w-full h-full
  touch-pan-y
  select-none
  overscroll-x-contain
"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className="hero-slide"
            data-active={index === currentIndex}
            aria-hidden={index !== currentIndex}
          >
            {slide.type === "IMAGE" ? (
              <SmartImage
                src={slide.url}
                alt={slide.altText || slide.title || "Hero slide"}
                fill
                sizes="100vw"
                quality={60}
                // Eager for every slide: a lazy image is fetched and decoded only
                // when first shown, which flashes blank on iOS mid-transition.
                loading="eager"
                className="object-cover"
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
            <div className="absolute inset-0 bg-gradient-to-t from-white/75 via-white/20 to-transparent" />

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
          </div>
        ))}
      </div>

      {/* Navigation Controls - only show if multiple slides */}
      {/* Navigation Controls */}
      {slides.length > 1 && (
        <>
          {/* DESKTOP ONLY ARROWS */}
          <button
            onClick={handlePrev}
            onMouseEnter={() => setIsAutoPlaying(false)}
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
            onClick={handleNext}
            onMouseEnter={() => setIsAutoPlaying(false)}
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
          <div className="md:hidden absolute bottom-24 left-1/2 -translate-x-1/2 z-30">
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
                onClick={() => goToSlide(index)}
                className={`
            rounded-full
            transition-[width,height,background-color] duration-500
            ${
              index === currentIndex
                ? "w-10 h-[3px] bg-white"
                : "w-2 h-2 bg-white/35"
            }
          `}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          {/* AUTOPLAY BUTTON DESKTOP ONLY */}
          <button
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
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
      <div className="hidden md:block absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
        {" "}
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
