"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Download, Loader2 } from "lucide-react";
import SmartImage from "@/components/common/smartImage";
import { orderApi, type Order } from "@/lib/api/order.api";
import { extractVariantAttributes } from "@/lib/utils/variant.utils";

interface OrderCardProps {
  order: Order;
  isDownloading: boolean;
  onOpenOrder: (orderId: string) => void;
  onTrackOrder: (orderId: string) => void;
  onDownloadInvoice: (event: React.MouseEvent, order: Order) => void;
}

function OrderCardComponent({
  order,
  isDownloading,
  onOpenOrder,
  onTrackOrder,
  onDownloadInvoice,
}: OrderCardProps) {
  const firstItem = order.items?.[0];
  const productName = firstItem?.product?.name ?? "Product";
  const productImage =
    firstItem?.product?.media?.[0]?.thumbnailUrl ||
    firstItem?.product?.media?.[0]?.url ||
    "/images/placeholder.png";
  const canTrack = !!(
    order.shipment?.awbCode || order.shipment?.trackingNumber
  );
  const hasInvoice = [
    "SHIPPED",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
    "RETURNED",
    "COMPLETED",
  ].includes(order.status);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      className="bg-white rounded-2xl border-2 border-gray-100 overflow-hidden hover:shadow-xl transition-all cursor-pointer"
      onClick={() => onOpenOrder(order.id)}
    >
      <div className="p-4 sm:p-5 lg:p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="font-futura-bold text-base lg:text-lg mb-1">
              Order #{order.orderNumber}
            </div>
            <div className="text-xs text-gray-500">
              Placed on{" "}
              {new Date(order.createdAt).toLocaleDateString("en-IN", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </div>
          </div>
          <span
            className={`px-4 py-2 rounded-xl text-xs font-futura-bold ${orderApi.getStatusColor(
              order.status,
            )}`}
          >
            {orderApi.formatStatus(order.status)}
          </span>
        </div>

        {/* Product Info */}
        <div className="flex gap-3 sm:gap-4 mb-4 p-3 sm:p-4 bg-gray-50 rounded-xl">
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg ring-2 ring-gray-200 lg:h-24 lg:w-24">
            <SmartImage
              src={productImage}
              alt={productName}
              fill
              sizes="(max-width: 1024px) 80px, 96px"
              className="object-cover"
            />
          </div>

          <div className="flex-1">
            <div className="font-semibold text-sm lg:text-base mb-1 line-clamp-2 leading-snug">
              {productName}
              {order.items.length > 1 ? ` +${order.items.length - 1} more` : ""}
            </div>

            {/* Variant Chips */}
            {(() => {
              const variantAttrs = extractVariantAttributes(firstItem?.variant);
              if (variantAttrs.length === 0) return null;
              return (
                <div className="flex flex-wrap gap-2 mt-2">
                  {variantAttrs.map(({ key, value }) => (
                    <span
                      key={key}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-white border border-gray-200 text-gray-700 shadow-sm"
                    >
                      <span className="text-gray-500">{key}:</span>
                      <span className="text-gray-900 font-semibold">
                        {value}
                      </span>
                    </span>
                  ))}
                </div>
              );
            })()}

            <div className="text-xs text-gray-500 mt-2">
              {order.items.length} item(s)
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pt-4 border-t border-gray-200">
          <div>
            <div className="text-xs text-gray-500 mb-1">Total Amount</div>
            <div className="font-futura-bold text-xl lg:text-2xl">
              ₹{Number(order.total).toFixed(2)}
            </div>
          </div>
          <div className="flex items-stretch gap-2 flex-wrap sm:flex-nowrap justify-end">
            {/* ✅ Invoice Download Button - Only show if shipped/delivered */}
            {hasInvoice && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => onDownloadInvoice(e, order)}
                disabled={isDownloading}
                className="h-11 min-w-[44px] px-3 sm:px-4 bg-main-primary text-main-secondary rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDownloading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="hidden lg:inline">Downloading...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span className="hidden lg:inline">Invoice</span>
                  </>
                )}
              </motion.button>
            )}

            {/* ✅ Track Order Button - Only show if has AWB */}
            {canTrack && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onTrackOrder(order.id);
                }}
                className="h-11 px-4 sm:px-5 bg-black text-white rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 whitespace-nowrap"
              >
                Track Order
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            )}

            {/* View Details - Always show */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation();
                onOpenOrder(order.id);
              }}
              className="h-11 px-4 sm:px-5 border-2 border-gray-200 rounded-xl text-xs sm:text-sm font-semibold hover:bg-gray-50 transition-all flex items-center justify-center gap-2 whitespace-nowrap"
            >
              View Details
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export const OrderCard = memo(OrderCardComponent);
OrderCard.displayName = "OrderCard";
