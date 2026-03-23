"use client";
import { motion } from "framer-motion";

export default function SplashScreen() {
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
          src="/image-removebg-preview.png"
          layoutId="main-logo"
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
