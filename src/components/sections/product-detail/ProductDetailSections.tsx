"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Check, MapPin, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import DOMPurify from "isomorphic-dompurify";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperInstance } from "swiper";
import "swiper/css";
import type { Product } from "@/lib/api/product.api";

export interface ProductDeliveryInfo {
  isServiceable: boolean;
  estimatedDays: string;
  checked: boolean;
}

interface ProductDeliveryCheckerProps {
  isOutOfStock: boolean;
  pincode: string;
  onPincodeChange: (value: string) => void;
  deliveryInfo: ProductDeliveryInfo | null;
  isCheckingDelivery: boolean;
  onCheckDelivery: () => void;
  onCheckDeliveryAvailability: (pincode: string) => void;
}

export function ProductDeliveryChecker({
  isOutOfStock,
  pincode,
  onPincodeChange,
  deliveryInfo,
  isCheckingDelivery,
  onCheckDelivery,
  onCheckDeliveryAvailability,
}: ProductDeliveryCheckerProps) {
  return (
    {!isOutOfStock && (
                  <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
                    <div className="flex items-center gap-1.5 mb-2">
                      <MapPin className="w-4 h-4 text-gray-700" />
                      <h3 className="font-semibold text-gray-900 text-xs">
                        Check Delivery
                      </h3>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Enter Pincode"
                        value={pincode}
                        onChange={(e) => onPincodeChange(e.target.value)}
                        maxLength={6}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-sm"
                        onKeyDown={(e) => {
                          if (e.key === "Enter")
                            onCheckDeliveryAvailability(pincode);
                        }}
                      />
                      <button
                        onClick={onCheckDelivery}
                        disabled={isCheckingDelivery}
                        className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition text-xs font-medium disabled:opacity-50"
                      >
                        {isCheckingDelivery ? "..." : "Check"}
                      </button>
                    </div>

                    {deliveryInfo?.checked && (
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`mt-2 p-3 rounded-xl flex items-center gap-2 ${
                          deliveryInfo.isServiceable
                            ? "bg-[#58292C]/10 border border-[#58292C]/20"
                            : "bg-red-50 border border-red-200"
                        }`}
                      >
                        {deliveryInfo.isServiceable ? (
                          <Check className="w-4 h-4 text-main-secondary flex-shrink-0" />
                        ) : (
                          <X className="w-4 h-4 text-red-600 flex-shrink-0" />
                        )}
                        <div>
                          <p
                            className={`font-medium text-sm ${
                              deliveryInfo.isServiceable
                                ? "text-main-primary"
                                : "text-red-900"
                            }`}
                          >
                            {deliveryInfo.isServiceable
                              ? "Delivery Available"
                              : "Not Serviceable"}
                          </p>
                          {deliveryInfo.isServiceable && (
                            <p className="text-xs text-main-secondary">
                              Expected in {deliveryInfo.estimatedDays}
                            </p>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </div>
                )}
  );
}

interface ProductQuantitySelectorProps {
  isOutOfStock: boolean;
  quantity: number;
  maxAllowedQuantity: number;
  onQuantityChange: (quantity: number) => void;
}

export function ProductQuantitySelector({
  isOutOfStock,
  quantity,
  maxAllowedQuantity,
  onQuantityChange,
}: ProductQuantitySelectorProps) {
  return (
    {!isOutOfStock && (
                  <div>
                    <h3 className="font-semibold text-gray-900 text-xs mb-1.5">
                      Quantity
                    </h3>
                    <div className="flex items-center gap-3">
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
                        className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center font-bold text-sm"
                      >
                        −
                      </motion.button>
                      <span className="text-lg font-semibold w-8 text-center">
                        {quantity}
                      </span>
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() =>
                          onQuantityChange(Math.min(maxAllowedQuantity, quantity + 1))
                        }
                        disabled={quantity >= maxAllowedQuantity}
                        className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center font-bold text-sm disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        +
                      </motion.button>
                    </div>
                  </div>
                )}
  );
}

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

interface RelatedProductsProps {
  products: Product[];
}

export function RelatedProducts({ products }: RelatedProductsProps) {
  const relatedProducts = products;

  return (
    {relatedProducts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-5">
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
                          src={
                            relatedProduct.media?.[0]?.url || "/placeholder.jpg"
                          }
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
                        <p className="font-bold text-sm">
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
  );
}
