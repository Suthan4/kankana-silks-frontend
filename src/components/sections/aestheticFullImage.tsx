"use client";

import { HomeSection } from "@/lib/api/home-section.api";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";

interface AestheticFullImageProps {
  section: HomeSection;
}

export default function AestheticFullImage({
  section,
}: AestheticFullImageProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
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

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % media.length);

  const prevSlide = () =>
    setCurrentSlide((prev) => (prev - 1 + media.length) % media.length);

  return (
    <section className="relative w-full h-[70vh] md:h-screen overflow-hidden">
      {/* Background Images/Videos */}
      {media.map((item, index) => (
        <div
          key={item.id ?? index}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide ? "opacity-100" : "opacity-0"
          }`}
        >
          {item.type === "IMAGE" ? (
            <picture className="w-full h-full block">
              {/* Mobile Viewport (< 768px) */}
              <source
                media="(max-width: 767px)"
                srcSet={
                  ("mobileUrl" in item && item.mobileUrl)
                    ? item.mobileUrl
                    : item.url
                }
              />
              {/* Desktop Viewport (>= 768px) */}
              <source
                media="(min-width: 768px)"
                srcSet={item.url}
              />
              {/* Fallback Image */}
              <img
                src={item.url}
                alt={displayTitle || "Hero Banner"}
                className="w-full h-full object-cover object-center"
                loading="eager"
              />
            </picture>
          ) : (
            <video
              src={item.url}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
            />
          )}

          {/* Gradient Overlay for text readability — matches Banner carousel */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/10" />
        </div>
      ))}

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
            {section.ctaButtons
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
                  onClick={() => setCurrentSlide(index)}
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
