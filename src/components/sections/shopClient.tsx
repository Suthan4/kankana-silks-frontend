"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { buildCategoryQuery } from "@/lib/shared/builders/productCategoryQuery.builder.ts";
import { ChevronRight, Sparkles, Package } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: string;
  children?: Category[];
  isActive: boolean;
  order: number;
  _count?: {
    products: number;
  };
}

interface ShopClientProps {
  categories: Category[];
}

export default function ShopClient({ categories }: ShopClientProps) {
  const getCategoryUrl = (slug: string) => {
    const queryParams = buildCategoryQuery(slug);
    const searchParams = new URLSearchParams();

    Object.entries(queryParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });

    return `/shop/${slug}?${searchParams.toString()}`;
  };

  const totalProducts = categories.reduce(
    (sum, cat) => sum + (cat._count?.products || 0),
    0
  );

  const parentCategories = categories.filter((cat) => !cat.parentId);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-br from-yellow-50 via-white to-orange-50 border-b border-gray-200"
      >
        <div className="container mx-auto px-4 md:px-6 py-12 md:py-20">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full text-sm font-medium mb-6"
            >
              <Sparkles className="w-4 h-4" />
              <span>Premium Silk Collection</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl md:text-6xl font-light tracking-tight text-gray-900 mb-4"
            >
              Discover Timeless Elegance
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg md:text-xl text-gray-600 mb-8"
            >
              Explore {totalProducts.toLocaleString()}+ handcrafted
              masterpieces, each telling its own unique story
            </motion.p>

            {/* Trust Badges */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-wrap justify-center gap-8 text-sm text-gray-600"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  ✨
                </div>
                <span>100% Authentic</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  🎨
                </div>
                <span>Handcrafted Excellence</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  🛡️
                </div>
                <span>Trusted Quality</span>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Categories Grid */}
      <div className="container mx-auto px-4 md:px-6 py-12">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mb-8"
        >
          <h2 className="text-3xl font-light text-gray-900 mb-2">
            Find Your Perfect Style
          </h2>
          <p className="text-gray-600">
            Discover timeless elegance in every collection
          </p>
        </motion.div>

        {categories.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No categories available</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {parentCategories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                whileHover={{ y: -8 }}
                className="group"
              >
                <Link href={getCategoryUrl(category.slug)}>
                  <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
                    {/* Image */}
                    <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                      {category.image ? (
                        <motion.div
                          initial={{ scale: 1 }}
                          whileHover={{ scale: 1.1 }}
                          transition={{ duration: 0.6, ease: "easeOut" }}
                          className="w-full h-full"
                        >
                          <Image
                            src={category.image}
                            alt={category.name}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                        </motion.div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                          <Package className="w-16 h-16 text-gray-400" />
                        </div>
                      )}

                      {/* Product Count Badge */}
                      {category._count?.products && (
                        <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-gray-900 shadow-lg">
                          {category._count.products} items
                        </div>
                      )}

                      {/* Overlay on hover */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6">
                        <motion.span
                          initial={{ y: 10, opacity: 0 }}
                          whileHover={{ y: 0, opacity: 1 }}
                          className="text-white font-medium text-sm"
                        >
                          Explore Collection
                        </motion.span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-yellow-600 transition-colors">
                            {category.name}
                          </h3>
                          {category.description && (
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {category.description}
                            </p>
                          )}
                        </div>
                        <motion.div
                          className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-yellow-400 transition-colors"
                          whileHover={{ x: 4 }}
                        >
                          <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-gray-900" />
                        </motion.div>
                      </div>

                      {/* Subcategories Preview */}
                      {category.children && category.children.length > 0 && (
                        <div className="pt-3 border-t border-gray-100">
                          <div className="flex flex-wrap gap-2">
                            {category.children.slice(0, 3).map((subCat) => (
                              <span
                                key={subCat.id}
                                className="text-xs px-2 py-1 bg-gray-50 text-gray-600 rounded-full hover:bg-yellow-50 hover:text-yellow-700 transition-colors"
                              >
                                {subCat.name}
                              </span>
                            ))}
                            {category.children.length > 3 && (
                              <span className="text-xs px-2 py-1 text-gray-400">
                                +{category.children.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom CTA Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="bg-gradient-to-r from-yellow-50 to-orange-50 border-y border-gray-200 mt-16"
      >
        <div className="container mx-auto px-4 md:px-6 py-12 text-center">
          <h2 className="text-2xl md:text-3xl font-light text-gray-900 mb-4">
            Looking for Something Special?
          </h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            We're here to help you find the perfect piece. From custom orders to
            personalized recommendations, our team is ready to assist you.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/contact"
              className="px-6 py-3 bg-gray-900 text-white rounded-full font-medium hover:bg-gray-800 transition-colors"
            >
              Get in Touch
            </Link>
            <Link
              href="/about"
              className="px-6 py-3 border-2 border-gray-900 text-gray-900 rounded-full font-medium hover:bg-gray-900 hover:text-white transition-colors"
            >
              Our Story
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
