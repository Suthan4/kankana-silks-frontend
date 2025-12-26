"use client"

import { motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"

export default function CTASection() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start center", "end center"],
  })

  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.95, 1, 1.05])
  const y = useTransform(scrollYProgress, [0, 1], [40, -40])

  return (
    <section
      ref={ref}
      className="relative py-32 px-4 bg-black text-white overflow-hidden"
    >
      <div className="absolute inset-0 opacity-5">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            duration: 20,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
          className="absolute top-10 right-10 w-96 h-96 rounded-full border border-background/10"
        />
      </div>

      <motion.div
        style={{ scale, y }}
        className="max-w-4xl mx-auto text-center relative z-10"
      >
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: false }}
          className="text-5xl md:text-6xl font-light mb-8 text-balance tracking-tight"
        >
          Begin Your Journey
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: false }}
          className="text-xl font-light mb-12 text-background/85"
        >
          Join our community of women who celebrate heritage and elegance
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: false }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-3 bg-white text-black font-medium rounded-sm hover:bg-opacity-90 transition-all"
          >
            Shop Now
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-3 border border-background rounded-sm font-medium hover:bg-background/10 transition-all"
          >
            Learn More
          </motion.button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: false }}
          className="mt-12 pt-8 border-t border-background/20 text-sm text-background/70 space-y-2"
        >
          <p>Free shipping on orders over ₹5,000</p>
          <p>30-day returns • Authentic craftsmanship • Certified silk</p>
        </motion.div>
      </motion.div>
    </section>
  );
}
