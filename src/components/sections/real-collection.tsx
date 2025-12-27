"use client";

import { useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ChevronLeft, ChevronRight } from "lucide-react";

const collections = [
  {
    title: "Premium",
    subtitle: "Handwoven Silks",
    image: "/kankana-silks-webp/DSC06565.webp",
  },
  {
    title: "Affordable",
    subtitle: "Everyday Elegance",
    image: "/kankana-silks-webp/DSC07193.webp",
  },
  {
    title: "Wedding",
    subtitle: "Bridal Heritage",
    image: "/kankana-silks-webp/DSC06728.webp",
  },
  {
    title: "Contemporary",
    subtitle: "Modern Drapes",
    image: "/kankana-silks-webp/DSC07287.webp",
  },
];

export default function RealCollection() {
  const trackRef = useRef<HTMLDivElement>(null);
  const indexRef = useRef(0);
  const getMaxIndex = () => collections.length - 1;

  const slideTo = (dir: "next" | "prev") => {
    if (!trackRef.current) return;

    const slides = trackRef.current.children;
    const maxIndex = slides.length - 1;

    if (dir === "next" && indexRef.current >= maxIndex) return;
    if (dir === "prev" && indexRef.current <= 0) return;

    indexRef.current =
      dir === "next" ? indexRef.current + 1 : indexRef.current - 1;

    const slideEl = slides[0] as HTMLElement;
    const slideWidth = slideEl.offsetWidth;

    gsap.to(trackRef.current, {
      x: -indexRef.current * slideWidth,
      duration: 0.6,
      ease: "power3.out",
    });
  };

  

  return (
    // <section className="relative w-full bg-white py-10">
    <section className="relative w-full overflow-hidden bg-white py-24 md:py-10">
      {/* HEADER */}
      <div className="px-4 mb-6 md:px-16 md:mb-12">
        <h2 className="text-3xl md:text-5xl font-light tracking-tight">
          Premium Collections
        </h2>
      </div>
      {/* SLIDER */}
      <div className="relative overflow-hidden">
        {/* TRACK */}
        <div ref={trackRef} className="flex touch-none">
          {collections.map((item, i) => (
            <div
              key={i}
              className="
  relative
  w-screen flex-shrink-0
  aspect-[3/4]

  md:w-[80vw]
  md:h-[70vh]
  md:aspect-auto
  md:ml-10
  md:rounded-3xl

  overflow-hidden
  bg-gray-100
"
            >
              <Image
                src={item.image}
                alt={item.title}
                fill
                priority={i === 0}
                sizes="100vw"
                className="object-cover"
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-black/30" />

              {/* Text */}
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <h3 className="text-2xl md:text-5xl font-light">
                  {item.title}
                </h3>
                <p className="text- md:text-2xl opacity-80">{item.subtitle}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CHEVRONS */}
        <button
          onClick={() => slideTo("prev")}
          className="absolute left-3 top-1/2 -translate-y-1/2 z-10 bg-white/80 rounded-full p-2 shadow"
        >
          <ChevronLeft />
        </button>

        <button
          onClick={() => slideTo("next")}
          className="absolute right-3 top-1/2 -translate-y-1/2 z-10 bg-white/80 rounded-full p-2 shadow"
        >
          <ChevronRight />
        </button>
      </div>
    </section>
  );
}
