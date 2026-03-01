"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  Download,
  Package,
  ArrowRight,
  Loader2,
  Sparkles,
  FileText,
  ShoppingBag,
  Home,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useOrder } from "@/hooks/useOrders";
import { orderApi } from "@/lib/api/order.api";
import { toast } from "sonner";
import confetti from "canvas-confetti";


export default function OrderSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const orderNumber = searchParams.get("orderNumber");

  const { data, isLoading } = useOrder(orderId || "");
  const order = data?.data;

  const [isDownloadingInvoice, setIsDownloadingInvoice] = useState(false);
  const [invoiceDownloaded, setInvoiceDownloaded] = useState(false);
  const confettiFired = useRef(false);

  // 🎉 Fire confetti on mount
  useEffect(() => {
    if (confettiFired.current) return;
    confettiFired.current = true;

    // 🎉 BIG CENTER BLAST
    confetti({
      particleCount: 180,
      spread: 90,
      startVelocity: 45,
      origin: { x: 0.5, y: 0.45 },
      colors: ["#22c55e", "#16a34a", "#4ade80", "#bbf7d0", "#fbbf24"],
      scalar: 1.2,
    });

    // 🎉 LEFT CANNON
    setTimeout(() => {
      confetti({
        particleCount: 80,
        angle: 60,
        spread: 70,
        origin: { x: 0, y: 0.6 },
        colors: ["#22c55e", "#fbbf24", "#ffffff"],
      });
    }, 150);

    // 🎉 RIGHT CANNON
    setTimeout(() => {
      confetti({
        particleCount: 80,
        angle: 120,
        spread: 70,
        origin: { x: 1, y: 0.6 },
        colors: ["#22c55e", "#fbbf24", "#ffffff"],
      });
    }, 300);

    // 🎉 CONFETTI RAIN (premium effect)
    const duration = 1200;
    const end = Date.now() + duration;

    const interval = setInterval(() => {
      if (Date.now() > end) {
        clearInterval(interval);
        return;
      }

      confetti({
        particleCount: 20,
        spread: 55,
        origin: {
          x: Math.random(),
          y: Math.random() * 0.4,
        },
      });
    }, 200);
  }, []);

  const handleDownloadInvoice = async () => {
    if (!order) return;

    try {
      setIsDownloadingInvoice(true);
      const response = await orderApi.downloadInvoice(order.id);

      const blob = new Blob([response], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `invoice-${order.orderNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setInvoiceDownloaded(true);
      toast.success("Invoice downloaded successfully!");
    } catch (error: any) {
      console.error("Failed to download invoice:", error);
      toast.error(error.message || "Failed to download invoice");
    } finally {
      setIsDownloadingInvoice(false);
    }
  };

  const displayOrderNumber = order?.orderNumber || orderNumber || "—";

  return (
    <div className="min-h-screen bg-gradient-to-br flex items-center justify-center p-4">
      {/* Ambient background blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-green-200/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-emerald-200/30 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-100/20 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-lg">
        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-black-100 border border-white overflow-hidden"
        >
          {/* Green header strip */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-2" />

          <div className="p-8">
            {/* Success Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                delay: 0.2,
                type: "spring",
                stiffness: 260,
                damping: 20,
              }}
              className="flex justify-center mb-6"
            >
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-green-200">
                  <CheckCircle2
                    className="w-12 h-12 text-white"
                    strokeWidth={2.5}
                  />
                </div>
                {/* Sparkles around icon */}
                {[0, 60, 120, 180, 240, 300].map((deg, i) => (
                  <motion.div
                    key={deg}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: [0, 1, 0], scale: [0, 1, 0] }}
                    transition={{
                      delay: 0.4 + i * 0.08,
                      duration: 0.8,
                      ease: "easeOut",
                    }}
                    className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                    style={{
                      top: "50%",
                      left: "50%",
                      transform: `rotate(${deg}deg) translateY(-52px) translate(-50%, -50%)`,
                    }}
                  />
                ))}
              </div>
            </motion.div>

            {/* Heading */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="text-center mb-6"
            >
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Order Placed! 🎉
              </h1>
              <p className="text-gray-500 text-sm">
                Thank you for shopping with Kankana Silks
              </p>
            </motion.div>

            {/* Order Number Badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="bg-gray-50 rounded-2xl p-4 mb-6 border border-gray-100"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                    <Package className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                      Order Number
                    </p>
                    <p className="font-bold text-gray-900 text-lg">
                      #{displayOrderNumber}
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1.5 bg-orange-100 text-orange-700 text-xs font-bold rounded-xl">
                  Processing
                </span>
              </div>

              {/* Order summary if loaded */}
              {order && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ delay: 0.6 }}
                  className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between"
                >
                  <p className="text-sm text-gray-600">
                    {order.items?.length || 0} item(s)
                  </p>
                  <p className="font-bold text-gray-900 text-lg">
                    ₹{Number(order.total).toFixed(2)}
                  </p>
                </motion.div>
              )}
            </motion.div>

            {/* ✅ INVOICE DOWNLOAD — Primary CTA */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
              className="mb-4"
            >
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-4 mb-3">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-green-700" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-green-900 text-sm">
                      Your Invoice is Ready
                    </p>
                    <p className="text-green-700 text-xs mt-0.5">
                      Download your tax invoice for order #{displayOrderNumber}
                    </p>
                  </div>
                  {invoiceDownloaded && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0"
                    >
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    </motion.div>
                  )}
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleDownloadInvoice}
                  disabled={isDownloadingInvoice || !order}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2.5 shadow-lg shadow-green-200 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isDownloadingInvoice ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Preparing Invoice...
                    </>
                  ) : isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Loading...
                    </>
                  ) : invoiceDownloaded ? (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      Invoice Downloaded ✓
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5" />
                      Download Invoice (PDF)
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>

            {/* Secondary actions */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65 }}
              className="grid grid-cols-2 gap-3"
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() =>
                  router.push(`/my-account/orders/${orderId || order?.id}`)
                }
                className="flex items-center justify-center gap-2 py-3 border-2 border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-all text-sm"
              >
                <Package className="w-4 h-4" />
                View Order
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => router.push("/")}
                className="flex items-center justify-center gap-2 py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-all text-sm"
              >
                <ShoppingBag className="w-4 h-4" />
                Continue Shopping
              </motion.button>
            </motion.div>

            {/* Info note */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.75 }}
              className="text-center text-xs text-gray-400 mt-5"
            >
              A confirmation email has been sent to your registered email
              address.
            </motion.p>
          </div>
        </motion.div>

        {/* "What's next" steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-white p-5"
        >
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            What happens next?
          </p>
          <div className="space-y-3">
            {[
              { icon: "✅", label: "Order confirmed", done: true },
              { icon: "📦", label: "We're packing your order", done: false },
              { icon: "🚚", label: "Shipped & on the way", done: false },
              { icon: "🏠", label: "Delivered to your door", done: false },
            ].map((step, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-lg">{step.icon}</span>
                <p
                  className={`text-sm ${step.done ? "font-semibold text-green-700" : "text-gray-500"}`}
                >
                  {step.label}
                </p>
                {step.done && (
                  <CheckCircle2 className="w-4 h-4 text-green-500 ml-auto" />
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
