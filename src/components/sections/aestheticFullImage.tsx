"use client";

import { HomeSection } from "@/lib/api/home-section.api";
import { useRef, useState, type TouchEvent } from "react";
import { getImageProps } from "next/image";
import { preload } from "react-dom";
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { canOptimize } from "@/components/common/smartImage";

interface AestheticFullImageProps {
  section: HomeSection;
  /**
   * True when this section is the first thing on the page (it is then the LCP
   * element): its first image is preloaded and fetched at high priority.
   */
  priority?: boolean;
}

function SlidePicture({
  url,
  mobileUrl,
  alt,
  isLcp,
}: {
  url: string;
  mobileUrl: string;
  alt: string;
  isLcp: boolean;
}) {
  const imageUrl = mobileUrl || url;

  if (!url) return null;

  const { props: imageProps } = getImageProps({
    src: url,
    alt,
    fill: true,
    sizes: "100vw",
    unoptimized: true,
    loading: isLcp ? "eager" : "lazy",
    fetchPriority: isLcp ? "high" : "auto",
  });

  // Preload the correct original image for each viewport.
  if (isLcp) {
    preload(imageUrl, {
      as: "image",
      media: "(max-width: 767px)",
      fetchPriority: "high",
    });

    preload(url, {
      as: "image",
      media: "(min-width: 768px)",
      fetchPriority: "high",
    });
  }

  return (
    <picture className="absolute inset-0 block h-full w-full">
      {/* Dedicated mobile image */}
      {imageUrl !== url && (
        <source media="(max-width: 767px)" srcSet={imageUrl} />
      )}

      {/* Desktop image / fallback */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        {...imageProps}
        alt={alt}
        draggable={false}
        className="absolute inset-0 block h-full w-full object-cover object-center"
      />
    </picture>
  );
}

export default function AestheticFullImage({
  section,
  priority = false,
}: AestheticFullImageProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  // Slides that may be mounted. Only the current + next slide are loaded, so a
  // section with many slides doesn't download every image up front.
  const [mounted, setMounted] = useState<number[]>([0]);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  // 🔥 SMART MEDIA FALLBACK
  const media = section.media?.length
    ? section.media
    : section.products?.flatMap((p) => p.media || []) || [];

  if (!media.length) return null;

  const currentMedia = media[currentSlide];
  const displayTitle = section.customTypeName || section.title;

  // Go to a slide and make sure it and the one after it are mounted (loaded).
  const goTo = (index: number) => {
    const target = ((index % media.length) + media.length) % media.length;
    const upcoming = (target + 1) % media.length;
    setCurrentSlide(target);
    setMounted((prev) =>
      prev.includes(target) && prev.includes(upcoming)
        ? prev
        : Array.from(new Set([...prev, target, upcoming])),
    );
  };

  const nextSlide = () => goTo(currentSlide + 1);

  const prevSlide = () => goTo(currentSlide - 1);

  const handleTouchStart = (event: TouchEvent<HTMLElement>) => {
    if (event.touches.length !== 1) return;
    touchStartX.current = event.touches[0].clientX;
    touchStartY.current = event.touches[0].clientY;
  };

  const handleTouchEnd = (event: TouchEvent<HTMLElement>) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const touch = event.changedTouches[0];
    const deltaX = touchStartX.current - touch.clientX;
    const deltaY = touchStartY.current - touch.clientY;
    touchStartX.current = null;
    touchStartY.current = null;
    if (Math.abs(deltaX) < 45 || Math.abs(deltaX) <= Math.abs(deltaY)) return;
    if (deltaX > 0) nextSlide();
    else prevSlide();
  };

  const handleTouchCancel = () => {
    touchStartX.current = null;
    touchStartY.current = null;
  };

  return (
    <section
      className="
  relative isolate w-full
  h-[70vh] min-h-[420px]
  md:h-screen md:min-h-0
  overflow-hidden
  touch-pan-y select-none
"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
    >
      {/* Background Images/Videos */}
      {media.map((item, index) => {
        const shouldMount = index === 0 || mounted.includes(index);
        const imageUrl = typeof item.url === "string" ? item.url : "";
        const mobileImageUrl =
          "mobileUrl" in item && typeof item.mobileUrl === "string"
            ? item.mobileUrl
            : imageUrl;

        return (
          <div
            key={item.id ?? index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
            aria-hidden={index !== currentSlide}
          >
            {!shouldMount ? null : item.type === "IMAGE" ? (
              <SlidePicture
                url={imageUrl}
                mobileUrl={mobileImageUrl}
                alt={displayTitle || "Hero Banner"}
                isLcp={priority && index === 0}
              />
            ) : (
              <video
                src={imageUrl}
                autoPlay
                loop
                muted
                playsInline
                preload="metadata"
                className="w-full h-full object-cover"
              />
            )}

            {/* Gradient Overlay for text readability — matches Banner carousel */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.35) 25%, rgba(0,0,0,0.10) 100%)",
              }}
            />
          </div>
        );
      })}

      {/* Content Overlay - Bottom anchored, matches Banner carousel */}
      <div
        className="
  absolute inset-x-0 bottom-16
  sm:bottom-14 lg:bottom-16
  z-10 flex flex-col items-center justify-center
  px-4 text-center sm:px-12 md:px-16
