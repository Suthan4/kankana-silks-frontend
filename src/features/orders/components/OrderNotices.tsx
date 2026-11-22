"use client";

import { motion } from "framer-motion";
import {
  AlertCircle,
  CheckCircle2,
  FileText,
  Package,
  Download,
} from "lucide-react";
import type { Order } from "@/lib/api/order.api";

interface OrderNoticesProps {
  order: Order;
  returnWindowClosed: boolean;
  returnReason?: string;
  invoiceAvailable: boolean;
  isDownloadingInvoice: boolean;
  onDownloadInvoice: () => void;
  canCancel: boolean;
  cancelRestrictionReason?: string;
  paymentLabel?: string;
}

export function OrderNotices({
  order,
  returnWindowClosed,
  returnReason,
  invoiceAvailable,
  isDownloadingInvoice,
  onDownloadInvoice,
  canCancel,
  cancelRestrictionReason,
  paymentLabel,
}: OrderNoticesProps) {
  const returnEligibility = returnReason ? { reason: returnReason } : null;
  const paymentDisplay = paymentLabel ? { label: paymentLabel } : null;

  return (
    {/* ✅ Return Window Closed Alert - Only show if delivered but window closed */}
        {order.status === "DELIVERED" && returnWindowClosed && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-yellow-900">
                Return Window Closed
              </p>
              <p className="text-sm text-yellow-700 mt-1">
                {returnEligibility?.reason ||
                  "The 24-hour return window has expired."}
              </p>
            </div>
          </motion.div>
        )}

        {/* Invoice Available Notice - Only if shipped */}
        {invoiceAvailable && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-4 flex items-start gap-3"
          >
            <FileText className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-green-900">Invoice Available</p>
              <p className="text-sm text-green-700 mt-1">
                Your tax invoice is ready to download.
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDownloadInvoice}
              disabled={isDownloadingInvoice}
              className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download
            </motion.button>
          </motion.div>
        )}

        {/* Refund Status Alert */}
        {order.status === "CANCELLED" &&
          order.payment?.status === "REFUNDED" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 flex items-start gap-3"
            >
              <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-blue-900">Refund Processed</p>
                <p className="text-sm text-blue-700 mt-1">
                  ₹
                  {Number(order.payment.refundAmount || order.total).toFixed(2)}{" "}
                  will be credited to your {paymentDisplay?.label.toLowerCase()}{" "}
                  in 5-7 business days.
                </p>
              </div>
            </motion.div>
          )}

        {/* Cannot Cancel Alert */}
        {!canCancel &&
          cancelRestrictionReason &&
          order.status !== "CANCELLED" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-yellow-900">Cannot Cancel</p>
                <p className="text-sm text-yellow-700">
                  {cancelRestrictionReason}
                </p>
              </div>
            </motion.div>
          )}

        {/* Payment Status Alert */}
        {order.payment &&
          order.payment.status !== "SUCCESS" &&
          order.payment.status !== "REFUNDED" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-yellow-900">Payment Pending</p>
                <p className="text-sm text-yellow-700">
                  Payment status: {order.payment.status.toLowerCase()}
                </p>
              </div>
            </motion.div>
          )}

        {/* Shipping Info */}
        {order.shippingInfo && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4"
          >
            <div className="flex items-start gap-3">
              <Package className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-blue-900 mb-2">
                  Shipping Info
                </p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-blue-700">Warehouse:</span>
                    <span className="ml-2 text-blue-900 font-medium">
                      {order.shippingInfo.warehouseName}
                    </span>
                  </div>
                  <div>
                    <span className="text-blue-700">Weight:</span>
                    <span className="ml-2 text-blue-900 font-medium">
                      {order.shippingInfo.chargeableWeight}kg
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
  );
}
