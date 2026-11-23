"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/api/product.api";

interface RelatedProductsProps {
  products: Product[];
}

export function RelatedProducts({ products }: RelatedProductsProps) {
  const relatedProducts = products;

  return (
    <>
      {relatedProducts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="text-2xl font-futura-bold text-gray-900 mb-5">
            You May Also Like
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {relatedProducts.map((relatedProduct, idx) => (
              <Link
                key={relatedProduct.id}
                href={`/products/${relatedProduct.slug}`}
              >
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.08 }}
                  whileHover={{ y: -6 }}
                  className="bg-white rounded-xl overflow-hidden shadow hover:shadow-xl transition cursor-pointer"
                >
                  <div className="aspect-square overflow-hidden relative">
                    <Image
                      src={relatedProduct.media?.[0]?.url || "/placeholder.jpg"}
                      alt={relatedProduct.name}
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-cover"
                    />
                  </div>
                  <div className="p-3">
                    <h4 className="font-semibold text-sm mb-1 line-clamp-2">
                      {relatedProduct.name}
                    </h4>
                    <p className="font-futura-bold text-sm">
                      ₹
                      {Number(relatedProduct.sellingPrice).toLocaleString(
                        "en-IN",
                        {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        },
                      )}
                    </p>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.div>
      )}
    </>
  );
}
