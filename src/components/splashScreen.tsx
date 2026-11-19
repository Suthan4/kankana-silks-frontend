"use client";
import { motion } from "framer-motion";
import { getImageProps } from "next/image";
import { useEffect, useState } from "react";
import { preload } from "react-dom";

// Served as a small AVIF/WebP instead of the 25 KB PNG, and fetched first:
// on desktop this logo is the page's first big paint.
const { props: logo } = getImageProps({
  src: "/image-removebg-preview.png",
  alt: "Kankana Silks",
  width: 316,
  height: 152,
  sizes: "233px",
  loading: "eager",
  fetchPriority: "high",
});

export default function SplashScreen() {
  const [isMobile, setIsMobile] = useState(false);

  preload(logo.src, {
    as: "image",
    imageSrcSet: logo.srcSet,
    imageSizes: "233px",
    fetchPriority: "high",
  });

  useEffect(() => {
    const checkScreen = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkScreen();

    window.addEventListener("resize", checkScreen);

    return () => window.removeEventListener("resize", checkScreen);
  }, []);
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-white"
    >
      {/* 🔥 WRAPPER ANIMATION (SAFE) */}
      <motion.div
        animate={{
          scale: [1, 1.05, 1], // subtle pulse
          opacity: [1, 0.5, 1], // blink feel
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        {/* 🔥 MAIN LOGO (NO animate here) */}
        <motion.img
          src={logo.src}
          srcSet={logo.srcSet}
          sizes={logo.sizes}
          alt={logo.alt}
          width={logo.width}
          height={logo.height}
          loading="eager"
          fetchPriority="high"
          decoding="async"
          layoutId={isMobile ? "mobile-logo" : "desktop-logo"}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 18,
            mass: 0.6,
          }}
          className="h-28 w-auto"
        />
      </motion.div>
    </motion.div>
  );
}
