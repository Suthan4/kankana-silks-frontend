"use client"

import { motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"

function CollectionCard({ collection, index }: { collection: any; index: number }) {
  const itemRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: itemRef,
    offset: ["start center", "end center"],
  })
  const yOffset = useTransform(scrollYProgress, [0, 1], [index === 1 ? 0 : 50, index === 1 ? 0 : -50])

  return (
    <motion.div
      ref={itemRef}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: index * 0.15 }}
      viewport={{ once: false, margin: "-100px" }}
      className="group cursor-pointer"
    >
      <div className="relative h-96 overflow-hidden rounded-4xl">
        <motion.img
          src={collection.image || "/placeholder.svg"}
          alt={collection.name}
          style={{ y: yOffset }}
          className="w-full h-full object-fill group-hover:scale-110 transition-transform duration-700"
        />
        <div
          className={`absolute inset-0 bg-gradient-to-t ${collection.color} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
        />
      </div>
      <motion.h3
        className="text-xl font-light mt-4 text-foreground group-hover:text-accent transition-colors"
        whileHover={{ x: 5 }}
      >
        {collection.name}
      </motion.h3>
    </motion.div>
  )
}

export default function CollectionsSection() {
  const collections = [
    {
      name: "Wedding",
      image: "/bridal-saree-wedding-luxury-red-gold.jpg",
      color: "from-red-900/30",
    },
    {
      name: "Festive",
      image: "/festive-saree-colorful-traditional-celebration.jpg",
      color: "from-yellow-900/30",
    },
    {
      name: "Daily Wear",
      image: "/casual-elegant-cotton-saree-everyday.jpg",
      color: "from-blue-900/30",
    },
  ]

  return (
    <section className="py-24 px-4 bg-background">
      <div className="md:px-4 mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: false, margin: "-100px" }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-light mb-6 text-foreground text-balance">Curated Collections</h2>
          <div className="w-12 h-px bg-accent mx-auto" />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {collections.map((collection, idx) => (
            <CollectionCard key={idx} collection={collection} index={idx} />
          ))}
        </div>
      </div>
    </section>
  )
}