"
      >
        {" "}
        {/* Subtitle / Overlay Text */}
        {((section.showSubtitle && section.subtitle) || section.title) && (
          <div className="max-w-3xl space-y-1.5 sm:space-y-2 mb-4 md:mb-6">
            {section.title && (
              <h1 className="home-editorial-title text-xl font-semibold uppercase tracking-[0.08em] text-white text-shadow-hero sm:text-3xl lg:text-4xl line-clamp-2">
                {section.title}
              </h1>
            )}

            {section.subtitle && (
              <p className="mx-auto text-xs font-normal leading-relaxed text-white/90 text-shadow-hero-sm sm:text-sm lg:text-base line-clamp-2">
                {section.subtitle}
              </p>
            )}

            {section.showSubtitle && section.subtitle && !section.title && (
              <p
                className="text-xs sm:text-sm lg:text-base text-white/90 font-light drop-shadow line-clamp-2"
                style={{ color: section.textColor || undefined }}
              >
                {section.subtitle}
              </p>
            )}
          </div>
        )}
        {/* CTA Buttons — pill style, matches Banner carousel's "Shop Now" */}
        {section.ctaButtons && section.ctaButtons.length > 0 && (
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
            {[...section.ctaButtons]
              .sort((a, b) => (a.order || 0) - (b.order || 0))
              .map((btn) => {
                const isPrimary = btn.style === "PRIMARY";
                const isSecondary = btn.style === "SECONDARY";
                const isOutline = btn.style === "OUTLINE";
                const isText = btn.style === "TEXT";

                return (
                  <a
                    key={btn.id}
                    href={btn.url}
                    aria-label={
                      section.title
                        ? `${btn.text} – ${section.title}`
                        : btn.text
                    }
                    target={btn.openNewTab ? "_blank" : "_self"}
                    rel={btn.openNewTab ? "noopener noreferrer" : undefined}
                    className={`
                      group relative overflow-hidden
                      inline-flex items-center gap-1.5
                      px-5 py-2 sm:px-6 sm:py-2.5 rounded-full
                      text-xs font-semibold uppercase tracking-widest
                      shadow-lg transition-all duration-200 transform hover:scale-105 active:scale-95
                      ${
                        isPrimary
                          ? "bg-white text-black hover:bg-neutral-100"
                          : isSecondary
                            ? "bg-black text-white hover:bg-neutral-900 border border-white/20"
                            : isOutline
                              ? "bg-transparent border-2 border-white text-white hover:bg-white hover:text-black"
                              : isText
                                ? "bg-black/20 backdrop-blur-sm text-white hover:bg-white/20"
                                : "bg-white text-black hover:bg-neutral-100"
                      }
                    `}
                  >
                    {/* Shimmer effect on hover */}
                    <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />

                    <span className="relative z-10 flex items-center gap-1.5">
                      {btn.text}
                      {btn.icon && <span className="text-sm">{btn.icon}</span>}
                      <ExternalLink className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    </span>
                  </a>
                );
              })}
          </div>
        )}
      </div>

      {/* Navigation Arrows (if multiple slides) — circular, matches Banner carousel */}
      {media.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            aria-label="Previous slide"
            className="hidden md:flex absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/50 hover:bg-black/70 text-white backdrop-blur-md border border-white/20 items-center justify-center shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-white/80 active:scale-95"
          >
            <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>

          <button
            onClick={nextSlide}
            aria-label="Next slide"
            className="hidden md:flex absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/50 hover:bg-black/70 text-white backdrop-blur-md border border-white/20 items-center justify-center shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-white/80 active:scale-95"
          >
            <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>

          <div
            className="md:hidden absolute bottom-10 left-1/2 -translate-x-1/2 z-20 rounded-full bg-black/45 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-white/90 backdrop-blur-sm"
            aria-hidden="true"
          >
            Swipe
          </div>

          {/* Consistent slide indicators */}
          <div
            className="absolute bottom-3 md:bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2"
            role="tablist"
            aria-label="Slide pagination"
          >
            {media.map((_, index) => {
              const isActive = index === currentSlide;
              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => goTo(index)}
                  aria-label={`Go to slide ${index + 1}`}
                  aria-current={isActive ? "true" : undefined}
                  className="flex h-11 min-w-11 shrink-0 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black"
                >
                  <span
                    aria-hidden="true"
                    className={`block rounded-full transition-all duration-300 ${
                      isActive
                        ? "h-[3px] w-8 bg-white"
                        : "h-2 w-2 bg-white/60 hover:bg-white"
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
