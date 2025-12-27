// "use client";

// import { useEffect, useRef } from "react";
// import gsap from "gsap";
// import { ScrollTrigger } from "gsap/ScrollTrigger";
// import Image from "next/image";

// gsap.registerPlugin(ScrollTrigger);

// const sarees = [
//   {
//     title: "Kanchipuram Silk",
//     price: "₹24,999",
//     image: "/kankana-silks/DSC06749.jpg",
//     description: "Traditional South Indian silk with rich zari work",
//   },
//   {
//     title: "Banarasi Gold",
//     price: "₹18,499",
//     image: "/kankana-silks/DSC06187.jpg",
//     description: "Elegant Banarasi weave with golden motifs",
//   },
//   {
//     title: "Chanderi Grace",
//     price: "₹12,999",
//     image: "/kankana-silks/DSC07417.jpg",
//     description: "Lightweight Chanderi with delicate patterns",
//   },
//   {
//     title: "Tussar Elegance",
//     price: "₹15,999",
//     image: "/kankana-silks/DSC06719.jpg",
//     description: "Natural tussar silk with contemporary design",
//   },
// ];

// export default function HorizontalShowcase() {
//   const sectionRef = useRef<HTMLDivElement | null>(null);
//   const trackRef = useRef<HTMLDivElement | null>(null);

//   useEffect(() => {
//     if (window.innerWidth < 768) return;

//     const items = sarees.length;
//     // const scrollDistance = window.innerWidth * (items - 1);
//     const scrollDistance = trackRef.current!.scrollWidth - window.innerWidth;


//     const ctx = gsap.context(() => {
//       gsap.to(trackRef.current, {
//         x: -scrollDistance,
//         ease: "none",
//         scrollTrigger: {
//           trigger: sectionRef.current,
//           start: "top top",
//           end: `+=${scrollDistance}`,
//           scrub: true,
//           pin: true,
//           pinSpacing: true, // 🔑 let GSAP handle spacing
//           anticipatePin: 1,
//         },
//       });
//     }, sectionRef);

//     return () => {
//       ctx.revert();
//       ScrollTrigger.getAll().forEach((t) => t.kill());
//     };
//   }, []);

//   return (
//     <section
//       ref={sectionRef}
//       aria-label="Horizontal showcase"
//       className="relative hidden md:block overflow-hidden"
//       style={{
//         minHeight: "100vh", // 🔑 stable layout
//       }}
//     >
//       <div
//         ref={trackRef}
//         className="flex h-screen"
//         style={{ width: `${sarees.length * 100}vw` }}
//       >
//         {sarees.map((saree, index) => (
//           <div
//             key={index}
//             className="relative w-screen h-screen flex items-center justify-center"
//           >
//             {/* CLS-safe image */}
//             <Image
//               src={saree.image}
//               alt={saree.title}
//               fill
//               sizes="100vw"
//               priority={index === 0}
//               className="object-cover"
//             />

//             <div className="absolute inset-0 bg-black/40" />

//             <div className="relative z-10 text-center text-white px-6 max-w-xl">
//               <h2 className="text-6xl font-serif mb-4">{saree.title}</h2>
//               <p className="text-2xl mb-2">{saree.price}</p>
//               <p className="text-lg mb-6 text-white/90">{saree.description}</p>
//               <button className="bg-white text-gray-800 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">
//                 View Details
//               </button>
//             </div>
//           </div>
//         ))}
//       </div>
//     </section>
//   );
// }

"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";

gsap.registerPlugin(ScrollTrigger);

const sarees = [
  {
    title: "Kanchipuram Silk",
    price: "₹24,999",
    image: "/kankana-silks-webp/DSC06749.webp",
    description: "Traditional South Indian silk with rich zari work",
  },
  {
    title: "Banarasi Gold",
    price: "₹18,499",
    image: "/kankana-silks-webp/DSC06187.webp",
    description: "Elegant Banarasi weave with golden motifs",
  },
  {
    title: "Chanderi Grace",
    price: "₹12,999",
    image: "/kankana-silks-webp/DSC07417.webp",
    description: "Lightweight Chanderi with delicate patterns",
  },
  {
    title: "Tussar Elegance",
    price: "₹15,999",
    image: "/kankana-silks-webp/DSC06719.webp",
    description: "Natural tussar silk with contemporary design",
  },
];

export default function HorizontalShowcase() {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [trackWidth, setTrackWidth] = useState(0);

  useEffect(() => {
    if (!trackRef.current) return;
    const updateWidth = () => setTrackWidth(window.innerWidth * sarees.length);
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  useEffect(() => {
    if (!trackRef.current || window.innerWidth < 768 || trackWidth === 0)
      return;

    const scrollDistance = trackWidth - window.innerWidth;

    // Delay GSAP setup to avoid flicker
    requestAnimationFrame(() => {
      const ctx = gsap.context(() => {
        gsap.to(trackRef.current, {
          x: -scrollDistance,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: `+=${scrollDistance}`,
            scrub: true,
            pin: true,
            pinSpacing: true,
            anticipatePin: 1,
          },
        });
      }, sectionRef);

      return () => {
        ctx.revert();
        ScrollTrigger.getAll().forEach((t) => t.kill());
      };
    });
  }, [trackWidth]);

  return (
    <section
      ref={sectionRef}
      aria-label="Horizontal showcase"
      className="relative hidden md:block overflow-hidden"
      style={{ minHeight: "100vh" }} // stable layout
    >
      <div
        ref={trackRef}
        className="flex h-screen"
        style={{ width: trackWidth || "100vw" }} // stable width
      >
        {sarees.map((saree, index) => (
          <div
            key={index}
            className="relative w-screen h-screen flex items-center justify-center"
          >
            <Image
              src={saree.image}
              alt={saree.title}
              fill
              sizes="100vw"
              priority={index === 0}
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/40" />
            <div className="relative z-10 text-center text-white px-6 max-w-xl">
              <h2 className="text-6xl font-serif mb-4">{saree.title}</h2>
              <p className="text-2xl mb-2">{saree.price}</p>
              <p className="text-lg mb-6 text-white/90">{saree.description}</p>
              <button className="bg-white text-gray-800 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
