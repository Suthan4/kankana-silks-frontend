// "use client";

// import {
//   motion,
//   useScroll,
//   useTransform,
//   AnimatePresence,
// } from "framer-motion";
// import { useRef, useState, useEffect } from "react";
// import { ChevronLeft, ChevronRight } from "lucide-react";
// import Image from "next/image";
// import { useAuthModal } from "@/store/useAuthModalStore";

// const heroSlides = [
//   {
//     type: "image",
//     src: "/kankana-silks-webp/DSC07534.webp", // LCP IMAGE (FIRST SLIDE)
//     alt: "Luxury silk saree with traditional weave",
//   },
//   {
//     type: "image",
//     src: "/kankana-silks-webp/DSC06184.webp",
//     alt: "Handcrafted heritage saree",
//   },
//   {
//     type: "video",
//     src: "/videos/kankana-hero-video.mp4",
//     poster: "/kankana-silks-webp/DSC07534.webp",
//     alt: "Saree collection video",
//   },
// ];

// export default function HeroSection() {
//   const ref = useRef<HTMLDivElement | null>(null);
//   const [currentSlide, setCurrentSlide] = useState(0);
//   const [autoPlay, setAutoPlay] = useState(true);
//   const [enableScrollAnim, setEnableScrollAnim] = useState(false);
//   const [enableVideo, setEnableVideo] = useState(false);
//   const {openModal} = useAuthModal()

//   /* ------------------ SCROLL ANIMATION ------------------ */
//   const { scrollYProgress } = useScroll({
//     target: ref,
//     offset: ["start start", "end center"],
//   });

//   const yTransform = useTransform(scrollYProgress, [0, 1], [0, 150]);
//   const y = enableScrollAnim ? yTransform : 0;

//   useEffect(() => {
//     requestIdleCallback(() => setEnableScrollAnim(true));
//   }, []);

//   /* ------------------ AUTOPLAY ------------------ */
//   useEffect(() => {
//     if (!autoPlay) return;
//     const interval = setInterval(() => {
//       setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
//     }, 5000);
//     return () => clearInterval(interval);
//   }, [autoPlay]);

//   /* ------------------ ENABLE VIDEO AFTER LOAD ------------------ */
//   useEffect(() => {
//     const onLoad = () => setEnableVideo(true);
//     window.addEventListener("load", onLoad);
//     return () => window.removeEventListener("load", onLoad);
//   }, []);

//   const nextSlide = () => {
//     setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
//     setAutoPlay(false);
//   };

//   const prevSlide = () => {
//     setCurrentSlide(
//       (prev) => (prev - 1 + heroSlides.length) % heroSlides.length
//     );
//     setAutoPlay(false);
//   };

//   const goToSlide = (index: number) => {
//     setCurrentSlide(index);
//     setAutoPlay(false);
//   };

//   return (
//     <section
//       ref={ref}
//       className="relative w-full min-h-screen overflow-hidden bg-background"
//       style={{ contain: "layout paint size" }}
//     >
//       {/* ------------------ BACKGROUND MEDIA ------------------ */}
//       <div className="absolute inset-0 w-full h-full overflow-hidden">
//         {heroSlides.map((slide, index) => (
//           <motion.div
//             key={index}
//             className="absolute inset-0 w-full h-full"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: index === currentSlide ? 1 : 0 }}
//             transition={{ duration: 0.8, ease: "easeInOut" }}
//             style={{ y }}
//           >
//             {slide.type === "image" ? (
//               <Image
//                 src={slide.src}
//                 alt={slide.alt}
//                 fill
//                 sizes="100vw"
//                 priority={index === 0}
//                 className="object-cover"
//               />
//             ) : (
//               <video
//                 src={slide.src}
//                 poster={slide.poster}
//                 className="w-full h-full object-cover"
//                 autoPlay
//                 muted
//                 loop
//                 playsInline
//                 preload="metadata"
//               />
//             )}
//           </motion.div>
//         ))}
//         <div className="absolute inset-0 bg-black/20" />
//       </div>
//       {/* <div className="absolute inset-0">
//         {heroSlides.map((slide, i) => (
//           <motion.div
//             key={i}
//             className="absolute inset-0"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: i === currentSlide ? 1 : 0 }}
//             transition={{ duration: 0.8, ease: "easeInOut" }}
//           >
//             <motion.div className="absolute inset-0" style={{ y }}>
//               {slide.type === "image" ? (
//                 <Image
//                   src={slide.src}
//                   alt={slide.alt}
//                   fill
//                   sizes="100vw"
//                   priority={i === 0}
//                   className="object-cover"
//                 />
//               ) : (
//                   (
//                   <video
//                     src={slide.src}
//                     poster={slide.poster}
//                     className="absolute inset-0 object-cover"
//                     autoPlay
//                     muted
//                     loop
//                     playsInline
//                     preload="metadata"
//                   />
//                 )
//               )}
//             </motion.div>
//           </motion.div>
//         ))}
//       </div> */}

