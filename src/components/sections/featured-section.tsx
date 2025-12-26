"use client"

import { motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"

function FeaturedItem({ item, index }: { item: any; index: number }) {
  const itemRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: itemRef,
    offset: ["start center", "end center"],
  })
  const itemY = useTransform(scrollYProgress, [0, 1], [40, -40])

  return (
    <motion.div
      ref={itemRef}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: index * 0.2 }}
      viewport={{ once: false, margin: "-100px" }}
      className="group overflow-hidden"
    >
      <div className="relative h-96 overflow-hidden bg-secondary rounded-sm">
        <motion.img
          src={item.image}
          alt={item.title}
          style={{ y: itemY }}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
      </div>
      <div className="pt-6">
        <h3 className="text-2xl font-light mb-2 text-foreground">{item.title}</h3>
        <p className="text-muted-foreground font-light">{item.description}</p>
      </div>
    </motion.div>
  )
}

export default function FeaturedSection() {
  const items = [
    {
      image: "/luxury-silk-saree-traditional-weave.jpg",
      title: "Kanjeevarams",
      description: "Pure silk, intricately woven with traditional craftsmanship",
    },
    {
      image: "/elegant-banarasi-saree-gold-work.jpg",
      title: "Banarasi Collection",
      description: "Opulent gold-threaded designs for special occasions",
    },
  ]

  return (
    <section className="py-24 px-4 bg-background">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: false, margin: "-100px" }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-light mb-6 text-foreground text-balance">This Season's Finest</h2>
          <div className="w-12 h-px bg-accent mx-auto" />
        </motion.div>

        {/* Featured Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {items.map((item, idx) => (
            <FeaturedItem key={idx} item={item} index={idx} />
          ))}
        </div>
      </div>
    </section>
  )
}
