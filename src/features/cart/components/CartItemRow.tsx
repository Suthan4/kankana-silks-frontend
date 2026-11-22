"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { extractVariantAttributes } from "@/lib/utils/variant.utils";
import type { CartStockState, StockMessage } from "@/lib/utils/cartStock";

interface CartItemRowProps {
  item: any;
  index: number;
  stockState: CartStockState;
  stockMessage: StockMessage | null;
  canIncreaseQuantity: boolean;
  unitPrice: number;
  isUpdating: boolean;
  isRemoving: boolean;
  onRemove: () => void;
  onQuantityChange: (quantity: number) => void;
}

export function CartItemRow({
  item,
  index,
  stockState,
  stockMessage,
  canIncreaseQuantity,
  unitPrice,
  isUpdating,
  isRemoving,
  onRemove,
  onQuantityChange,
}: CartItemRowProps) {
  const variantAttributes = extractVariantAttributes(item?.variant);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -80 }}
      transition={{ delay: index * 0.04 }}
      className="bg-white rounded-xl p-3.5 shadow-sm border border-white/80 hover:shadow-md transition"
    >
      <div className="flex gap-3">
        <Link href={`/products/${item?.product?.slug}`}>
          <motion.div
            whileHover={{ scale: 1.04 }}
            className="w-16 h-16 lg:w-20 lg:h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 cursor-pointer"
          >
            {item?.product?.media?.[0]?.url ? (
              <Image
                src={item.product.media[0].url}
                alt={item.product?.name ?? "Cart item"}
                width={80}
                height={80}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-200">
                <ShoppingBag className="w-6 h-6 text-gray-400" />
              </div>
            )}
          </motion.div>
        </Link>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <Link href={`/products/${item?.product?.slug}`}>
                <h3 className="font-bold text-gray-900 text-sm hover:text-main-primary transition cursor-pointer line-clamp-1">
                  {item.product?.name}
                </h3>
              </Link>
              {variantAttributes.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {variantAttributes.map(({ key, value }) => (
                    <span
                      key={key}
                      className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600 font-medium"
                    >
                      {key}: <span className="text-gray-900 font-semibold">{value}</span>
                    </span>
                  ))}
                </div>
              )}
              {stockMessage && (
                <div className="mt-2">
                  <span
                    className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md border ${
                      stockMessage.type === "error"
                        ? "text-red-700 bg-red-50 border-red-200"
                        : stockMessage.type === "warning"
                          ? "text-amber-800 bg-amber-50 border-amber-200"
                          : "text-gray-600 bg-gray-50 border-gray-200"
                    }`}
                    role={stockMessage.type === "error" ? "alert" : "status"}
                  >
                    {stockMessage.type === "warning" && (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                    )}
                    {stockMessage.message}
                  </span>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={onRemove}
              disabled={isRemoving}
              aria-label={`Remove ${item.product?.name ?? "product"} from cart`}
              aria-busy={isRemoving}
              className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition flex-shrink-0 disabled:cursor-wait disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center justify-between mt-2.5">
            <p className="text-lg font-bold text-gray-900">
              ₹{unitPrice.toLocaleString("en-IN")}
            </p>
            <div className="flex items-center gap-1.5 bg-gray-100 rounded-full px-2 py-1">
              <button
                type="button"
                onClick={() => onQuantityChange(Number(item.quantity) - 1)}
                disabled={Number(item.quantity) <= 1 || isUpdating}
                aria-label={`Decrease ${item.product?.name ?? "product"} quantity`}
                className="w-7 h-7 flex items-center justify-center text-gray-600 hover:text-gray-900 transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-7 text-center font-bold text-gray-900 text-sm">
                {item.quantity}
              </span>
              <button
                type="button"
                onClick={() => onQuantityChange(Number(item.quantity) + 1)}
                disabled={isUpdating || !canIncreaseQuantity}
                aria-label={`Increase ${item.product?.name ?? "product"} quantity`}
                title={
                  !canIncreaseQuantity
                    ? stockState.isLastOne
                      ? "Only one item is available"
                      : "Maximum available quantity reached"
                    : "Increase quantity"
                }
                className="w-7 h-7 flex items-center justify-center text-white bg-gray-900 rounded-full hover:bg-gray-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
