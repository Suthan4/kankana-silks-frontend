"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";

gsap.registerPlugin(ScrollTrigger);

const sarees = [
  {
    title: "Kanchipuram Silk",
    price: "₹24,999",
    image:
      "https://nfteccx7oojuechu.public.blob.vercel-storage.com/static/kankana-silks/DSC06749.jpg",
    description: "Traditional South Indian silk with rich zari work",
  },
  {
    title: "Banarasi Gold",
    price: "₹18,499",
    image:
      "https://nfteccx7oojuechu.public.blob.vercel-storage.com/static/kankana-silks/DSC06187.jpg",
    description: "Elegant Banarasi weave with golden motifs",
  },
  {
    title: "Chanderi Grace",
    price: "₹12,999",
    image:
      "https://nfteccx7oojuechu.public.blob.vercel-storage.com/static/kankana-silks/DSC07417.jpg",
    description: "Lightweight Chanderi with delicate patterns",
  },
  {
    title: "Tussar Elegance",
    price: "₹15,999",
    image:
      "https://nfteccx7oojuechu.public.blob.vercel-storage.com/static/kankana-silks/DSC06719.jpg",
    description: "Natural tussar silk with contemporary design",
  },
];

export default function HorizontalShowcase() {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const stRef = useRef<ScrollTrigger | null>(null);

  useEffect(() => {
    // disable GSAP pin animation on small screens (mobile fallback handled elsewhere)
    if (typeof window === "undefined") return;
    if (window.innerWidth < 768) return;

    const items = sarees.length;
    const totalScroll = window.innerWidth * (items - 1); // correct scroll distance
    const sectionEl = sectionRef.current!;
    const trackEl = trackRef.current!;

    // set the outer section height so pin only lasts as long as we need
    // height = viewport height + total horizontal scroll in px
    // sectionEl.style.height = `${window.innerHeight + totalScroll}px`;
    sectionEl.style.overflow = "hidden";

    // set track width to items * 100vw
    trackEl.style.width = `${items * 100}vw`;

    // create GSAP animation
    const ctx = gsap.context(() => {
      const tween = gsap.to(trackEl, {
        x: -totalScroll, // move left by exact pixels needed
        ease: "none",
        scrollTrigger: {
          trigger: sectionEl,
          start: "top top",
          end: `+=${totalScroll}`, // pin for exactly totalScroll pixels
          scrub: true,
          pin: true,
          anticipatePin: 1,
        },
      });

      // store ScrollTrigger for cleanup if needed
      stRef.current = tween.scrollTrigger as any;
    }, sectionEl);

    // update on resize: recompute sizes & refresh ScrollTrigger
    let resizeTimeout: any;
    const onResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        if (!sectionRef.current || !trackRef.current) return;
        const items = sarees.length;
        const totalScroll = window.innerWidth * (items - 1);
        sectionRef.current.style.height = `${
          window.innerHeight + totalScroll
        }px`;
        trackRef.current.style.width = `${items * 100}vw`;

        // kill previous ScrollTriggers and recreate
        ScrollTrigger.getAll().forEach((t) => t.kill());
        ctx.revert();
        // re-run effect by forcing a small re-init
        // simplest is to reload page, but here we programmatically re-init:
        // create a fresh context & tween
        const ctx2 = gsap.context(() => {
          gsap.to(trackRef.current, {
            x: -totalScroll,
            ease: "none",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top top",
              end: `+=${totalScroll}`,
              scrub: true,
              pin: true,
              anticipatePin: 1,
            },
          });
        }, sectionRef.current);
      }, 120);
    };

    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      // cleanup
      ScrollTrigger.getAll().forEach((t) => t.kill());
      ctx.revert();
      // reset inline styles (optional)
      if (sectionEl) {
        // sectionEl.style.height = "";
        sectionEl.style.overflow = "";
      }
      if (trackEl) {
        trackEl.style.width = "";
      }
    };
  }, []);

  return (
    // show only on md+ (mobile fallback is your Collection / CollectionsSection)
    <section
      ref={sectionRef}
      className="relative hidden md:block"
      aria-label="Horizontal showcase"
    >
      <div
        ref={trackRef}
        className="flex h-screen"
        // width is set in JS for accuracy
      >
        {sarees.map((saree, index) => (
          <div
            key={index}
            className="w-screen h-screen flex items-center justify-center relative"
            style={{
              backgroundImage: `url(${saree.image})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="absolute inset-0 bg-black/40"></div>
            <div className="relative z-10 text-center text-white px-6">
              <h2 className="text-6xl font-serif mb-4">{saree.title}</h2>
              <p className="text-2xl mb-2">{saree.price}</p>
              <p className="text-lg mb-6 text-white/90">{saree.description}</p>
              <button className="bg-white text-gray-800 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-300">
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

