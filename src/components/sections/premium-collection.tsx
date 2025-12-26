"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ChevronLeft, ChevronRight } from "lucide-react";

const cards = [
  {
    title: "Premium",
    subtitle: "Handwoven Silks",
    image:
      "https://nfteccx7oojuechu.public.blob.vercel-storage.com/static/kankana-silks/DSC07869.jpg",
  },
  {
    title: "Affordable",
    subtitle: "Everyday Elegance",
    image:
      "https://nfteccx7oojuechu.public.blob.vercel-storage.com/static/kankana-silks/DSC07286.jpg",
  },
  {
    title: "Wedding",
    subtitle: "Bridal Heritage",
    image:
      "https://nfteccx7oojuechu.public.blob.vercel-storage.com/static/kankana-silks/DSC06693.jpg",
  },
  {
    title: "Contemporary",
    subtitle: "Modern Drapes",
    image:
      "https://nfteccx7oojuechu.public.blob.vercel-storage.com/static/kankana-silks/DSC06240.jpg",
  },
  {
    title: "Luxury",
    subtitle: "Limited Edition",
    image:
      "https://nfteccx7oojuechu.public.blob.vercel-storage.com/static/kankana-silks/DSC06749.jpg",
  },
];

export default function PremiumCollectionCarousel() {
  const trackRef = useRef<HTMLDivElement>(null);
  const indexRef = useRef(0);
  const getCardSize = () => {
    if (window.innerWidth < 640) return 280; // mobile
    if (window.innerWidth < 1024) return 340; // tablet
    return 420; // desktop
  };
  const CARD_WIDTH = typeof window !== "undefined" ? getCardSize() : 420;
  const GAP =
    typeof window !== "undefined" && window.innerWidth < 640 ? 20 : 40;

  const slide = (dir: "next" | "prev") => {
    if (!trackRef.current) return;

    const max = cards.length - 1;

    indexRef.current =
      dir === "next"
        ? Math.min(indexRef.current + 1, max)
        : Math.max(indexRef.current - 1, 0);

    gsap.to(trackRef.current, {
      x: -(CARD_WIDTH + GAP) * indexRef.current,
      duration: 0.9,
      ease: "power3.out",
    });
  };

  return (
    <section className="relative w-full bg-white py-32 overflow-hidden">
      {/* HEADER */}
      <div className="px-16 mb-16">
        <h2 className="text-5xl font-light tracking-tight">
          Our Collections
        </h2>
      </div>

      {/* CHEVRONS */}
      <button
        onClick={() => slide("prev")}
        className="absolute left-6 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white/80 backdrop-blur p-3 shadow"
      >
        <ChevronLeft size={28} />
      </button>

      <button
        onClick={() => slide("next")}
        className="absolute right-6 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white/80 backdrop-blur p-3 shadow"
      >
        <ChevronRight size={28} />
      </button>

      {/* TRACK */}
      <div className="pl-16">
        <div ref={trackRef} className="flex gap-10 will-change-transform">
          {cards.map((item, i) => (
            <div
              key={i}
              className="
    relative
    w-[280px] h-[280px]
    sm:w-[340px] sm:h-[340px]
    lg:w-[420px] lg:h-[420px]
    rounded-3xl overflow-hidden  shrink-0
    transition-opacity duration-500
  "
            >
              {/* IMAGE */}
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${item.image})` }}
              />

              {/* OVERLAY */}
              <div className="absolute inset-0 bg-black/25" />

              {/* TEXT */}
              <div className="relative z-10 h-full flex flex-col justify-end p-10 text-white">
                <h3 className="text-2xl font-light">{item.title}</h3>
                <p className="text-sm opacity-80 mt-1">{item.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
