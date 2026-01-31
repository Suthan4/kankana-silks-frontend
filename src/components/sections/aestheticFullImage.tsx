"use client";

import { HomeSection } from "@/lib/api/home-section.api";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
    <section className="relative w-full h-screen overflow-hidden">
      {/* Background Images/Videos */}
      {media.map((item, index) => (
        <div
          key={item.id ?? index}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide ? "opacity-100" : "opacity-0"
          }`}
        >
          {item.type === "IMAGE" ? (
            <img
              src={item.url}
              alt={displayTitle}
              className="w-full h-full object-cover"
            />
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

          {/* Gradient Overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40" />
        </div>
      ))}

      {/* Content Overlay - Centered */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-4 md:px-8 text-center">
        {/* Main Title */}
        {section.showTitle && section.title && (
          <h1
            className={`text-4xl md:text-6xl lg:text-7xl xl:text-8xl 
                       font-light uppercase mb-6 md:mb-8
                       transition-all duration-1000 ${
                         isVisible
                           ? "opacity-100 translate-y-0"
                           : "opacity-0 translate-y-5"
                       }`}
            style={{
              color: section.textColor || "#ffffff",
              textShadow: "0 2px 20px rgba(0,0,0,0.3)",
              letterSpacing: "0.2em",
            }}
          >
            {displayTitle}
          </h1>
        )}

        {/* Subtitle / Overlay Text */}
        {((section.showSubtitle && section.subtitle) ||
          section.title) && (
          <div
            className={`max-w-3xl space-y-3 md:space-y-4 mb-8 md:mb-12
                       transition-all duration-1000 delay-200 ${
                         isVisible
                           ? "opacity-100 translate-y-0"
                           : "opacity-0 translate-y-5"
                       }`}
          >
            {section.title && (
              <p
                className="text-xl md:text-3xl lg:text-4xl font-light"
                style={{
                  color: section.textColor || "#ffffff",
                  textShadow: "0 2px 15px rgba(0,0,0,0.5)",
                  letterSpacing: "0.05em",
                }}
              >
                {section.title}
              </p>
            )}

            {section.subtitle && (
              <p
                className="text-sm md:text-base lg:text-lg font-light uppercase opacity-90"
                style={{
                  color: section.textColor || "#ffffff",
                  textShadow: "0 2px 15px rgba(0,0,0,0.5)",
                  letterSpacing: "0.15em",
                }}
              >
                {section.subtitle}
              </p>
            )}

            {section.showSubtitle &&
              section.subtitle &&
              !section.title && (
                <p
                  className="text-base md:text-xl lg:text-2xl font-light opacity-90"
                  style={{
                    color: section.textColor || "#ffffff",
                    textShadow: "0 2px 15px rgba(0,0,0,0.5)",
                    letterSpacing: "0.05em",
                  }}
                >
                  {section.subtitle}
                </p>
              )}
          </div>
        )}

        {/* CTA Buttons */}
        {section.ctaButtons && section.ctaButtons.length > 0 && (
          <div
            className={`flex flex-wrap justify-center gap-4 md:gap-6
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
                      px-8 md:px-12 py-3 md:py-4
                      text-sm md:text-base font-light uppercase
                      transition-all duration-500
                      ${
                        isPrimary
                          ? "bg-white text-black hover:bg-black hover:text-white border-2 border-white"
                          : isSecondary
                            ? "bg-black text-white hover:bg-white hover:text-black border-2 border-white"
                            : isOutline
                              ? "bg-transparent border-2 border-white text-white hover:bg-white hover:text-black"
                              : "bg-black/20 backdrop-blur-sm text-white hover:bg-white/20"
                      }
                    `}
                    style={{
                      letterSpacing: "0.2em",
                    }}
                  >
                    {/* Shimmer effect on hover */}
                    <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />

                    <span className="relative z-10 flex items-center gap-2">
                      {btn.text}
                      {btn.icon && <span className="text-lg">{btn.icon}</span>}
                    </span>
                  </a>
                );
              })}
          </div>
        )}
      </div>

      {/* Navigation Arrows (if multiple slides) */}
      {media.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 md:left-8 top-1/2 z-20 -translate-y-1/2
                       w-12 h-12 md:w-16 md:h-16
                       flex items-center justify-center
                       bg-white/10 hover:bg-white/20 backdrop-blur-sm
                       border border-white/30 transition-all group"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-6 h-6 md:w-8 md:h-8 text-white transition-transform group-hover:scale-110" />
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-4 md:right-8 top-1/2 z-20 -translate-y-1/2
                       w-12 h-12 md:w-16 md:h-16
                       flex items-center justify-center
                       bg-white/10 hover:bg-white/20 backdrop-blur-sm
                       border border-white/30 transition-all group"
            aria-label="Next slide"
          >
            <ChevronRight className="w-6 h-6 md:w-8 md:h-8 text-white transition-transform group-hover:scale-110" />
          </button>

          {/* Slide Indicators */}
          <div className="absolute bottom-8 md:bottom-12 left-1/2 z-20 -translate-x-1/2 flex gap-2 md:gap-3">
            {media.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-2 md:h-3 rounded-full transition-all duration-300 ${
                  index === currentSlide
                    ? "bg-white w-8 md:w-12"
                    : "bg-white/40 w-2 md:w-3 hover:bg-white/60"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
