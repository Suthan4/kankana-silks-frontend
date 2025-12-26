"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type Slide = {
  title: string;
  subtitle: string;
  image: string;
};

const slides: Slide[] = [
  {
    title: "Woven in Tradition",
    subtitle: "Centuries of craftsmanship in every drape",
    image: "/kankana-silks/DSC07288.jpg",
  },
  {
    title: "Pure Silk Stories",
    subtitle: "Sourced ethically. Crafted patiently.",
    image: "/kankana-silks/DSC07848.jpg",
  },
  {
    title: "Designed for Today",
    subtitle: "Timeless elegance for the modern woman",
    image: "/kankana-silks/DSC08243.jpg",
  },
];

function ParallaxSlide({ slide }: { slide: Slide }) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Background parallax
      gsap.fromTo(
        bgRef.current,
        { yPercent: -10 },
        {
          yPercent: 10,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        }
      );

      // Typography movement
      gsap.fromTo(
        textRef.current,
        { y: 120, opacity: 0 },
        {
          y: -120,
          opacity: 1,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 70%",
            end: "bottom 30%",
            scrub: true,
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative h-[120vh] overflow-hidden flex items-center justify-center"
    >
      {/* Background */}
      <div ref={bgRef} className="absolute inset-0 will-change-transform">
        <img
          src={slide.image}
          alt={slide.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/45" />
      </div>

      {/* Typography */}
      <div ref={textRef} className="relative z-10 text-center px-6 max-w-6xl">
        <h2 className="text-[clamp(3rem,8vw,7rem)] font-serif text-white leading-none">
          {slide.title}
        </h2>
        <p className="mt-6 text-xl md:text-2xl text-white/80 font-light">
          {slide.subtitle}
        </p>
      </div>
    </section>
  );
}

export default function VerticalParallaxHero() {
  return (
    <div className="bg-background">
      {slides.map((slide, index) => (
        <ParallaxSlide key={index} slide={slide} />
      ))}
    </div>
  );
}
