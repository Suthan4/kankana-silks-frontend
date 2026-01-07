"use client";

import { useRef, useState, useEffect } from "react";
import gsap from "gsap";
import { ChevronLeft, ChevronRight } from "lucide-react";

const cards = [
  {
    title: "Premium",
    subtitle: "Handwoven Silks",
    image: "/kankana-silks-webp/DSC08313.webp",
  },
  {
    title: "Affordable",
    subtitle: "Everyday Elegance",
    image: "/kankana-silks-webp/DSC08020.webp",
  },
  {
    title: "Wedding",
    subtitle: "Bridal Heritage",
    image: "/kankana-silks-webp/DSC07981.webp",
  },
  {
    title: "Contemporary",
    subtitle: "Modern Drapes",
    image: "/kankana-silks-webp/DSC07689.webp",
  },
  {
    title: "Luxury",
    subtitle: "Limited Edition",
    image: "/kankana-silks-webp/DSC07456.webp",
  },
];

export default function SquareCollectionsCarousel() {
  const trackRef = useRef<HTMLDivElement>(null);
  const indexRef = useRef(0);
  const [cardWidth, setCardWidth] = useState(420);
  const [gap, setGap] = useState(40);

  // Update card size and gap on resize
  useEffect(() => {
    const updateSizes = () => {
      if (window.innerWidth < 640) {
        setCardWidth(280);
        setGap(20);
      } else if (window.innerWidth < 1024) {
        setCardWidth(340);
        setGap(30);
      } else {
        setCardWidth(420);
        setGap(40);
      }
    };

    updateSizes();
    window.addEventListener("resize", updateSizes);
    return () => window.removeEventListener("resize", updateSizes);
  }, []);

  const slide = (dir: "next" | "prev") => {
    if (!trackRef.current) return;
    const max = cards.length - 1;

    indexRef.current =
      dir === "next"
        ? Math.min(indexRef.current + 1, max)
        : Math.max(indexRef.current - 1, 0);

    gsap.to(trackRef.current, {
      x: -(cardWidth + gap) * indexRef.current,
      duration: 0.8,
      ease: "power3.out",
    });
  };

  return (
    <section className="relative w-full bg-white py-16 sm:py-32 overflow-hidden">
      {/* HEADER */}
      <div className="px-6 sm:px-16 mb-12 sm:mb-16">
        <h2 className="text-3xl sm:text-5xl font-light tracking-tight">
          Curated Collections
        </h2>
      </div>

      {/* CHEVRONS */}
      <button
        onClick={() => slide("prev")}
        className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white/80 backdrop-blur p-2 sm:p-3 shadow"
      >
        <ChevronLeft size={24} className="sm:!w-7 sm:!h-7" />
      </button>

      <button
        onClick={() => slide("next")}
        className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white/80 backdrop-blur p-2 sm:p-3 shadow"
      >
        <ChevronRight size={24} className="sm:!w-7 sm:!h-7" />
      </button>

      {/* TRACK */}
      <div className="pl-6 sm:pl-16">
        <div
          ref={trackRef}
          className="flex gap-5 sm:gap-10 will-change-transform"
        >
          {cards.map((item, i) => (
            <div
              key={i}
              className="relative rounded-3xl overflow-hidden flex-shrink-0 transition-opacity duration-500"
              style={{ width: cardWidth, height: cardWidth }}
            >
              {/* IMAGE */}
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${item.image})` }}
              />

              {/* OVERLAY */}
              <div className="absolute inset-0 bg-black/25" />

              {/* TEXT */}
              <div className="relative z-10 h-full flex flex-col justify-end p-6 sm:p-10 text-white">
                <h3 className="text-xl sm:text-2xl font-light">{item.title}</h3>
                <p className="text-sm opacity-80 mt-1">{item.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
