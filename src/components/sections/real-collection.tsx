"use client";

import { useRef } from "react";
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

  const slideTo = (direction: "next" | "prev") => {
    if (!trackRef.current) return;

    const maxIndex = collections.length - 1;

    if (direction === "next") {
      indexRef.current = Math.min(indexRef.current + 1, maxIndex);
    } else {
      indexRef.current = Math.max(indexRef.current - 1, 0);
    }

    gsap.to(trackRef.current, {
      x: `-${indexRef.current * 80}vw`,
      duration: 1,
      ease: "power3.out",
    });
  };

  return (
    <section className="relative w-full overflow-hidden bg-white py-24">
      {/* HEADER */}
      <div className="px-16 mb-12">
        <h2 className="text-5xl font-light tracking-tight">
          Premium Collections
        </h2>
      </div>

      {/* CHEVRONS */}
      <button
        onClick={() => slideTo("prev")}
        className="absolute left-6 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white/80 backdrop-blur p-3 shadow"
      >
        <ChevronLeft size={28} />
      </button>

      <button
        onClick={() => slideTo("next")}
        className="absolute right-6 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white/80 backdrop-blur p-3 shadow"
      >
        <ChevronRight size={28} />
      </button>

      {/* TRACK */}
      <div className="pl-16">
        <div ref={trackRef} className="flex gap-10 will-change-transform">
          {collections.map((item, i) => (
            <div
              key={i}
              className="relative min-w-[80vw] h-[70vh] rounded-3xl overflow-hidden bg-gray-100"
            >
              {/* IMAGE */}
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${item.image})` }}
              />

              {/* OVERLAY */}
              <div className="absolute inset-0 bg-black/30" />

              {/* TEXT */}
              <div className="relative z-10 h-full flex flex-col justify-end p-16 text-white">
                <h3 className="text-4xl font-light">{item.title}</h3>
                <p className="text-lg opacity-80 mt-2">{item.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
