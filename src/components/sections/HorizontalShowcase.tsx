"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/lib/api/home-section.api.service";

gsap.registerPlugin(ScrollTrigger);

interface HorizontalShowcaseProps {
  title: string;
  subtitle?: string;
  products: Product[];
  sectionType?: string;
}

export default function HorizontalShowcase({
  title,
  subtitle,
  products,
}: HorizontalShowcaseProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const [trackWidth, setTrackWidth] = useState(0);

  /* -------------------- Calculate track width (SSR-safe) -------------------- */
  useEffect(() => {
    if (typeof window === "undefined") return;
    setTrackWidth(window.innerWidth * products.length);
  }, [products.length]);

  /* -------------------- GSAP horizontal scroll -------------------- */
  useEffect(() => {
    if (
      !sectionRef.current ||
      !trackRef.current ||
      !titleRef.current ||
      typeof window === "undefined" ||
      window.innerWidth < 768 ||
      products.length === 0
    )
      return;

    const scrollDistance = trackWidth - window.innerWidth;

    const ctx = gsap.context(() => {
      // Fade title out
      gsap.to(titleRef.current!, {
        opacity: 0,
        y: -100,
        scrollTrigger: {
          trigger: sectionRef.current!,
          start: "top top",
          end: "+=300",
          scrub: true,
        },
      });

      // Horizontal movement
      gsap.to(trackRef.current!, {
        x: -scrollDistance,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current!,
          start: "top top",
          end: `+=${scrollDistance}`,
          scrub: true,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });
    }, sectionRef);

    ScrollTrigger.refresh();

    return () => ctx.revert();
  }, [trackWidth, products.length]);

  if (!products.length) return null;

  return (
    <section
      ref={sectionRef}
      className="relative hidden md:block bg-black text-white overflow-hidden"
      style={{ minHeight: "100vh" }}
    >
      {/* Floating Title */}
      <div
        ref={titleRef}
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="text-center"
        >
          <h2 className="text-6xl lg:text-8xl font-bold tracking-tighter mb-4 bg-gradient-to-b from-white to-gray-500 bg-clip-text text-transparent">
            {title}
          </h2>
          {subtitle && (
            <p className="text-xl lg:text-2xl text-gray-400 font-light">
              {subtitle}
            </p>
          )}
        </motion.div>
      </div>

      {/* Horizontal Track */}
      <div
        ref={trackRef}
        className="flex h-screen items-center"
        style={{ width: `${trackWidth}px` }}
      >
        {products.map((product, index) => (
          <ProductSlide
            key={product.id}
            product={product}
            index={index}
            total={products.length}
          />
        ))}
      </div>

      {/* Scroll Indicator */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-10 flex items-center gap-3 text-white/60 text-sm">
        <span>Scroll to explore</span>
        <svg
          className="w-5 h-5 animate-bounce"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </div>
    </section>
  );
}

/* ========================================================================== */
/*                                  Slide                                     */
/* ========================================================================== */

function ProductSlide({
  product,
  index,
  total,
}: {
  product: Product;
  index: number;
  total: number;
}) {
  const slideRef = useRef<HTMLDivElement>(null);
  const firstImage = product.media?.find((m) => m.type === "IMAGE")?.url;
  const inStock = product.stock?.some((s) => s.quantity > 0);

  useEffect(() => {
    if (!slideRef.current || typeof window === "undefined") return;

    const imageEl = slideRef.current.querySelector(
      ".product-image"
    ) as HTMLElement | null;

    const contentEl = slideRef.current.querySelector(
      ".product-content"
    ) as HTMLElement | null;

    if (!imageEl || !contentEl) return;

    const ctx = gsap.context(() => {
      gsap.to(imageEl, {
        scale: 1.2,
        scrollTrigger: {
          trigger: slideRef.current!,
          start: "left right",
          end: "right left",
          scrub: true,
          horizontal: true,
        },
      });

      gsap.fromTo(
        contentEl,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          scrollTrigger: {
            trigger: slideRef.current!,
            start: "left center",
            end: "center center",
            scrub: true,
            horizontal: true,
          },
        }
      );
    }, slideRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={slideRef}
      className="relative w-screen h-screen shrink-0 flex items-center justify-center px-8 lg:px-16"
    >
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden">
        {firstImage && (
          <>
            <div className="product-image absolute inset-0">
              <Image
                src={firstImage}
                alt={product.name}
                fill
                priority={index === 0}
                sizes="100vw"
                className="object-cover"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-black" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/60" />
          </>
        )}
      </div>

      {/* Content */}
      <div className="product-content relative z-10 max-w-2xl">
        <Link href={`/products/${product.slug}`} className="block group">
          <span className="inline-block mb-4 px-4 py-2 rounded-full border border-white/20 bg-white/5 backdrop-blur-xl text-sm uppercase tracking-wider text-white/80">
            {product.category.name}
          </span>

          <h3 className="text-5xl lg:text-7xl font-bold tracking-tighter mb-6 leading-none">
            {product.name}
          </h3>

          {product.description && (
            <p className="text-xl lg:text-2xl text-gray-300 mb-8 line-clamp-3">
              {product.description}
            </p>
          )}

          <div className="flex items-baseline gap-4 mb-8">
            <span className="text-4xl lg:text-5xl font-semibold">
              ₹{product.sellingPrice.toLocaleString()}
            </span>
            {product.basePrice !== product.sellingPrice && (
              <span className="text-2xl text-gray-500 line-through">
                ₹{product.basePrice.toLocaleString()}
              </span>
            )}
          </div>

          {!inStock && (
            <span className="inline-block mb-6 px-4 py-2 rounded-full bg-red-500/20 border border-red-500/50 text-red-400 text-sm">
              Out of Stock
            </span>
          )}

          <div className="inline-flex items-center gap-3 px-8 py-4 bg-white text-black rounded-full font-semibold text-lg">
            Discover
          </div>
        </Link>
      </div>

      {/* Slide Counter */}
      <div className="absolute bottom-8 right-8 text-white/40 text-sm font-mono">
        {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
      </div>
    </div>
  );
}
