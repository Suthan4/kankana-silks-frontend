"use client";
import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
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

interface RenderedImageRect {
  x: number;
  y: number;
  w: number;
  h: number;
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
  const [isHovering, setIsHovering] = useState(false);
  const [lensPos, setLensPos] = useState({ x: 0, y: 0 });
  const [containerSize, setContainerSize] = useState({ w: 0, h: 0 });
  const [renderedRect, setRenderedRect] = useState<RenderedImageRect>({
    x: 0,
    y: 0,
    w: 0,
    h: 0,
  });
  const [isMobile, setIsMobile] = useState(false);
  const [loadedImageUrl, setLoadedImageUrl] = useState<string | null>(null);
  const naturalImageSizeRef = useRef({ w: 0, h: 0 });

  const imageContainerRef = useRef<HTMLDivElement>(null);
  const swiperRef = useRef<SwiperType | null>(null);
  const activeImageUrl = images[selectedImageIndex]?.url;
  const isMainImageLoaded =
    Boolean(activeImageUrl) && loadedImageUrl === activeImageUrl &&
    renderedRect.w > 0 && renderedRect.h > 0;

  // 🔥 FIX 1: Bigger lens (prevents pixel break)
  const LENS_SIZE = 200;

  // 🔥 FIX 2: Limit zoom scale
  const MAX_ZOOM = 2.2;

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Keep the Swiper instance in sync whenever selectedImageIndex changes
  // from outside a user swipe — thumbnail clicks, variant/color switches, etc.
  useEffect(() => {
    const swiper = swiperRef.current;
    if (!swiper || swiper.destroyed) return;
    if (swiper.activeIndex !== selectedImageIndex) {
      swiper.slideTo(selectedImageIndex);
    }
  }, [selectedImageIndex]);

