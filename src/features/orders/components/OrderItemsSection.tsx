"use client";

import { motion } from "framer-motion";
import SmartImage from "@/components/common/smartImage";
import { extractVariantAttributes } from "@/lib/utils/variant.utils";

interface OrderItemsSectionProps {
  items: any[];
}

export function OrderItemsSection({ items }: OrderItemsSectionProps) {
  return (
<motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6"
        >
          <h3 className="font-semibold mb-4">Order Items</h3>
          <div className="space-y-4">
            {items.map((item: any) => {
              const productName =
                item?.product?.name ?? item?.productName ?? "Product";
              const productImage =
                item?.product?.media?.[0]?.thumbnailUrl ||
                item?.product?.media?.[0]?.url ||
                item?.image ||
                "/images/placeholder.png";
              const qty = Number(item?.quantity ?? 0);
              const unitPrice = Number(item?.price ?? 0);
              const variantAttrs = extractVariantAttributes(item?.variant);

              return (
                <div
                  key={item.id}
                  className="flex gap-4 p-4 bg-gray-50 rounded-xl"
                >
                  <div className="relative w-20 h-20 lg:w-24 lg:h-24 rounded-lg overflow-hidden ring-2 ring-gray-200 flex-shrink-0">
                    <SmartImage
                      src={productImage}
                      alt={productName}
                      fill
                      sizes="(max-width: 1024px) 80px, 96px"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1">{productName}</h4>
                    {variantAttrs.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {variantAttrs.map(({ key, value }) => (
                          <span
                            key={key}
                            className="text-xs bg-white border border-gray-200 px-2 py-0.5 rounded-full text-gray-700 font-medium"
                          >
                            {key}:{" "}
                            <span className="font-semibold text-gray-900">
                              {value}
                            </span>
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Qty: {qty}</span>
                      <div className="text-right">
                        <div className="text-xs text-gray-500">
                          ₹{unitPrice.toFixed(2)} × {qty}
                        </div>
                        <div className="font-semibold">
                          ₹{(unitPrice * qty).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
  );
}
