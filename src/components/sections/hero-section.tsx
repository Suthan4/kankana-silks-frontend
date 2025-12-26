"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
const heroSlides = [
  {
    type: "image",
    src: "https://nfteccx7oojuechu.public.blob.vercel-storage.com/static/kankana-silks/DSC07534.jpg",
    alt: "Luxury silk saree with traditional weave",
  },
  {
    type: "image",
    src: "https://nfteccx7oojuechu.public.blob.vercel-storage.com/static/kankana-silks/DSC06184.jpg",
    alt: "Handcrafted heritage saree",
  },
  {
    type: "video",
    src: "/videos/kankana-hero-video.mp4",
    poster: "/luxury-silk-saree-traditional-weave.jpg",
    alt: "Saree collection video",
  },
];

const MotionImage = motion(Image);
export default function HeroSection() {
  const ref = useRef(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end center"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, 150]);

  useEffect(() => {
    if (!autoPlay) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [autoPlay]);

  useEffect(() => {
    videoRefs.current.forEach((video, index) => {
      if (video) {
        if (index === currentSlide && heroSlides[index].type === "video") {
          video.play().catch((err) => console.log("Video play error:", err));
        } else {
          video.pause();
          video.currentTime = 0;
        }
      }
    });
  }, [currentSlide]);

  const goToSlide = (index:number) => {
    setCurrentSlide(index);
    setAutoPlay(false);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    setAutoPlay(false);
  };

  const prevSlide = () => {
    setCurrentSlide(
      (prev) => (prev - 1 + heroSlides.length) % heroSlides.length
    );
    setAutoPlay(false);
  };

  return (
    <section
      ref={ref}
      className="relative w-full overflow-hidden bg-background"
    >
      <div className="relative w-full h-screen flex items-center justify-center overflow-hidden">
        {/* Carousel Slides */}
        {heroSlides.map((slide, index) => (
          <motion.div
            key={index}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: index === currentSlide ? 1 : 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          >
            {slide.type === "image" ? (
              <MotionImage
                src={slide.src}
                alt={slide.alt}
                className="w-full h-full object-cover"
                style={{ y}}
                width={500}
                height={500}
                priority
              />
            ) : (
              <motion.video
                ref={(el) => {
                  videoRefs.current[index] = el;
                }}
                src={slide.src}
                poster={slide.poster}
                className="w-full h-full object-cover"
                style={{ y }}
                loop
                muted
                playsInline
              />
            )}
            <div className="absolute inset-0 bg-black/20" />
          </motion.div>
        ))}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="relative z-10 text-center px-4 max-w-4xl"
        >
          <motion.h1
            className="text-6xl md:text-8xl font-light text-white mb-6 tracking-tight text-balance"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
          >
            Timeless Elegance
          </motion.h1>
          <motion.p
            className="text-xl md:text-2xl text-white/90 font-light mb-12 tracking-wide"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
          >
            Handcrafted heritage sarees for the modern woman
          </motion.p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-3 bg-white text-black font-medium rounded-full hover:bg-opacity-90 transition-all"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.8 }}
          >
            Explore Collection
          </motion.button>
        </motion.div>

        <button
          onClick={prevSlide}
          className="absolute left-6 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/20 hover:bg-white/40 transition-all backdrop-blur-sm"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-6 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/20 hover:bg-white/40 transition-all backdrop-blur-sm"
          aria-label="Next slide"
        >
          <ChevronRight className="w-6 h-6 text-white" />
        </button>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {heroSlides.map((_, index) => (
            <motion.button
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
      </div>
    </section>
  );
}
