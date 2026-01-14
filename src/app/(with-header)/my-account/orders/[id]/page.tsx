"use client";

import {
  ArrowLeft,
  Package,
  MapPin,
  CreditCard,
  Download,
  Phone,
  Mail,
  Loader2,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useOrder, useCancelOrder, useCanCancelOrder } from "@/hooks/useOrders";
import { useState } from "react";
import { generateOrderReceipt } from "@/lib/utils/generateReceipt";

export default function OrderDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  const { data, isLoading, error } = useOrder(params.id);
  const { data: canCancelData } = useCanCancelOrder(params.id);
  const cancelMutation = useCancelOrder();

  const order = data?.data;
  const canCancel = canCancelData?.data?.canCancel;

  const handleDownloadReceipt = () => {
    if (order) {
      generateOrderReceipt(order);
    }
  };

  const handleCancelOrder = async () => {
    if (!order) return;

    try {
      await cancelMutation.mutateAsync({
        orderId: order.id,
        data: { reason: cancelReason },
      });
      setShowCancelModal(false);
      setCancelReason("");
    } catch (error) {
      console.error("Failed to cancel order:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return "from-green-500 to-emerald-600";
      case "shipped":
        return "from-blue-500 to-indigo-600";
      case "processing":
        return "from-orange-500 to-amber-600";
      case "pending":
        return "from-yellow-500 to-orange-500";
      case "cancelled":
        return "from-red-500 to-rose-600";
      default:
        return "from-gray-500 to-gray-600";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-10 h-10 text-red-400" />
          </div>
          <p className="text-red-500 text-lg font-medium">Order not found</p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b p-4 lg:p-6 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <h1 className="text-lg lg:text-xl font-semibold">
                Order Details
              </h1>
              <p className="text-sm text-gray-500">{order.orderNumber}</p>
            </div>
            <button
              onClick={handleDownloadReceipt}
              className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Receipt</span>
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 lg:p-6 max-w-4xl mx-auto space-y-4">
        {/* Status Card */}
        <div
          className={`bg-gradient-to-br ${getStatusColor(
            order.status
          )} text-white rounded-2xl p-6`}
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm opacity-80 mb-1">Order Status</p>
              <h2 className="text-2xl font-bold capitalize">{order.status}</h2>
            </div>
            <div className="bg-white/20 p-3 rounded-full">
              <Package className="w-6 h-6" />
            </div>
          </div>
          <p className="text-sm opacity-90">
            Placed on{" "}
            {new Date(order.createdAt).toLocaleDateString("en-IN", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
          <div className="mt-4 pt-4 border-t border-white/20 flex gap-2">
            {order.shipment?.trackingNumber && (
              <button
                onClick={() =>
                  router.push(`/my-account/order-tracking/${order.id}`)
                }
                className="flex-1 bg-white text-black py-3 rounded-lg font-medium hover:bg-gray-100 transition"
              >
                Track Package
              </button>
            )}
            {canCancel && (
              <button
                onClick={() => setShowCancelModal(true)}
                disabled={cancelMutation.isPending}
                className="flex-1 bg-white/20 text-white py-3 rounded-lg font-medium hover:bg-white/30 transition disabled:opacity-50"
              >
                Cancel Order
              </button>
            )}
          </div>
        </div>

        {/* Payment Status Alert */}
        {order.payment && order.payment.status !== "completed" && (
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-yellow-900">Payment Pending</p>
              <p className="text-sm text-yellow-700">
                Your payment is {order.payment.status}. Please complete the
                payment to process your order.
              </p>
            </div>
          </div>
        )}

        {/* Items */}
        <div className="bg-white rounded-2xl p-6">
          <h3 className="font-semibold mb-4">Order Items</h3>
          <div className="space-y-4">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 p-4 bg-gray-50 rounded-xl"
              >
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.productName}
                    className="w-20 h-20 lg:w-24 lg:h-24 rounded-lg object-cover"
                  />
                )}
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">{item.productName}</h4>
                  {item.variant && (
                    <p className="text-sm text-gray-500 mb-2">
                      {[
                        item.variant.size && `Size: ${item.variant.size}`,
                        item.variant.color && `Color: ${item.variant.color}`,
                        item.variant.fabric && `Fabric: ${item.variant.fabric}`,
                      ]
                        .filter(Boolean)
                        .join(" • ")}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      Qty: {item.quantity}
                    </span>
                    <div className="text-right">
                      <div className="text-xs text-gray-500">
                        ₹{item.price} × {item.quantity}
                      </div>
                      <div className="font-semibold">
                        ₹{item.total.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Shipping & Payment */}
        <div className="grid lg:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Shipping Address
            </h3>
            <div className="space-y-2 text-sm">
              <p className="font-medium">{order.shippingAddress.fullName}</p>
              <p className="text-gray-600">
                {order.shippingAddress.addressLine1}
              </p>
              {order.shippingAddress.addressLine2 && (
                <p className="text-gray-600">
                  {order.shippingAddress.addressLine2}
                </p>
              )}
              <p className="text-gray-600">
                {order.shippingAddress.city}, {order.shippingAddress.state} -{" "}
                {order.shippingAddress.pincode}
              </p>
              <div className="pt-3 border-t space-y-1">
                <p className="text-gray-600 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  {order.shippingAddress.phone}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Payment Summary
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">
                  ₹{order.subtotal.toFixed(2)}
                </span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    Discount
                    {order.coupon && (
                      <span className="text-xs ml-1">
                        ({order.coupon.code})
                      </span>
                    )}
                  </span>
                  <span className="font-medium text-green-600">
                    -₹{order.discount.toFixed(2)}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium text-green-600">
                  {order.shippingCost === 0
                    ? "Free"
                    : `₹${order.shippingCost.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax (GST 18%)</span>
                <span className="font-medium">
                  ₹
                  {(
                    (order.subtotal - order.discount + order.shippingCost) *
                    0.18
                  ).toFixed(2)}
                </span>
              </div>
              <div className="pt-3 border-t flex justify-between">
                <span className="font-semibold">Total</span>
                <span className="font-bold text-xl">
                  ₹{order.total.toFixed(2)}
                </span>
              </div>
              {order.payment && (
                <div className="pt-3 border-t">
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-600">Payment Method</span>
                    <span className="font-medium">{order.payment.method}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Status</span>
                    <span
                      className={`font-medium ${
                        order.payment.status === "completed"
                          ? "text-green-600"
                          : "text-orange-600"
                      }`}
                    >
                      {order.payment.status.toUpperCase()}
                    </span>
                  </div>
                  {order.payment.razorpayPaymentId && (
                    <p className="text-xs text-gray-500 mt-2">
                      Payment ID: {order.payment.razorpayPaymentId}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Shipment Info */}
        {order.shipment && (
          <div className="bg-white rounded-2xl p-6">
            <h3 className="font-semibold mb-4">Shipment Details</h3>
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              {order.shipment.trackingNumber && (
                <div>
                  <label className="text-xs text-gray-500 block mb-1">
                    Tracking Number
                  </label>
                  <p className="font-medium">{order.shipment.trackingNumber}</p>
                </div>
              )}
              {order.shipment.courierName && (
                <div>
                  <label className="text-xs text-gray-500 block mb-1">
                    Courier Service
                  </label>
                  <p className="font-medium">{order.shipment.courierName}</p>
                </div>
              )}
              {order.shipment.shippedAt && (
                <div>
                  <label className="text-xs text-gray-500 block mb-1">
                    Shipped On
                  </label>
                  <p className="font-medium">
                    {new Date(order.shipment.shippedAt).toLocaleDateString()}
                  </p>
                </div>
              )}
              {order.shipment.estimatedDelivery && (
                <div>
                  <label className="text-xs text-gray-500 block mb-1">
                    Estimated Delivery
                  </label>
                  <p className="font-medium">
                    {new Date(
                      order.shipment.estimatedDelivery
                    ).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Cancel Order Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Cancel Order</h3>
                  <p className="text-sm text-gray-500">
                    Are you sure you want to cancel?
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Reason for cancellation (optional)
                </label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none resize-none"
                  placeholder="Please let us know why you're cancelling..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="flex-1 py-3 border-2 border-gray-200 rounded-lg font-medium hover:bg-gray-50"
                >
                  Keep Order
                </button>
                <button
                  onClick={handleCancelOrder}
                  disabled={cancelMutation.isPending}
                  className="flex-1 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50"
                >
                  {cancelMutation.isPending ? "Cancelling..." : "Cancel Order"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
