"use client";

import { motion } from "framer-motion";
import { CreditCard, MapPin, Phone } from "lucide-react";
import type { Order } from "@/lib/api/order.api";

type PaymentDisplay = { icon: string; label: string; details: string } | null;

interface OrderAddressPaymentSectionProps {
  order: Order;
  paymentDisplay: PaymentDisplay;
}

export function OrderAddressPaymentSection({
  order,
  paymentDisplay,
}: OrderAddressPaymentSectionProps) {
  return (
    {/* Shipping & Payment */}
        <div className="grid lg:grid-cols-2 gap-4">
          {/* Shipping Address */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-6"
          >
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
              <div className="pt-3 border-t">
                <p className="text-gray-600 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  {order.shippingAddress.phone}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Payment Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-6"
          >
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Payment Details
            </h3>
            <div className="space-y-3 text-sm">
              {order.payment && paymentDisplay && (
                <>
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 mb-3">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-3xl">{paymentDisplay.icon}</span>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {paymentDisplay.label}
                        </p>
                        <p className="text-xs text-gray-600 font-mono">
                          {paymentDisplay.details}
                        </p>
                      </div>
                    </div>

                    {order.payment.bankName &&
                      order.payment.method === "CARD" && (
                        <p className="text-xs text-gray-600 mt-2">
                          Bank:{" "}
                          <span className="font-medium">
                            {order.payment.bankName}
                          </span>
                        </p>
                      )}

                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-300">
                      <span className="text-gray-600">Status</span>
                      <span
                        className={`font-bold px-3 py-1 rounded-full text-xs ${
                          order.payment.status === "SUCCESS"
                            ? "bg-green-100 text-green-700"
                            : order.payment.status === "REFUNDED"
                              ? "bg-blue-100 text-blue-700"
                              : order.payment.status === "FAILED"
                                ? "bg-red-100 text-red-700"
                                : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {order.payment.status}
                      </span>
                    </div>

                    {order.payment.refundAmount && (
                      <div className="flex justify-between mt-2 pt-2 border-t border-blue-200 bg-blue-50 -mx-4 px-4 py-2">
                        <span className="text-blue-700 font-medium">
                          Refunded
                        </span>
                        <span className="font-bold text-blue-700">
                          ₹{Number(order.payment.refundAmount).toFixed(2)}
                        </span>
                      </div>
                    )}

                    {order.payment.razorpayPaymentId && (
                      <p className="text-xs text-gray-500 mt-2">
                        ID: {order.payment.razorpayPaymentId}
                      </p>
                    )}
                  </div>
                </>
              )}

              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">
                  ₹{Number(order.subtotal).toFixed(2)}
                </span>
              </div>
              {Number(order.discount) > 0 && (
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
                    -₹{Number(order.discount).toFixed(2)}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span
                  className={`font-medium ${Number(order.shippingCost) === 0 ? "text-green-600" : "text-gray-900"}`}
                >
                  {Number(order.shippingCost) === 0
                    ? "Free"
                    : `₹${Number(order.shippingCost).toFixed(2)}`}
                </span>
              </div>
              <div className="pt-3 border-t flex justify-between">
                <span className="font-semibold">Total</span>
                <span className="font-bold text-xl">
                  ₹{Number(order.total).toFixed(2)}
                </span>
              </div>
            </div>
          </motion.div>
        </div>
  );
}
