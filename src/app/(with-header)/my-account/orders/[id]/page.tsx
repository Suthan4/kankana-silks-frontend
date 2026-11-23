"use client";

import { useState } from "react";
import {
  ArrowLeft,
  Package,
  Loader2,
  XCircle,
  Info,
  Download,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useOrder, useCancelOrder, useCanCancelOrder } from "@/hooks/useOrders";
import { useOrderActions } from "@/hooks/useOrderActions";
import { orderApi } from "@/lib/api/order.api";
import { motion } from "framer-motion";
import { OrderDetailsPageSkeleton } from "@/features/orders/components/OrderPageSkeletons";
import { OrderItemsSection } from "@/features/orders/components/OrderItemsSection";
import { OrderStatusSection } from "@/features/orders/components/OrderStatusSection";
import { OrderNotices } from "@/features/orders/components/OrderNotices";
import { OrderAddressPaymentSection } from "@/features/orders/components/OrderAddressPaymentSection";
import { toast } from "sonner";

export default function OrderDetailsPage() {
  const router = useRouter();
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [isDownloadingInvoice, setIsDownloadingInvoice] = useState(false);

  const params = useParams<{ id: string }>();
  const id = params?.id;

  const { data, isLoading, error, refetch } = useOrder(id);
  const { data: canCancelData } = useCanCancelOrder(id);
  const cancelMutation = useCancelOrder();

  const order = data?.data;
  const canCancel = canCancelData?.canCancel;
  const cancelRestrictionReason = canCancelData?.reason;

  // ✅ Get order actions (tracking, return, etc.)
  const { canReturn, returnWindowClosed, returnEligibility, hoursRemaining } =
    useOrderActions(order);

  // ✅ Helper functions for button visibility
  const isInvoiceAvailable =
    order &&
    ["SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED", "COMPLETED"].includes(
      order.status,
    );

  const isTrackingAvailable =
    order && (order.shipment?.awbCode || order.shipment?.trackingNumber);

  // ✅ Return button should only show if order is DELIVERED
  const showReturnButton =
    order && order.status === "DELIVERED" && canReturn && !returnWindowClosed;

  const handleCancelOrder = async () => {
    if (!order || !canCancel) {
      toast.error(cancelRestrictionReason || "Cannot cancel this order");
      return;
    }

    try {
      await cancelMutation.mutateAsync({
        orderId: order.id,
        reason: cancelReason || "Customer requested cancellation",
      });
      setShowCancelModal(false);
      setCancelReason("");
      toast.success(
        "Order cancelled successfully. Refund will be processed in 5-7 business days.",
      );
    } catch (error: any) {
      console.error("Failed to cancel order:", error);
      toast.error(error.message || "Failed to cancel order");
    }
  };

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

      toast.success("Invoice downloaded successfully");
    } catch (error: any) {
      console.error("Failed to download invoice:", error);
      toast.error(error.message || "Failed to download invoice");
    } finally {
      setIsDownloadingInvoice(false);
    }
  };

  const getPaymentMethodDisplay = (method: string, payment: any) => {
    switch (method) {
      case "CARD":
        return {
          icon: "💳",
          label: "Card Payment",
          details:
            payment.cardNetwork && payment.cardLast4
              ? `${payment.cardNetwork} •••• ${payment.cardLast4}${payment.cardType ? ` (${payment.cardType})` : ""}`
              : "Card",
        };
      case "UPI":
        return {
          icon: "📱",
          label: "UPI Payment",
          details: payment.upiId || "UPI",
        };
      case "NETBANKING":
        return {
          icon: "🏦",
          label: "Net Banking",
          details: payment.bankName || "Net Banking",
        };
      case "WALLET":
        return {
          icon: "👛",
          label: "Wallet",
          details: payment.walletName
            ? payment.walletName.charAt(0).toUpperCase() +
              payment.walletName.slice(1)
            : "Wallet",
        };
      case "EMI":
        return { icon: "💰", label: "EMI", details: "EMI" };
      case "PAYLATER":
        return { icon: "🔄", label: "Pay Later", details: "Pay Later" };
      case "COD":
        return {
          icon: "💵",
          label: "Cash on Delivery",
          details: "Pay on delivery",
        };
      default:
        return { icon: "💳", label: method, details: method };
    }
  };

  if (isLoading) return <OrderDetailsPageSkeleton />;

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-10 h-10 text-red-400" />
          </div>
          <p className="text-red-500 text-lg font-medium">
            {error ? "Unable to load this order" : "Order not found"}
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {error && (
              <button
                type="button"
                onClick={() => void refetch()}
                className="rounded-lg bg-black px-5 py-2 text-sm font-semibold text-white"
              >
                Try again
              </button>
            )}
            <button
              type="button"
              onClick={() => router.back()}
              className="rounded-lg border border-gray-200 px-5 py-2 text-sm font-semibold hover:bg-gray-50"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const paymentDisplay = order.payment
    ? getPaymentMethodDisplay(order.payment.method, order.payment)
    : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b p-4 lg:p-6 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ x: -4 }}
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </motion.button>
            <div className="flex-1">
              <h1 className="text-lg lg:text-xl font-semibold">
                Order Details
              </h1>
              <p className="text-sm text-gray-500">{order.orderNumber}</p>
            </div>
            {/* ✅ Invoice Download Button - Only show if shipped */}
            {isInvoiceAvailable && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleDownloadInvoice}
                disabled={isDownloadingInvoice}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-medium hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50 shadow-lg"
              >
                {isDownloadingInvoice ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="hidden md:inline">Downloading...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span className="hidden md:inline">Invoice</span>
                  </>
                )}
              </motion.button>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 lg:p-6 max-w-4xl mx-auto space-y-4">
        <OrderStatusSection
          order={order}
          canTrack={Boolean(isTrackingAvailable)}
          canReturn={Boolean(showReturnButton)}
          hoursRemaining={hoursRemaining}
          canCancel={Boolean(canCancel)}
          cancelPending={cancelMutation.isPending}
          onTrackOrder={() =>
            router.push(`/my-account/order-tracking/${order.id}`)
          }
          onReturnOrder={() =>
            router.push(`/my-account/returns/create?orderId=${order.id}`)
          }
          onCancelOrder={() => setShowCancelModal(true)}
        />

        <OrderNotices
          order={order}
          returnWindowClosed={Boolean(returnWindowClosed)}
          returnReason={returnEligibility?.reason}
          invoiceAvailable={Boolean(isInvoiceAvailable)}
          isDownloadingInvoice={isDownloadingInvoice}
          onDownloadInvoice={handleDownloadInvoice}
          canCancel={Boolean(canCancel)}
          cancelRestrictionReason={cancelRestrictionReason}
          paymentLabel={paymentDisplay?.label}
        />

        <OrderItemsSection items={order.items} />

        <OrderAddressPaymentSection
          order={order}
          paymentDisplay={paymentDisplay}
        />

        {/* Shipment Details */}
        {order.shipment && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-6"
          >
            <h3 className="font-semibold mb-4">Shipment Details</h3>
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              {order.shipment.awbCode && (
                <div>
                  <label className="text-xs text-gray-500 block mb-1">
                    AWB Code
                  </label>
                  <p className="font-medium">{order.shipment.awbCode}</p>
                </div>
              )}
              {order.shipment.courierName && (
                <div>
                  <label className="text-xs text-gray-500 block mb-1">
                    Courier
                  </label>
                  <p className="font-medium">{order.shipment.courierName}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cancel-order-title"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl w-full max-w-md"
          >
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3
                    id="cancel-order-title"
                    className="font-futura-bold text-lg"
                  >
                    Cancel Order
                  </h3>
                  <p className="text-sm text-gray-500">Are you sure?</p>
                </div>
              </div>

              {!canCancel && cancelRestrictionReason && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">
                    {cancelRestrictionReason}
                  </p>
                </div>
              )}

              {canCancel && (
                <>
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex gap-2">
                    <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-blue-700">
                      Refund will be processed in 5-7 days to your{" "}
                      {paymentDisplay?.label.toLowerCase()}.
                    </p>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">
                      Reason (optional)
                    </label>
                    <textarea
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none resize-none"
                      placeholder="Why are you cancelling?"
                    />
                  </div>
                </>
              )}

              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setShowCancelModal(false);
                    setCancelReason("");
                  }}
                  className="flex-1 py-3 border-2 border-gray-200 rounded-lg font-medium hover:bg-gray-50"
                >
                  {canCancel ? "Keep Order" : "Close"}
                </motion.button>
                {canCancel && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCancelOrder}
                    disabled={cancelMutation.isPending}
                    className="flex-1 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {cancelMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Cancelling...
                      </>
                    ) : (
                      "Cancel Order"
                    )}
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
