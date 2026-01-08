"use client";

import { HomeSection } from "@/lib/api/home-section.api.service";
import { useState, useEffect } from "react";

function HeroSlider({ section }: { section: HomeSection }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  if (!section.media || section.media.length === 0) return null;

  const slides = section.media;
  const currentSlide = slides[currentIndex];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
  };

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying || slides.length <= 1) return;

    const interval = setInterval(handleNext, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, currentIndex, slides.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <section
      className="relative w-full h-screen min-h-[600px] overflow-hidden"
      style={{ backgroundColor: section.backgroundColor }}
    >
      {/* Slides */}
      <div className="relative w-full h-full">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-all duration-1000 ${
              index === currentIndex
                ? "opacity-100 scale-100"
                : "opacity-0 scale-105"
            }`}
          >
            {slide.type === "IMAGE" ? (
              <img
                src={slide.url}
                alt={slide.altText || slide.title || "Hero slide"}
                className="w-full h-full object-cover"
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
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

            {/* Content overlay */}
            {(slide.overlayTitle || slide.overlaySubtitle) && (
              <div
                className={`absolute inset-0 flex flex-col ${
                  slide.overlayPosition === "bottom"
                    ? "justify-end pb-20 md:pb-32"
                    : "justify-center"
                } items-center text-center px-4 md:px-8`}
              >
                <div
                  className={`max-w-5xl mx-auto space-y-4 md:space-y-6 ${
                    index === currentIndex ? "animate-slideUp" : ""
                  }`}
                >
                  {slide.overlayTitle && (
                    <h1
                      className="text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-white tracking-tight leading-tight drop-shadow-2xl"
                      style={{ animationDelay: "0.2s" }}
                    >
                      {slide.overlayTitle}
                    </h1>
                  )}
                  {slide.overlaySubtitle && (
                    <p
                      className="text-lg md:text-2xl lg:text-3xl text-white/90 max-w-3xl mx-auto leading-relaxed drop-shadow-lg"
                      style={{ animationDelay: "0.4s" }}
                    >
                      {slide.overlaySubtitle}
                    </p>
                  )}

                  {/* CTA Buttons */}
                  {section.ctaButtons && section.ctaButtons.length > 0 && (
                    <div
                      className="flex flex-wrap gap-4 justify-center pt-4"
                      style={{ animationDelay: "0.6s" }}
                    >
                      {section.ctaButtons.map((btn) => (
                        <a
                          key={btn.id}
                          href={btn.url}
                          target={btn.openNewTab ? "_blank" : "_self"}
                          rel={btn.openNewTab ? "noopener noreferrer" : ""}
                          className={`
                            px-8 py-4 rounded-full font-semibold text-base md:text-lg transition-all duration-300 inline-flex items-center gap-3 shadow-2xl backdrop-blur-sm transform hover:scale-105
                            ${
                              btn.style === "PRIMARY"
                                ? "bg-white text-gray-900 hover:bg-gray-100"
                                : btn.style === "SECONDARY"
                                ? "bg-gray-900 text-white hover:bg-gray-800"
                                : "border-2 border-white text-white hover:bg-white hover:text-gray-900"
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
      {slides.length > 1 && (
        <>
          {/* Previous/Next Buttons */}
          <button
            onClick={handlePrev}
            onMouseEnter={() => setIsAutoPlaying(false)}
            className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 md:w-16 md:h-16 bg-white/10 backdrop-blur-xl rounded-full shadow-lg flex items-center justify-center hover:bg-white/20 hover:scale-110 transition-all duration-300 border border-white/20"
            aria-label="Previous slide"
          >
            <svg
              className="w-6 h-6 md:w-8 md:h-8 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <button
            onClick={handleNext}
            onMouseEnter={() => setIsAutoPlaying(false)}
            className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 md:w-16 md:h-16 bg-white/10 backdrop-blur-xl rounded-full shadow-lg flex items-center justify-center hover:bg-white/20 hover:scale-110 transition-all duration-300 border border-white/20"
            aria-label="Next slide"
          >
            <svg
              className="w-6 h-6 md:w-8 md:h-8 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>

          {/* Pagination Indicators */}
          <div className="absolute bottom-8 md:bottom-12 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`transition-all duration-300 rounded-full ${
                  index === currentIndex
                    ? "w-12 h-2 bg-white"
                    : "w-2 h-2 bg-white/40 hover:bg-white/70"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          {/* Auto-play toggle */}
          <button
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            className="absolute bottom-8 md:bottom-12 right-8 z-20 w-10 h-10 bg-white/10 backdrop-blur-xl rounded-full shadow-lg flex items-center justify-center hover:bg-white/20 transition-all duration-300 border border-white/20"
            aria-label={isAutoPlaying ? "Pause autoplay" : "Resume autoplay"}
          >
            {isAutoPlaying ? (
              <svg
                className="w-5 h-5 text-white"
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
                className="w-5 h-5 text-white ml-0.5"
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
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
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
