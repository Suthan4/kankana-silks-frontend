"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";

export default function CTASection() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start center", "end center"],
  });

  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.95, 1, 1.05]);
  const y = useTransform(scrollYProgress, [0, 1], [40, -40]);

  return (
    <section
      ref={ref}
      className="
        relative
        overflow-hidden
        bg-black
        px-4
        pb-16
        pt-10

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

      <motion.div
        style={{ scale, y }}
        className="relative z-10 mx-auto max-w-4xl text-center"
      >
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          whileInView={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: false, amount: 0.1 }}
          className="mx-auto mb-4 h-px w-10 bg-white/40 sm:mb-6 sm:w-14"
        />

        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: false, amount: 0.1 }}
          className="
            mb-4
            text-balance
            text-3xl
            font-light
            tracking-tight
            text-white

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
          viewport={{ once: false, amount: 0.1 }}
          className="
            mb-8
            text-sm
            font-light
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
          viewport={{ once: false, amount: 0.1 }}
          className="
            mx-auto
            flex
            w-full
            max-w-xs
            flex-col
            justify-center
            gap-3

            sm:max-w-none
            sm:flex-row
            sm:gap-4
          "
        >
          <Link href={`/shop`} className="w-full sm:w-auto">
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
                py-3.5
                text-xs
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
                border
                border-white/70
                px-8
                py-3.5
                text-xs
                font-semibold
                uppercase
                tracking-[0.16em]
                text-white
                transition-all
                hover:border-white
                hover:bg-white/10

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
      </motion.div>
    </section>
  );
}
