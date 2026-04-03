"use client";
import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
  x: number; // offset from container left
  y: number; // offset from container top
  w: number; // rendered width
  h: number; // rendered height
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
  const hiddenImgRef = useRef<HTMLImageElement | null>(null);

  const LENS_SIZE = 120;

  // ── Mobile detection ──────────────────────────────────────
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // ── Track container size ──────────────────────────────────
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

  // ── Compute actual rendered image rect (object-cover object-top) ──
  // object-cover: scale so the image COVERS the container, crop the rest
  // object-top:   align to top
  const computeRenderedRect = useCallback(
    (natW: number, natH: number, cW: number, cH: number): RenderedImageRect => {
      const scaleX = cW / natW;
      const scaleY = cH / natH;
      const scale = Math.max(scaleX, scaleY); // cover = max

      const rendW = natW * scale;
      const rendH = natH * scale;

      // object-top → align top (y=0), center horizontally
      const x = (cW - rendW) / 2;
      const y = 0; // object-top pins top

      return { x, y, w: rendW, h: rendH };
    },
    [],
  );

  // Recalculate whenever image or container changes
  useEffect(() => {
    if (!containerSize.w || !containerSize.h) return;
    const currentUrl = images[selectedImageIndex]?.url;
    if (!currentUrl) return;

    const img = new window.Image();
    img.src = currentUrl;
    hiddenImgRef.current = img;

    const update = () => {
      setRenderedRect(
        computeRenderedRect(
          img.naturalWidth,
          img.naturalHeight,
          containerSize.w,
          containerSize.h,
        ),
      );
    };

    if (img.complete && img.naturalWidth) {
      update();
    } else {
      img.onload = update;
    }
  }, [selectedImageIndex, images, containerSize, computeRenderedRect]);

  // ── Mouse move ────────────────────────────────────────────
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const container = imageContainerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const lensX = Math.min(
      Math.max(mouseX - LENS_SIZE / 2, 0),
      rect.width - LENS_SIZE,
    );
    const lensY = Math.min(
      Math.max(mouseY - LENS_SIZE / 2, 0),
      rect.height - LENS_SIZE,
    );

    setLensPos({ x: lensX, y: lensY });
  }, []);

  // ── Zoom math ─────────────────────────────────────────────
  // The zoom panel (containerSize.w × containerSize.h) shows a
  // LENS_SIZE × LENS_SIZE region of the *rendered* image, blown up to fill the panel.
  //
  // scale = panelW / LENS_SIZE
  // bgSize = renderedRect.w * scale  ×  renderedRect.h * scale
  // bgPos  = -(lensPos.x - renderedRect.x) * scale
  //          -(lensPos.y - renderedRect.y) * scale
  const zoomScale = containerSize.w / LENS_SIZE;
  const bgW = renderedRect.w * zoomScale;
  const bgH = renderedRect.h * zoomScale;
  const bgX = -((lensPos.x - renderedRect.x) * zoomScale);
  const bgY = -((lensPos.y - renderedRect.y) * zoomScale);

  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-row gap-2 w-full"
      style={{ height: "clamp(320px, 55vw, 620px)" }}
    >
      {/* ── Thumbnails ───────────────────────────────────────── */}
      {images?.length > 1 && (
        <div
          className="flex flex-col gap-1.5 overflow-y-auto scrollbar-hide flex-none"
          style={{ width: "clamp(48px, 8vw, 72px)" }}
        >
          {images.map((img: any, idx: number) => (
            <motion.button
              key={img.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedImageIndex(idx)}
              className={`relative flex-none rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                selectedImageIndex === idx
                  ? "border-yellow-500 opacity-100"
                  : "border-transparent opacity-55 hover:opacity-90"
              }`}
              style={{ width: "100%", aspectRatio: "3/4" }}
            >
              <Image
                src={img.url}
                alt={img.altText || `${product.name} ${idx + 1}`}
                fill
                sizes="80px"
                className="object-cover object-top"
              />
            </motion.button>
          ))}
        </div>
      )}

      {/* ── Main + Zoom ───────────────────────────────────────── */}
      <div className="relative flex-1 min-w-0">
        {/* Main image */}
        <div
          ref={imageContainerRef}
          className="relative w-full h-full rounded-xl overflow-hidden bg-white shadow-md cursor-crosshair select-none"
          onMouseEnter={() => !isMobile && setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          onMouseMove={handleMouseMove}
        >
          {images.length > 0 ? (
            <>
              <Image
                src={images[selectedImageIndex].url}
                alt={images[selectedImageIndex].altText || product.name}
                fill
                priority
                draggable={false}
                sizes="(max-width: 768px) 80vw, 45vw"
                className="object-cover object-top"
              />

              {/* 4-strip dim + clear lens square */}
              {isHovering && (
                <>
                  <div
                    className="absolute pointer-events-none z-10 bg-black/25"
                    style={{ left: 0, top: 0, right: 0, height: lensPos.y }}
                  />
                  <div
                    className="absolute pointer-events-none z-10 bg-black/25"
                    style={{
                      left: 0,
                      top: lensPos.y + LENS_SIZE,
                      right: 0,
                      bottom: 0,
                    }}
                  />
                  <div
                    className="absolute pointer-events-none z-10 bg-black/25"
                    style={{
                      left: 0,
                      top: lensPos.y,
                      width: lensPos.x,
                      height: LENS_SIZE,
                    }}
                  />
                  <div
                    className="absolute pointer-events-none z-10 bg-black/25"
                    style={{
                      left: lensPos.x + LENS_SIZE,
                      top: lensPos.y,
                      right: 0,
                      height: LENS_SIZE,
                    }}
                  />
                  <div
                    className="absolute pointer-events-none z-20 border-2 border-yellow-400"
                    style={{
                      width: LENS_SIZE,
                      height: LENS_SIZE,
                      left: lensPos.x,
                      top: lensPos.y,
                    }}
                  />
                </>
              )}

              {!isHovering && images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 p-1.5 rounded-full shadow hover:bg-white transition z-20"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 p-1.5 rounded-full shadow hover:bg-white transition z-20"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center h-full bg-gray-100">
              <p className="text-gray-400 text-sm">No image available</p>
            </div>
          )}

          {discount > 0 && !isOutOfStock && (
            <div className="absolute top-3 left-3 bg-green-600 text-white px-2.5 py-0.5 rounded-full text-xs font-bold z-20">
              {discount}% OFF
            </div>
          )}
          {isOutOfStock && (
            <div className="absolute top-3 left-3 bg-red-600 text-white px-2.5 py-0.5 rounded-full text-xs font-bold z-20">
              Out of Stock
            </div>
          )}
        </div>

        {/* ── Zoom panel ───────────────────────────────────────
            bgSize uses the RENDERED image dimensions × zoomScale
            bgPos  offsets by (lensPos - renderedRect.offset) × zoomScale
            This accounts for object-cover cropping exactly.
        ─────────────────────────────────────────────────────── */}
        <AnimatePresence>
          {isHovering &&
            images.length > 0 &&
            containerSize.w > 0 &&
            renderedRect.w > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.1 }}
                className="fixed rounded-xl overflow-hidden shadow-2xl border border-gray-100 pointer-events-none"
                style={{
                  // Align top with the main image container using getBoundingClientRect
                  top:
                    imageContainerRef.current?.getBoundingClientRect().top ?? 0,
                  left:
                    (imageContainerRef.current?.getBoundingClientRect().right ??
                      0) + 12,
                  width: containerSize.w,
                  height: containerSize.h,
                  zIndex: 9999,
                  backgroundImage: `url(${images[selectedImageIndex].url})`,
                  backgroundRepeat: "no-repeat",
                  backgroundSize: `${bgW}px ${bgH}px`,
                  backgroundPosition: `${bgX}px ${bgY}px`,
                }}
              />
            )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
