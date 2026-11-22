"use client";
import { useRef, useState } from "react";
import { motion } from "framer-motion";
import DOMPurify from "isomorphic-dompurify";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperInstance } from "swiper";
import "swiper/css";
import type { Product } from "@/lib/api/product.api";

interface ProductDetailsTabsProps {
  product: Product;
}

export function ProductDetailsTabs({ product }: ProductDetailsTabsProps) {
  const [activeTab, setActiveTab] = useState<"details" | "specs">("details");
  const detailsSwiperRef = useRef<SwiperInstance | null>(null);

  return (
    <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow p-5 md:p-7 mb-10 mt-4"
          >
            <div className="flex gap-6 border-b border-gray-200 mb-5">
              {(["details", "specs"] as const).map((tab, index) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab);
                    detailsSwiperRef.current?.slideTo(index);
                  }}
                  className={`pb-2.5 font-semibold transition relative capitalize text-sm ${activeTab === tab ? "text-black" : "text-gray-400"}`}
                >
                  {tab}
                  {activeTab === tab && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-black"
                    />
                  )}
                </button>
              ))}
            </div>

            <Swiper
              onSwiper={(swiper) => {
                detailsSwiperRef.current = swiper;
              }}
              onSlideChange={(swiper) =>
                setActiveTab(swiper.activeIndex === 0 ? "details" : "specs")
              }
              slidesPerView={1}
              autoHeight
              speed={350}
              threshold={8}
              touchAngle={45}
              resistance
              className="product-details-swiper"
            >
              <SwiperSlide>
                <div className="product-description">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(product.description),
                    }}
                  />
                </div>
              </SwiperSlide>

              <SwiperSlide>
                {product.specifications && product.specifications.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-3">
                    {product.specifications.map((spec) => (
                      <div
                        key={spec.id}
                        className="flex justify-between py-2 border-b text-sm"
                      >
                        <span className="font-medium text-gray-700">
                          {spec.key}
                        </span>
                        <span className="text-gray-600">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">
                    No specifications available
                  </p>
                )}
              </SwiperSlide>
            </Swiper>
          </motion.div>
  );
}

export function ProductDetailsTabs({ product }: ProductDetailsTabsProps) {
  const [activeTab, setActiveTab] = useState<"details" | "specs">("details");
  const detailsSwiperRef = useRef<SwiperInstance | null>(null);

  return (
    <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow p-5 md:p-7 mb-10 mt-4"
          >
            <div className="flex gap-6 border-b border-gray-200 mb-5">
              {(["details", "specs"] as const).map((tab, index) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab);
                    detailsSwiperRef.current?.slideTo(index);
                  }}
                  className={`pb-2.5 font-semibold transition relative capitalize text-sm ${activeTab === tab ? "text-black" : "text-gray-400"}`}
                >
                  {tab}
                  {activeTab === tab && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-black"
                    />
                  )}
                </button>
              ))}
            </div>

            <Swiper
              onSwiper={(swiper) => {
                detailsSwiperRef.current = swiper;
              }}
              onSlideChange={(swiper) =>
                setActiveTab(swiper.activeIndex === 0 ? "details" : "specs")
              }
              slidesPerView={1}
              autoHeight
              speed={350}
              threshold={8}
              touchAngle={45}
              resistance
              className="product-details-swiper"
            >
              <SwiperSlide>
                <div className="product-description">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(product.description),
                    }}
                  />
                </div>
              </SwiperSlide>

              <SwiperSlide>
                {product.specifications && product.specifications.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-3">
                    {product.specifications.map((spec) => (
                      <div
                        key={spec.id}
                        className="flex justify-between py-2 border-b text-sm"
                      >
                        <span className="font-medium text-gray-700">
                          {spec.key}
                        </span>
                        <span className="text-gray-600">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">
                    No specifications available
                  </p>
                )}
              </SwiperSlide>
            </Swiper>
          </motion.div>
  );
}
