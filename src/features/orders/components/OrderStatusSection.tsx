"use client";

import { motion } from "framer-motion";
import {
  Calendar,
  CheckCircle2,
  Navigation,
  Package,
  RotateCcw,
  Truck,
  XCircle,
} from "lucide-react";
import { orderApi, type Order } from "@/lib/api/order.api";

interface OrderStatusSectionProps {
  order: Order;
  canTrack: boolean;
  canReturn: boolean;
  hoursRemaining: number;
  canCancel: boolean;
  cancelPending: boolean;
  onTrackOrder: () => void;
  onReturnOrder: () => void;
  onCancelOrder: () => void;
}

export function OrderStatusSection({
  order,
  canTrack,
  canReturn,
  hoursRemaining,
  canCancel,
  cancelPending,
  onTrackOrder,
  onReturnOrder,
  onCancelOrder,
}: OrderStatusSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-br ${orderApi.getStatusGradient(order.status)} text-white rounded-2xl p-6`}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm opacity-80 mb-1">Order Status</p>
          <h2 className="text-2xl font-futura-bold">
            {orderApi.formatStatus(order.status)}
          </h2>
        </div>
        <div className="bg-white/20 p-3 rounded-full">
          {order.status === "DELIVERED" || order.status === "COMPLETED" ? (
            <CheckCircle2 className="w-6 h-6" />
          ) : order.status === "SHIPPED" ||
            order.status === "OUT_FOR_DELIVERY" ? (
            <Truck className="w-6 h-6" />
          ) : order.status === "CANCELLED" ? (
            <XCircle className="w-6 h-6" />
          ) : (
            <Package className="w-6 h-6" />
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 text-sm opacity-90 mb-4">
        <Calendar className="w-4 h-4" />
        <span>
          Placed on{" "}
          {new Date(order.createdAt).toLocaleDateString("en-IN", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </span>
      </div>

      {/* ✅ Action Buttons - Conditionally shown */}
      <div className="flex flex-col sm:flex-row gap-2">
        {/* ✅ Track Order Button - Only if has AWB */}
        {canTrack && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onTrackOrder()}
            className="flex-1 bg-white text-black py-3 rounded-lg font-medium hover:bg-gray-100 transition flex items-center justify-center gap-2"
          >
            <Navigation className="w-4 h-4" />
            Track Package
          </motion.button>
        )}

        {/* ✅ Return Button - ONLY show if status is DELIVERED and within window */}
        {canReturn && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onReturnOrder()}
            className="flex-1 bg-yellow-500 text-black py-3 rounded-lg font-semibold hover:bg-yellow-600 transition flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Return ({Math.floor(hoursRemaining)}h left)
          </motion.button>
        )}

        {/* ✅ Cancel Button - Only before shipped */}
        {canCancel && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onCancelOrder}
            disabled={cancelPending}
            className="flex-1 bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50"
          >
            {cancelPending ? "Cancelling..." : "Cancel Order"}
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}
