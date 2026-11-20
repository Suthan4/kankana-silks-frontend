"use client";

import { HomeSection } from "@/lib/api/home-section.api";
import { useState, useEffect } from "react";
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

/**
 * One full-width responsive slide image.
 * Served through the Next.js optimiser (right-sized WebP per screen) instead of
 * the original multi-megabyte upload, with a separate mobile source when the
 * media has a mobileUrl.
 */
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
  // Unknown host (not in next.config remotePatterns): plain <img>, no crash.
  if (!canOptimize(url) || !canOptimize(mobileUrl)) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt={alt}
        className="absolute inset-0 h-full w-full object-cover object-center"
        loading={isLcp ? "eager" : "lazy"}
      />
    );
  }

  const common = {
    alt,
    fill: true,
    sizes: "100vw",
    quality: 60,
  } as const;

  const { props: desktop } = getImageProps({
    ...common,
    src: url,
    loading: isLcp ? ("eager" as const) : ("lazy" as const),
    fetchPriority: isLcp ? ("high" as const) : ("auto" as const),
  });
  const { props: mobile } = getImageProps({ ...common, src: mobileUrl });
  const { srcSet: desktopSrcSet, ...imgProps } = desktop;

  // <picture> images are not preloaded by default, so tell the browser about
  // the LCP image in <head> (one hint per screen size) before JS runs.
  if (isLcp) {
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
    <picture className="absolute inset-0 block h-full w-full">
      <source media="(max-width: 767px)" srcSet={mobile.srcSet} sizes="100vw" />
      <source media="(min-width: 768px)" srcSet={desktopSrcSet} sizes="100vw" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        {...imgProps}
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
  const [isVisible, setIsVisible] = useState(false);
  // Slides that may be mounted. Only the current + next slide are loaded, so a
  // section with many slides doesn't download every image up front.
  const [mounted, setMounted] = useState<number[]>([0]);
  // 🔥 SMART MEDIA FALLBACK
  const media = section.media?.length
    ? section.media
    : section.products?.flatMap((p) => p.media || []) || [];
  useEffect(() => {
    setIsVisible(true);
  }, []);

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

  return (
    <section className="relative w-full h-[70vh] md:h-screen overflow-hidden">
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
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/10" />
          </div>
        );
      })}

      {/* Content Overlay - Bottom anchored, matches Banner carousel */}
      <div className="absolute inset-x-0 bottom-8 sm:bottom-14 lg:bottom-16 z-10 px-6 sm:px-12 md:px-16 text-center flex flex-col items-center justify-center">
        {/* Subtitle / Overlay Text */}
        {((section.showSubtitle && section.subtitle) || section.title) && (
          <div
            className={`max-w-3xl space-y-1.5 sm:space-y-2 mb-4 md:mb-6
                       transition-all duration-1000 delay-200 ${
                         isVisible
                           ? "opacity-100 translate-y-0"
                           : "opacity-0 translate-y-5"
                       }`}
          >
            {section.title && (
              <h1
                className="text-xl sm:text-3xl lg:text-4xl font-extrabold uppercase tracking-wider text-white drop-shadow-lg line-clamp-1"
                style={{ color: "#ffffff" }}
              >
                {section.title}
              </h1>
            )}

            {section.subtitle && (
              <p
                className="text-xs sm:text-sm lg:text-base text-white/90 font-light drop-shadow line-clamp-2"
                style={{ color: section.textColor || undefined }}
              >
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
          <div
            className={`flex flex-wrap justify-center gap-3 sm:gap-4
                       transition-all duration-1000 delay-[400ms] ${
                         isVisible
                           ? "opacity-100 translate-y-0"
                           : "opacity-0 translate-y-5"
                       }`}
          >
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
            className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-white/80 active:scale-95"
          >
            <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>

          <button
            onClick={nextSlide}
            aria-label="Next slide"
            className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-white/80 active:scale-95"
          >
            <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>

          {/* Slide Indicators — pill dot bar, matches Banner carousel */}
          <div
            className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/85 backdrop-blur-md shadow-md border border-white/40"
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
    </section>
  );
}