  useEffect(() => {
    const el = imageContainerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setContainerSize({ w: width, h: height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const computeRenderedRect = useCallback(
    (natW: number, natH: number, cW: number, cH: number): RenderedImageRect => {
      const scale = Math.max(cW / natW, cH / natH);
      const rendW = natW * scale;
      const rendH = natH * scale;

      return {
        x: (cW - rendW) / 2,
        y: 0,
        w: rendW,
        h: rendH,
      };
    },
    [],
  );

  // The displayed main image owns loading state. Do not issue a second
  // hidden Image request just to prepare zoom dimensions.
  useEffect(() => {
    const { w, h } = naturalImageSizeRef.current;
    if (
      !activeImageUrl ||
      loadedImageUrl !== activeImageUrl ||
      !containerSize.w ||
      !containerSize.h ||
      !w ||
      !h
    ) {
      return;
    }

    setRenderedRect(
      computeRenderedRect(w, h, containerSize.w, containerSize.h),
    );
  }, [activeImageUrl, loadedImageUrl, containerSize, computeRenderedRect]);

  useEffect(() => {
    setIsHovering(false);
    setLensPos({ x: 0, y: 0 });
    setRenderedRect({ x: 0, y: 0, w: 0, h: 0 });
  }, [activeImageUrl]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isMainImageLoaded) return;
    const container = imageContainerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const lensWidth = Math.min(LENS_SIZE, rect.width);
    const lensHeight = Math.min(LENS_SIZE, rect.height);
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const lensX = Math.min(
      Math.max(x - lensWidth / 2, 0),
      Math.max(rect.width - lensWidth, 0),
    );
    const lensY = Math.min(
      Math.max(y - lensHeight / 2, 0),
      Math.max(rect.height - lensHeight, 0),
    );

    setLensPos({ x: lensX, y: lensY });
  }, [isMainImageLoaded]);

  // 🔥 FIX 3: Controlled zoom (prevents blur)
  const lensWidth = Math.min(LENS_SIZE, containerSize.w);
  const lensHeight = Math.min(LENS_SIZE, containerSize.h);
  const zoomScale = Math.min(
    containerSize.w / Math.max(lensWidth, 1),
    containerSize.h / Math.max(lensHeight, 1),
    MAX_ZOOM,
  );

  const bgW = renderedRect.w * zoomScale;
  const bgH = renderedRect.h * zoomScale;

  // Keep the center of the lens centered in the zoom preview for a clearer,
  // less jumpy magnification.
  const bgX =
    containerSize.w / 2 -
    (lensPos.x + lensWidth / 2 - renderedRect.x) * zoomScale;
  const bgY =
    containerSize.h / 2 -
    (lensPos.y + lensHeight / 2 - renderedRect.y) * zoomScale;

  return (
    <>
      {/* ================= MOBILE ================= */}
      <div className="md:hidden w-full">
        {/* Swipe Gallery */}
        <div className="relative">
          <Swiper
            onSwiper={(swiper) => {
              swiperRef.current = swiper;
            }}
            slidesPerView={1}
            spaceBetween={0}
            onSlideChange={(swiper) => {
              // Swipe originates from the user dragging — sync state to match.
              if (swiper.activeIndex !== selectedImageIndex) {
                setSelectedImageIndex(swiper.activeIndex);
              }
            }}
            className="w-full"
          >
            {images.map((img, idx) => (
              <SwiperSlide key={idx}>
                <div className="relative w-full aspect-[3/4] bg-[#f8f5f2] overflow-hidden">
                  <Image
                    src={img.url}
                    alt={product.name}
                    fill
                    priority
                    quality={100}
                    sizes="100vw"
                    className="object-cover"
                  />

                  {/* Discount Badge */}
                  {discount > 0 && !isOutOfStock && (
                    <div className="absolute top-9 left-3 bg-main-primary text-main-secondary px-2.5 py-1 rounded-full text-xs font-semibold z-10">
                      {discount}% OFF
                    </div>
                  )}
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Flipkart-style segmented progress bar */}
          {images.length > 1 && (
            <div className="absolute top-2 left-2 right-2 z-10 flex gap-1">
              {images.map((_, idx) => (
                <div
                  key={idx}
                  className="h-[3px] flex-1 rounded-full bg-white/40 overflow-hidden"
                >
                  <motion.div
                    className="h-full bg-white"
                    initial={false}
                    animate={{
                      width: idx <= selectedImageIndex ? "100%" : "0%",
                    }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Slide counter badge */}
          {images.length > 1 && (
            <div className="absolute bottom-3 right-3 z-10 bg-black/60 text-white text-[11px] font-medium px-2 py-0.5 rounded-full backdrop-blur-sm">
              {selectedImageIndex + 1} / {images.length}
            </div>
          )}
        </div>
      </div>

      {/* ================= DESKTOP ================= */}
      <motion.div
        className="hidden md:flex gap-2 w-full"
        style={{ height: "clamp(320px, 55vw, 620px)" }}
      >
        {/* Thumbnails */}
        {images?.length > 1 && (
          <div className="flex flex-col gap-2 w-[70px] overflow-y-auto">
            {images.map((img, idx) => (
              <button
                key={img.id}
                onClick={() => setSelectedImageIndex(idx)}
                className={`relative rounded-lg overflow-hidden border-2 ${
                  selectedImageIndex === idx
                    ? "border-main-secondary"
                    : "border-transparent opacity-60"
                }`}
              >
                <Image
                  src={img.url}
                  alt=""
                  width={70}
                  height={90}
                  quality={100}
                  unoptimized
                  className="object-cover object-top"
                />
              </button>
            ))}
          </div>
        )}

        {/* Main Image */}
        <div className="relative flex-1">
          <div
            ref={imageContainerRef}
            className="relative w-full h-full rounded-xl overflow-hidden bg-white cursor-crosshair"
            onMouseEnter={() => !isMobile && setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            onMouseMove={handleMouseMove}
          >
            {images.length > 0 && (
              <>
                <Image
                  src={images[selectedImageIndex].url}
                  alt={product.name}
                  fill
                  priority
                  quality={100}
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover object-top"
                  onLoad={(event) => {
                    const image = event.currentTarget;
                    naturalImageSizeRef.current = {
                      w: image.naturalWidth,
                      h: image.naturalHeight,
                    };
                    setLoadedImageUrl(activeImageUrl ?? null);
                  }}
                  onError={() => {
                    setLoadedImageUrl(null);
                    setIsHovering(false);
                  }}
                />

                {isHovering && isMainImageLoaded && (
                  <div
                    className="absolute border-2 border-yellow-400 rounded-md pointer-events-none"
                    style={{
                      width: lensWidth,
                      height: lensHeight,
                      left: lensPos.x,
                      top: lensPos.y,
                    }}
                  />
                )}
              </>
            )}

            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white p-2 rounded-full"
                >
                  <ChevronLeft size={16} />
                </button>

                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white p-2 rounded-full"
                >
                  <ChevronRight size={16} />
                </button>
              </>
            )}

            {discount > 0 && !isOutOfStock && (
              <div className="absolute top-3 left-3 bg-main-primary text-main-secondary px-2 py-1 text-xs rounded-full">
                {discount}% OFF
              </div>
            )}
          </div>

          <AnimatePresence>
            {isHovering && isMainImageLoaded && (
              <motion.div
                className="fixed border shadow-xl rounded-xl overflow-hidden"
                style={{
                  top:
                    imageContainerRef.current?.getBoundingClientRect().top ?? 0,
                  left:
                    (imageContainerRef.current?.getBoundingClientRect().right ??
                      0) + 10,
                  width: containerSize.w,
                  height: containerSize.h,
                  backgroundImage: isMainImageLoaded ? `url(${activeImageUrl})` : "none",
                  backgroundRepeat: "no-repeat",
                  backgroundSize: `${bgW}px ${bgH}px`,
                  backgroundPosition: `${bgX}px ${bgY}px`,
                  zIndex: 9999,
                }}
              />
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </>
  );
}
