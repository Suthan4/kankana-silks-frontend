"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import SmartImage from "@/components/common/smartImage";
import { AnimatePresence, motion } from "framer-motion";
import { useModalScrollLock } from "@/hooks/useModalScrollLock";
import {
  ChevronLeft,
  ChevronRight,
  Expand,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";

interface ZoomGalleryProps {
  images: any[];
  selectedImageIndex: number;
  setSelectedImageIndex: (idx: number) => void;
  prevImage: () => void;
  nextImage: () => void;
  product: any;
  discount: number;
  isOutOfStock: boolean;
}

export function ZoomGallery({
  images,
  selectedImageIndex,
  setSelectedImageIndex,
  prevImage,
  nextImage,
  product,
  discount,
  isOutOfStock,
}: ZoomGalleryProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [loadedImageUrls, setLoadedImageUrls] = useState<string[]>([]);
  const [isHoverZoomed, setIsHoverZoomed] = useState(false);
  const [hoverOrigin, setHoverOrigin] = useState("50% 50%");
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isLightboxZoomed, setIsLightboxZoomed] = useState(false);
  useModalScrollLock(isLightboxOpen);

  const imageContainerRef = useRef<HTMLDivElement>(null);
  const swiperRef = useRef<SwiperType | null>(null);
  const zoomTriggerRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const lightboxRef = useRef<HTMLDivElement>(null);

  const activeImage = images?.[selectedImageIndex] ?? images?.[0] ?? null;
  const activeImageUrl = activeImage?.url ?? null;
  const isMainImageLoaded =
    Boolean(activeImageUrl) && loadedImageUrls.includes(activeImageUrl);
  const safeSelectedIndex = Math.min(
    Math.max(selectedImageIndex, 0),
    Math.max(images.length - 1, 0),
  );

  useEffect(() => {
    const updateViewport = () => setIsMobile(window.innerWidth < 768);
    updateViewport();
    window.addEventListener("resize", updateViewport);
    return () => window.removeEventListener("resize", updateViewport);
  }, []);

  // Keep swipe position in sync with thumbnail selection and variant changes.
  useEffect(() => {
    const swiper = swiperRef.current;
    if (!swiper || swiper.destroyed) return;
    if (swiper.activeIndex !== selectedImageIndex) {
      swiper.slideTo(selectedImageIndex);
    }
  }, [selectedImageIndex]);

  // Reset transient zoom states whenever the active product image changes.
  useEffect(() => {
    setIsHoverZoomed(false);
    setHoverOrigin("50% 50%");
    setIsLightboxZoomed(false);
  }, [activeImageUrl]);

  // The image itself controls the loading flag; no duplicate preload request.
  const handleMainImageLoad = useCallback((imageUrl: string | null) => {
    if (!imageUrl) return;
    setLoadedImageUrls((current) =>
      current.includes(imageUrl) ? current : [...current, imageUrl],
    );
  }, []);

  const handleMainImageError = useCallback((imageUrl: string | null) => {
    setLoadedImageUrls((current) => current.filter((url) => url !== imageUrl));
    setIsHoverZoomed(false);
    setIsLightboxZoomed(false);
  }, []);

  const handleHoverMove = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (!isMainImageLoaded) return;
      const rect = event.currentTarget.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const x = Math.max(
        0,
        Math.min(100, ((event.clientX - rect.left) / rect.width) * 100),
      );
      const y = Math.max(
        0,
        Math.min(100, ((event.clientY - rect.top) / rect.height) * 100),
      );
      setHoverOrigin(`${x}% ${y}%`);
    },
    [isMainImageLoaded],
  );

  const openLightbox = useCallback(() => {
    if (!isMainImageLoaded || !activeImageUrl) return;
    setIsHoverZoomed(false);
    setIsLightboxZoomed(false);
    setIsLightboxOpen(true);
  }, [activeImageUrl, isMainImageLoaded]);

  const closeLightbox = useCallback(() => {
    setIsLightboxOpen(false);
    setIsLightboxZoomed(false);
    window.requestAnimationFrame(() => zoomTriggerRef.current?.focus());
  }, []);

  useEffect(() => {
    if (!isLightboxOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Tab") {
        const focusable = lightboxRef.current?.querySelectorAll<HTMLElement>(
          'button:not(:disabled), [href], [tabindex]:not([tabindex="-1"])',
        );
        if (focusable?.length) {
          const first = focusable[0];
          const last = focusable[focusable.length - 1];
          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
          }
        }
        return;
      }

      if (event.key === "Escape") {
        event.preventDefault();
        closeLightbox();
      } else if (event.key === "ArrowLeft" && images.length > 1) {
        event.preventDefault();
        prevImage();
      } else if (event.key === "ArrowRight" && images.length > 1) {
        event.preventDefault();
        nextImage();
      } else if (event.key === "+" || event.key === "=") {
        event.preventDefault();
        setIsLightboxZoomed(true);
      } else if (event.key === "-") {
        event.preventDefault();
        setIsLightboxZoomed(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    closeButtonRef.current?.focus();

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isLightboxOpen, images.length, prevImage, nextImage, closeLightbox]);

  if (!images?.length) {
    return (
      <div className="flex min-h-[320px] w-full items-center justify-center rounded-xl bg-[#f8f5f2] text-sm text-stone-500">
        Product image unavailable
      </div>
    );
  }

  return (
    <>
      {/* Mobile: swipe first, tap the zoom control to open the dedicated viewer. */}
      <div className="w-full md:hidden">
        <div className="relative overflow-hidden rounded-2xl bg-[#f8f5f2]">
          <Swiper
            onSwiper={(swiper) => {
              swiperRef.current = swiper;
            }}
            slidesPerView={1}
            spaceBetween={0}
            onSlideChange={(swiper) => {
              if (swiper.activeIndex !== selectedImageIndex) {
                setSelectedImageIndex(swiper.activeIndex);
              }
            }}
            className="w-full"
          >
            {images.map((img, idx) => (
              <SwiperSlide key={img.id ?? img.url ?? idx}>
                <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#f8f5f2]">
                  <SmartImage
                    src={img.url}
                    alt={product?.name ?? "Product image"}
                    fill
                    priority={idx === 0}
                    quality={95}
                    sizes="100vw"
                    className="object-cover object-top"
                    onLoad={() => handleMainImageLoad(img.url)}
                    onError={() => handleMainImageError(img.url)}
                  />

                  {idx === selectedImageIndex &&
                    discount > 0 &&
                    !isOutOfStock && (
                      <div className="absolute left-3 top-9 z-10 rounded-full bg-main-primary px-2.5 py-1 text-xs font-semibold text-main-secondary">
                        {discount}% OFF
                      </div>
                    )}

                  {idx === selectedImageIndex && (
                    <button
                      type="button"
                      aria-label="Open image zoom viewer"
                      onClick={openLightbox}
                      disabled={!isMainImageLoaded}
                      className="absolute bottom-3 right-3 z-20 inline-flex h-10 items-center gap-2 rounded-full border border-white/70 bg-white/95 px-3 text-xs font-medium text-stone-900 shadow-sm backdrop-blur transition hover:bg-white disabled:cursor-wait disabled:opacity-60"
                    >
                      <Expand className="h-4 w-4" />
                      View details
                    </button>
                  )}
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {images.length > 1 && (
            <div className="pointer-events-none absolute left-3 right-3 top-3 z-10 flex gap-1">
              {images.map((_, idx) => (
                <div
                  key={idx}
                  className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/50"
                >
                  <motion.div
                    className="h-full bg-stone-900"
                    initial={false}
                    animate={{
                      width: idx <= safeSelectedIndex ? "100%" : "0%",
                    }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                  />
                </div>
              ))}
            </div>
          )}

          {images.length > 1 && (
            <div className="absolute bottom-4 left-3 z-10 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur">
              {safeSelectedIndex + 1} / {images.length}
            </div>
          )}
        </div>
      </div>

      {/* Desktop: contained hover zoom, never a floating panel over product details. */}
      <div
        className="hidden w-full gap-3 md:flex"
        style={{ height: "clamp(360px, 48vw, 650px)" }}
      >
        {images.length > 1 && (
          <div className="flex w-[72px] shrink-0 flex-col gap-2 overflow-y-auto pr-1">
            {images.map((img, idx) => (
              <button
                type="button"
                key={img.id ?? img.url ?? idx}
                onClick={() => setSelectedImageIndex(idx)}
                aria-label={`View product image ${idx + 1}`}
                aria-pressed={safeSelectedIndex === idx}
                className={`relative h-[92px] w-[64px] shrink-0 overflow-hidden rounded-lg border-2 bg-[#f8f5f2] transition ${safeSelectedIndex === idx ? "border-stone-900 opacity-100" : "border-transparent opacity-65 hover:opacity-100"}`}
              >
                <SmartImage
                  src={img.url}
                  alt=""
                  fill
                  sizes="64px"
                  quality={80}
                  loading="lazy"
                  className="object-cover object-top"
                />
              </button>
            ))}
          </div>
        )}

        <div className="relative min-w-0 flex-1">
          <div
            ref={imageContainerRef}
            className="group relative h-full w-full overflow-hidden rounded-2xl bg-[#f8f5f2]"
            onMouseEnter={() => {
              if (isMainImageLoaded && !isMobile) setIsHoverZoomed(true);
            }}
            onMouseLeave={() => setIsHoverZoomed(false)}
            onMouseMove={(event) => {
              if (isMainImageLoaded && !isMobile) {
                setIsHoverZoomed(true);
                handleHoverMove(event);
              }
            }}
          >
            {activeImageUrl && (
              <SmartImage
                key={activeImageUrl}
                src={activeImageUrl}
                alt={product?.name ?? "Product image"}
                fill
                priority={safeSelectedIndex === 0}
                quality={95}
                sizes="(max-width: 768px) 100vw, 48vw"
                className="select-none object-cover object-top transition-transform duration-200 ease-out will-change-transform"
                style={{
                  transform:
                    isHoverZoomed && isMainImageLoaded
                      ? "scale(1.45)"
                      : "scale(1)",
                  transformOrigin: hoverOrigin,
                }}
                onLoad={() => handleMainImageLoad(activeImageUrl)}
                onError={() => handleMainImageError(activeImageUrl)}
                draggable={false}
              />
            )}

            {discount > 0 && !isOutOfStock && (
              <div className="pointer-events-none absolute left-4 top-4 z-10 rounded-full bg-main-primary px-3 py-1.5 text-xs font-semibold text-main-secondary shadow-sm">
                {discount}% OFF
              </div>
            )}

            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    prevImage();
                  }}
                  aria-label="Previous product image"
                  className="absolute left-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-white/90 text-stone-900 shadow-sm backdrop-blur transition hover:scale-105 hover:bg-white"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    nextImage();
                  }}
                  aria-label="Next product image"
                  className="absolute right-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-white/90 text-stone-900 shadow-sm backdrop-blur transition hover:scale-105 hover:bg-white"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}

            <button
              ref={zoomTriggerRef}
              type="button"
              onClick={openLightbox}
              aria-label="Open fullscreen product image viewer"
              disabled={!isMainImageLoaded}
              className="absolute bottom-4 right-4 z-20 inline-flex h-10 items-center gap-2 rounded-full border border-white/70 bg-white/95 px-3.5 text-xs font-medium text-stone-900 shadow-sm backdrop-blur transition hover:bg-white disabled:cursor-wait disabled:opacity-60"
            >
              <Expand className="h-4 w-4" />
              Full view
            </button>

            <div className="pointer-events-none absolute bottom-4 left-4 z-10 hidden rounded-full bg-black/50 px-3 py-1.5 text-[11px] text-white opacity-0 backdrop-blur transition-opacity duration-200 group-hover:opacity-100 lg:block">
              Hover to inspect details
            </div>
          </div>
        </div>
      </div>

      {/* Dedicated lightbox: the zoomed image stays inside the viewport and no
          longer overlaps the product actions, sticky bar, or details section. */}
      <AnimatePresence>
        {isLightboxOpen && activeImageUrl && (
          <motion.div
            key="product-image-lightbox"
            role="dialog"
            aria-modal="true"
            aria-label={`Image viewer for ${product?.name ?? "product"}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) closeLightbox();
            }}
            ref={lightboxRef}
            className="ios-product-lightbox ios-modal-motion fixed inset-0 z-[10000] flex flex-col bg-[#121212]/[0.97] text-white"
          >
            <header className="relative z-10 flex min-h-[68px] items-center justify-between gap-4 border-b border-white/10 px-4 py-3 sm:px-7">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium sm:text-base">
                  {product?.name ?? "Product image"}
                </p>
                <p className="mt-0.5 text-xs text-white/55">
                  {safeSelectedIndex + 1} of {images.length}
                  {isLightboxZoomed ? " · Zoomed in" : " · Full image"}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsLightboxZoomed((value) => !value)}
                  aria-label={isLightboxZoomed ? "Zoom out" : "Zoom in"}
                  title={isLightboxZoomed ? "Zoom out" : "Zoom in"}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/10 transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
                >
                  {isLightboxZoomed ? (
                    <ZoomOut className="h-5 w-5" />
                  ) : (
                    <ZoomIn className="h-5 w-5" />
                  )}
                </button>
                <button
                  ref={closeButtonRef}
                  type="button"
                  onClick={closeLightbox}
                  aria-label="Close image viewer"
                  title="Close (Esc)"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/10 transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </header>

            <div className="ios-lightbox-stage relative flex min-h-0 flex-1 items-center justify-center overflow-hidden px-3 py-4 sm:px-16 sm:py-5">
              {" "}
              {images.length > 1 && (
                <button
                  type="button"
                  onClick={prevImage}
                  aria-label="Previous image"
                  className="absolute left-2 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-white/10 transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 sm:left-5 sm:h-12 sm:w-12"
                >
                  <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>
              )}
              <div className="relative h-full w-full max-w-6xl overflow-hidden">
                <SmartImage
                  key={`lightbox-${activeImageUrl}`}
                  src={activeImageUrl}
                  alt={product?.name ?? "Product image"}
                  fill
                  priority
                  quality={100}
                  sizes="100vw"
                  className={`select-none object-contain transition-transform duration-200 ease-out ${isLightboxZoomed ? "cursor-zoom-out" : "cursor-zoom-in"}`}
                  style={{
                    transform: isLightboxZoomed ? "scale(1.8)" : "scale(1)",
                  }}
                  onClick={() => setIsLightboxZoomed((value) => !value)}
                  draggable={false}
                />
              </div>
              {images.length > 1 && (
                <button
                  type="button"
                  onClick={nextImage}
                  aria-label="Next image"
                  className="absolute right-2 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-white/10 transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 sm:right-5 sm:h-12 sm:w-12"
                >
                  <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>
              )}
            </div>

            {images.length > 1 && (
              <footer className="flex shrink-0 items-center justify-center gap-2 overflow-x-auto border-t border-white/10 px-4 py-3">
                {images.map((img, idx) => (
                  <button
                    type="button"
                    key={img.id ?? img.url ?? idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    aria-label={`Open image ${idx + 1}`}
                    aria-pressed={safeSelectedIndex === idx}
                    className={`relative h-14 w-11 shrink-0 overflow-hidden rounded-md border-2 transition sm:h-16 sm:w-12 ${safeSelectedIndex === idx ? "border-white opacity-100" : "border-white/15 opacity-55 hover:opacity-100"}`}
                  >
                    <SmartImage
                      src={img.url}
                      alt=""
                      fill
                      sizes="48px"
                      quality={75}
                      loading="lazy"
                      className="object-cover object-top"
                    />
                  </button>
                ))}
              </footer>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
