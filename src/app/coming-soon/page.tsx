"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";

export default function ComingSoonPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);

  useLayoutEffect(() => {
    if (
      !containerRef.current ||
      !titleRef.current ||
      !lineRef.current ||
      !subtitleRef.current
    )
      return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
      });

      tl.fromTo(
        containerRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 1 }
      )
        .fromTo(
          titleRef.current,
          { y: 40, opacity: 0 },
          { y: 0, opacity: 1, duration: 1 },
          "-=0.5"
        )
        .fromTo(
          lineRef.current,
          { scaleX: 0 },
          { scaleX: 1, duration: 0.8 },
          "-=0.4"
        )
        .fromTo(
          subtitleRef.current,
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8 },
          "-=0.3"
        );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center bg-[#0b0b0b] text-white overflow-hidden"
    >
      {/* silk glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#2b1d14]/30 via-transparent to-[#3a2a1f]/30" />

      <div className="relative z-10 text-center px-6">
        <h1
          ref={titleRef}
          className="text-4xl md:text-6xl font-light tracking-[0.35em] uppercase"
        >
          Kankana Silks
        </h1>

        <div
          ref={lineRef}
          className="mx-auto my-6 h-[1px] w-24 bg-white origin-left"
        />

        <p
          ref={subtitleRef}
          className="text-sm md:text-base tracking-[0.3em] text-white/70 uppercase"
        >
          Coming Soon
        </p>
      </div>

      <div className="absolute bottom-6 text-xs tracking-widest text-white/40">
        Timeless Elegance · Handwoven Heritage
      </div>
    </div>
  );
}