//       {/* ------------------ CONTENT ------------------ */}
//       <div className="relative z-10 flex h-full items-center justify-center px-4">
//         <motion.div
//           className="text-center max-w-4xl"
//           initial={{ opacity: 0, y: 70 }}
//           animate={{ opacity: 1, y: "100%" }}
//           transition={{ duration: 1 }}
//         >
//           <h1 className="text-6xl md:text-8xl font-light text-white mb-6 tracking-tight">
//             Timeless Elegance
//           </h1>

//           <p className="text-xl md:text-2xl text-white/90 font-light mb-12">
//             Handcrafted heritage sarees for the modern woman
//           </p>

//           <button className="px-8 py-3 bg-white text-black font-medium rounded-full hover:scale-105 transition">
//             Explore Collection
//           </button>
//         </motion.div>
//       </div>

//       {/* ------------------ NAV CONTROLS ------------------ */}
//       <button
//         onClick={prevSlide}
//         className="absolute left-6 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-sm"
//         aria-label="Previous slide"
//       >
//         <ChevronLeft className="w-6 h-6 text-white" />
//       </button>

//       <button
//         onClick={nextSlide}
//         className="absolute right-6 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-sm"
//         aria-label="Next slide"
//       >
//         <ChevronRight className="w-6 h-6 text-white" />
//       </button>

//       {/* ------------------ DOTS ------------------ */}
//       <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
//         {heroSlides.map((_, index) => (
//           <button
//             key={index}
//             onClick={() => goToSlide(index)}
//             className={`rounded-full transition-all ${
//               index === currentSlide
//                 ? "bg-white w-8 h-2"
//                 : "bg-white/50 w-2 h-2 hover:bg-white/75"
//             }`}
//             aria-label={`Go to slide ${index + 1}`}
//           />
//         ))}
//       </div>
//     </section>
//   );
// }
"use client";

import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import bannerService, { Banner, MediaType } from "@/lib/api/banner.api.service";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const [enableScrollAnim, setEnableScrollAnim] = useState(false);
  // const [banners, setBanners] = useState<Banner[]>([]);
  const ref = useRef<HTMLDivElement | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  /* ------------------ FETCH BANNERS ------------------ */
  const {
    data: banners = [],
    isLoading: loading,
    isError,
  } = useQuery({
    queryKey: ["active-banners"],
    queryFn: () => bannerService.getActiveBanners(),
  });

  /* ------------------ SCROLL ANIMATION ------------------ */
  const { scrollYProgress } = useScroll(
    isMounted && ref.current
      ? {
          target: ref,
          offset: ["start start", "end center"],
        }
      : {}
  );

  const yTransform = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const y = enableScrollAnim ? yTransform : 0;

  useEffect(() => {
    requestIdleCallback(() => setEnableScrollAnim(true));
  }, []);

  /* ------------------ AUTOPLAY ------------------ */
  useEffect(() => {
    if (!autoPlay || banners.length === 0) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [autoPlay, banners.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length);
    setAutoPlay(false);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
    setAutoPlay(false);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setAutoPlay(false);
  };

  if (loading) {
    return (
      <section className="relative w-full min-h-screen overflow-hidden bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </section>
    );
  }

  if (banners.length === 0) {
    return (
      <section className="relative w-full min-h-screen overflow-hidden bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No banners available</p>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={ref}
      className="relative w-full min-h-screen overflow-hidden bg-background"
      style={{ contain: "layout paint size" }}
    >
      {/* ------------------ BACKGROUND MEDIA ------------------ */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        {banners.map((banner, index) => (
          <motion.div
            key={banner.id}
            className="absolute inset-0 w-full h-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: index === currentSlide ? 1 : 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            style={{ y }}
          >
            {banner.type === MediaType.IMAGE ? (
              <Image
                src={banner.url}
                alt={banner.title}
                fill
                sizes="100vw"
                priority={index === 0}
                className="object-cover"
              />
            ) : (
              <video
                src={banner.url}
                poster={banner.thumbnailUrl}
                className="w-full h-full object-cover"
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
              />
            )}
          </motion.div>
        ))}
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* ------------------ CONTENT ------------------ */}
      <div className="relative z-10 flex h-full items-center justify-center px-4">
        <motion.div
          className="text-center max-w-4xl"
          initial={{ opacity: 0, y: 70 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 250 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-6xl md:text-8xl font-light text-white mb-6 tracking-tight">
                {banners[currentSlide]?.title || "Timeless Elegance"}
              </h1>

              {banners[currentSlide]?.text && (
                <p className="text-xl md:text-2xl text-white/90 font-light mb-12">
                  {banners[currentSlide].text}
                </p>
              )}

              {banners[currentSlide]?.link && (
                <Link href={banners[currentSlide].link!}>
                  <button className="px-8 py-3 bg-white text-black font-medium rounded-full hover:scale-105 transition">
                    Explore Collection
                  </button>
                </Link>
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>

      {/* ------------------ NAV CONTROLS ------------------ */}
      {banners.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-6 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-sm transition"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-6 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-sm transition"
            aria-label="Next slide"
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>

          {/* ------------------ DOTS ------------------ */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`rounded-full transition-all ${
                  index === currentSlide
                    ? "bg-white w-8 h-2"
                    : "bg-white/50 w-2 h-2 hover:bg-white/75"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
