"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

// No scroll-linked scale/parallax here on purpose. It was driven by
// useScroll/useTransform on the main thread, and the progress is recomputed
// every time iOS Safari's toolbar collapses or expands (the viewport height
// changes), so the content jumped by up to ~80px while the page loaded.
// Entrance animations also run once (not on every enter/leave of the viewport).
export default function CTASection() {
  return (
    <section
      className="
        relative
        overflow-hidden
        bg-[#5E3538]
        px-7
        pb-10
        pt-11

        sm:pb-24
        sm:pt-16

        md:py-32
      "
    >
      <div className="absolute inset-0 opacity-5">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            duration: 20,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
          className="
            absolute
            right-4
            top-4
            h-56
            w-56
            rounded-full
            border
            border-background/10

            sm:right-10
            sm:top-10
            sm:h-96
            sm:w-96
          "
        />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl text-center">
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          whileInView={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, amount: 0.1 }}
          className="mx-auto mb-0 h-px w-14 bg-white/40 sm:mb-6 sm:w-14"
        />

        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, amount: 0.1 }}
          className="
            mt-7 mb-0
            text-balance
            text-[34px]
            font-medium
            leading-tight
            tracking-normal
            text-white
            [font-family:'Cormorant_Garamond',serif]

            sm:mb-6
            sm:text-5xl

            md:mb-8
            md:text-6xl
          "
        >
          Begin Your Journey
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          viewport={{ once: true, amount: 0.1 }}
          className="
            mt-3 mb-0
            max-w-[280px]
            text-[15px]
            leading-[1.55]
            font-normal
            text-white/85

            sm:mb-12
            sm:text-xl
          "
        >
          Join our community of women who celebrate heritage and elegance
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true, amount: 0.1 }}
          className="
            mx-auto
            flex
            w-full
            mt-7
            max-w-[300px]
            flex-col
            justify-center
            gap-0

            sm:max-w-none
            sm:flex-row
            sm:gap-4
          "
        >
          <Link
            href={`/shop`}
            aria-label="Shop Now – browse all sarees"
            className="w-full sm:w-auto"
          >
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="
                group
                inline-flex
                w-full
                items-center
                justify-center
                gap-2
                bg-white
                px-8
                h-[52px]
                py-0
                text-sm
                font-semibold
                uppercase
                tracking-[0.16em]
                text-black
                transition-all
                hover:bg-white/90

                sm:w-auto
                sm:py-3
                sm:text-sm
              "
            >
              Shop Now
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </motion.button>
          </Link>
          <Link href={`/about-us`} className="w-full sm:w-auto">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="
                inline-flex
                w-full
                items-center
                justify-center
                border-0
                border-white/70
                px-0
                py-0
                text-sm
                font-semibold
                uppercase
                tracking-[0.16em]
                text-white
                underline
                underline-offset-[6px]
                transition-opacity
                hover:opacity-80

                sm:w-auto
                sm:py-3
                sm:text-sm
              "
            >
              Our Story
            </motion.button>
          </Link>
        </motion.div>

        {/* <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: false }}
          className="mt-12 pt-8 border-t border-background/20 text-sm text-background/70 space-y-2"
        >
          <p>Free shipping on orders over ₹5,000</p>
          <p>30-day returns • Authentic craftsmanship • Certified silk</p>
        </motion.div> */}
      </div>
    </section>
  );
}
