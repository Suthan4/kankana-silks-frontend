"use client";
import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
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

  const imageContainerRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (!containerSize.w || !containerSize.h) return;

    const currentUrl = images[selectedImageIndex]?.url;
    if (!currentUrl) return;

    const img = new window.Image();
    img.src = currentUrl;

    img.onload = () => {
      setRenderedRect(
        computeRenderedRect(
          img.naturalWidth,
          img.naturalHeight,
          containerSize.w,
          containerSize.h,
        ),
      );
    };
  }, [selectedImageIndex, images, containerSize, computeRenderedRect]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const container = imageContainerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const lensX = Math.min(
      Math.max(x - LENS_SIZE / 2, 0),
      rect.width - LENS_SIZE,
    );

    const lensY = Math.min(
      Math.max(y - LENS_SIZE / 2, 0),
      rect.height - LENS_SIZE,
    );

    setLensPos({ x: lensX, y: lensY });
  }, []);

  // 🔥 FIX 3: Controlled zoom (prevents blur)
  const zoomScale = Math.min(containerSize.w / LENS_SIZE, MAX_ZOOM);

  const bgW = renderedRect.w * zoomScale;
  const bgH = renderedRect.h * zoomScale;

  const bgX = -((lensPos.x - renderedRect.x) * zoomScale);
  const bgY = -((lensPos.y - renderedRect.y) * zoomScale);

  return (
    <>
      {/* ================= MOBILE ================= */}
      <div className="md:hidden w-full">
        {/* Swipe Gallery */}
        <Swiper
          slidesPerView={1}
          spaceBetween={0}
          onSlideChange={(swiper) => setSelectedImageIndex(swiper.activeIndex)}
          initialSlide={selectedImageIndex}
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
                  <div className="absolute top-3 left-3 bg-main-primary text-main-secondary px-2.5 py-1 rounded-full text-xs font-semibold z-10">
                    {discount}% OFF
                  </div>
                )}
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto px-4 py-3 scrollbar-hide bg-white">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImageIndex(idx)}
                className={`relative w-16 h-20 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                  selectedImageIndex === idx
                    ? "border-black"
                    : "border-gray-200"
                }`}
              >
                <Image
                  src={img.url}
                  alt=""
                  fill
                  quality={100}
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}
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
                />

                {isHovering && (
                  <div
                    className="absolute border-2 border-yellow-400 rounded-md pointer-events-none"
                    style={{
                      width: LENS_SIZE,
                      height: LENS_SIZE,
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
            {isHovering && (
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
                  backgroundImage: `url(${images[selectedImageIndex].url})`,
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
