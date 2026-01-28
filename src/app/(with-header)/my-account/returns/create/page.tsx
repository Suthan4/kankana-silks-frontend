"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Package,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Info,
} from "lucide-react";
import { useOrder } from "@/hooks/useOrders";
import { useReturnEligibility } from "@/hooks/useReturnEligibility";

import Image from "next/image";
import { toast } from "sonner";
import { useCreateReturn } from "@/hooks/useUserReturns";
import { getReturnReasonLabel, isFreeReturnReason, RefundMethod, ReturnReason } from "@/lib/api/return.api";

export default function CreateReturnPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  const { data: orderData, isLoading: orderLoading } = useOrder(orderId || "");
  const { eligibility, loading: eligibilityLoading } = useReturnEligibility(
    orderId || "",
  );
  const { createReturn, loading: submitting } = useCreateReturn();

  const order = orderData?.data;

  // Form state
  const [selectedItems, setSelectedItems] = useState<
    Array<{ orderItemId: string; quantity: number }>
  >([]);
  const [reason, setReason] = useState<ReturnReason>(ReturnReason.DEFECTIVE);
  const [reasonDetails, setReasonDetails] = useState("");
  const [refundMethod, setRefundMethod] = useState<RefundMethod>(
    RefundMethod.ORIGINAL_PAYMENT,
  );
  const [bankDetails, setBankDetails] = useState({
    accountHolderName: "",
    accountNumber: "",
    ifscCode: "",
    bankName: "",
  });

  // Redirect if no orderId
  useEffect(() => {
    if (!orderId) {
      toast.error("Order ID is required");
      router.push("/my-account/orders");
    }
  }, [orderId, router]);

  // Check eligibility
  useEffect(() => {
    if (eligibility && !eligibility.eligible) {
      toast.error(eligibility.reason || "Order not eligible for return");
      router.push(`/my-account/orders/${orderId}`);
    }
  }, [eligibility, orderId, router]);

  const handleToggleItem = (orderItemId: string) => {
    const exists = selectedItems.find(
      (item) => item.orderItemId === orderItemId,
    );
    if (exists) {
      setSelectedItems(
        selectedItems.filter((item) => item.orderItemId !== orderItemId),
      );
    } else {
      setSelectedItems([...selectedItems, { orderItemId, quantity: 1 }]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (selectedItems.length === 0) {
      toast.error("Please select at least one item to return");
      return;
    }

    if (!reasonDetails || reasonDetails.length < 10) {
      toast.error("Please provide detailed reason (minimum 10 characters)");
      return;
    }

    if (
      refundMethod === RefundMethod.BANK_TRANSFER &&
      (!bankDetails.accountHolderName ||
        !bankDetails.accountNumber ||
        !bankDetails.ifscCode)
    ) {
      toast.error(
        "Please provide complete bank details for bank transfer refund",
      );
      return;
    }

    try {
      await createReturn({
        orderId: order!.id,
        orderItems: selectedItems.map((item) => ({
          orderItemId: item.orderItemId,
          quantity: item.quantity,
          reason,
        })),
        reasonDetails,
        refundMethod,
        bankDetails:
          refundMethod === RefundMethod.BANK_TRANSFER ? bankDetails : undefined,
      });

      toast.success("Return request submitted successfully!");
      router.push("/my-account/returns");
    } catch (error: any) {
      toast.error(error.message || "Failed to submit return request");
    }
  };

  if (orderLoading || eligibilityLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-10 h-10 text-red-400" />
          </div>
          <p className="text-red-500 text-lg font-medium">Order not found</p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push("/my-account/orders")}
            className="mt-4 px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
          >
            View Orders
          </motion.button>
        </div>
      </div>
    );
  }

  const isFreeReturn = isFreeReturnReason(reason);

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
              <h1 className="text-lg lg:text-xl font-semibold">Return Order</h1>
              <p className="text-sm text-gray-500">{order.orderNumber}</p>
            </div>
          </div>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="p-4 lg:p-6 max-w-4xl mx-auto space-y-4"
      >
        {/* Eligibility Alert */}
        {eligibility && eligibility.eligible && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-50 border-2 border-green-200 rounded-xl p-4 flex items-start gap-3"
          >
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-green-900">
                Return Window Active
              </p>
              <p className="text-sm text-green-700 mt-1">
                You have {Math.floor(eligibility.hoursRemaining!)} hours
                remaining to complete this return
              </p>
            </div>
          </motion.div>
        )}

        {/* Free vs Paid Return Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${
            isFreeReturn
              ? "bg-blue-50 border-blue-200"
              : "bg-orange-50 border-orange-200"
          } border-2 rounded-xl p-4 flex items-start gap-3`}
        >
          <Info
            className={`w-5 h-5 ${isFreeReturn ? "text-blue-600" : "text-orange-600"} flex-shrink-0 mt-0.5`}
          />
          <div>
            <p
              className={`font-semibold ${isFreeReturn ? "text-blue-900" : "text-orange-900"}`}
            >
              {isFreeReturn ? "🎉 Free Return" : "💰 Paid Return"}
            </p>
            <p
              className={`text-sm ${isFreeReturn ? "text-blue-700" : "text-orange-700"} mt-1`}
            >
              {isFreeReturn
                ? "No shipping charges will be deducted from your refund for this reason"
                : "Reverse shipping charges will be deducted from your refund amount"}
            </p>
          </div>
        </motion.div>

        {/* Select Items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6"
        >
          <h3 className="font-semibold mb-4">Select Items to Return *</h3>
          <div className="space-y-3">
            {order.items.map((item: any) => {
              const isSelected = selectedItems.some(
                (si) => si.orderItemId === item.id,
              );

              return (
                <motion.div
                  key={item.id}
                  whileHover={{ scale: 1.01 }}
                  onClick={() => handleToggleItem(item.id)}
                  className={`flex gap-4 p-4 rounded-xl border-2 cursor-pointer transition ${
                    isSelected
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {}}
                    className="w-5 h-5 mt-1 cursor-pointer"
                  />
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden ring-2 ring-gray-200 flex-shrink-0">
                    <Image
                      src={
                        item.product.media[0]?.thumbnailUrl ||
                        item.product.media[0]?.url ||
                        "/images/placeholder.png"
                      }
                      alt={item.product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{item.product.name}</p>
                    {item.variant?.attributes && (
                      <div className="flex flex-wrap gap-2 mt-1">
                        {Object.entries(item.variant.attributes).map(
                          ([k, v]) => (
                            <span
                              key={k}
                              className="text-xs bg-white px-2 py-1 rounded-full border"
                            >
                              {k}:{" "}
                              <span className="font-semibold">{String(v)}</span>
                            </span>
                          ),
                        )}
                      </div>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm text-gray-600">
                        Qty: {item.quantity}
                      </span>
                      <span className="font-semibold">
                        ₹{Number(item.price).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Return Reason */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6"
        >
          <h3 className="font-semibold mb-4">Reason for Return *</h3>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value as ReturnReason)}
            className="w-full border-2 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value={ReturnReason.DEFECTIVE}>
              {getReturnReasonLabel(ReturnReason.DEFECTIVE)} (Free Return)
            </option>
            <option value={ReturnReason.WRONG_ITEM}>
              {getReturnReasonLabel(ReturnReason.WRONG_ITEM)} (Free Return)
            </option>
            <option value={ReturnReason.NOT_AS_DESCRIBED}>
              {getReturnReasonLabel(ReturnReason.NOT_AS_DESCRIBED)} (Free
              Return)
            </option>
            <option value={ReturnReason.DAMAGED_IN_TRANSIT}>
              {getReturnReasonLabel(ReturnReason.DAMAGED_IN_TRANSIT)} (Free
              Return)
            </option>
            <option value={ReturnReason.SIZE_ISSUE}>
              {getReturnReasonLabel(ReturnReason.SIZE_ISSUE)} (Paid Return)
            </option>
            <option value={ReturnReason.COLOR_DIFFERENCE}>
              {getReturnReasonLabel(ReturnReason.COLOR_DIFFERENCE)} (Paid
              Return)
            </option>
            <option value={ReturnReason.QUALITY_ISSUE}>
              {getReturnReasonLabel(ReturnReason.QUALITY_ISSUE)} (Paid Return)
            </option>
            <option value={ReturnReason.CHANGED_MIND}>
              {getReturnReasonLabel(ReturnReason.CHANGED_MIND)} (Paid Return)
            </option>
            <option value={ReturnReason.OTHER}>
              {getReturnReasonLabel(ReturnReason.OTHER)} (Paid Return)
            </option>
          </select>
        </motion.div>

        {/* Reason Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6"
        >
          <h3 className="font-semibold mb-4">
            Detailed Reason * (min 10 characters)
          </h3>
          <textarea
            value={reasonDetails}
            onChange={(e) => setReasonDetails(e.target.value)}
            rows={4}
            placeholder="Please provide details about why you're returning this item..."
            className="w-full border-2 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
          />
          <p className="text-sm text-gray-500 mt-2">
            {reasonDetails.length}/10 characters minimum
          </p>
        </motion.div>

        {/* Refund Method */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6"
        >
          <h3 className="font-semibold mb-4">Refund Method *</h3>
          <div className="space-y-3">
            <label className="flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition">
              <input
                type="radio"
                name="refundMethod"
                value={RefundMethod.ORIGINAL_PAYMENT}
                checked={refundMethod === RefundMethod.ORIGINAL_PAYMENT}
                onChange={(e) =>
                  setRefundMethod(e.target.value as RefundMethod)
                }
                className="w-5 h-5"
              />
              <div className="flex-1">
                <p className="font-medium">Original Payment Method</p>
                <p className="text-sm text-gray-600">
                  Refund will be credited to your original payment method in 5-7
                  days
                </p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition">
              <input
                type="radio"
                name="refundMethod"
                value={RefundMethod.BANK_TRANSFER}
                checked={refundMethod === RefundMethod.BANK_TRANSFER}
                onChange={(e) =>
                  setRefundMethod(e.target.value as RefundMethod)
                }
                className="w-5 h-5"
              />
              <div className="flex-1">
                <p className="font-medium">Bank Transfer</p>
                <p className="text-sm text-gray-600">
                  Refund will be transferred to your bank account
                </p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition">
              <input
                type="radio"
                name="refundMethod"
                value={RefundMethod.STORE_CREDIT}
                checked={refundMethod === RefundMethod.STORE_CREDIT}
                onChange={(e) =>
                  setRefundMethod(e.target.value as RefundMethod)
                }
                className="w-5 h-5"
              />
              <div className="flex-1">
                <p className="font-medium">Store Credit</p>
                <p className="text-sm text-gray-600">
                  Refund will be added as store credit for future purchases
                </p>
              </div>
            </label>
          </div>
        </motion.div>

        {/* Bank Details (if bank transfer) */}
        {refundMethod === RefundMethod.BANK_TRANSFER && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-6"
          >
            <h3 className="font-semibold mb-4">Bank Account Details *</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Account Holder Name *
                </label>
                <input
                  type="text"
                  value={bankDetails.accountHolderName}
                  onChange={(e) =>
                    setBankDetails({
                      ...bankDetails,
                      accountHolderName: e.target.value,
                    })
                  }
                  placeholder="Enter account holder name"
                  className="w-full border-2 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Account Number *
                </label>
                <input
                  type="text"
                  value={bankDetails.accountNumber}
                  onChange={(e) =>
                    setBankDetails({
                      ...bankDetails,
                      accountNumber: e.target.value.replace(/\D/g, ""),
                    })
                  }
                  placeholder="Enter account number"
                  className="w-full border-2 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  IFSC Code *
                </label>
                <input
                  type="text"
                  value={bankDetails.ifscCode}
                  onChange={(e) =>
                    setBankDetails({
                      ...bankDetails,
                      ifscCode: e.target.value.toUpperCase(),
                    })
                  }
                  placeholder="Enter IFSC code"
                  className="w-full border-2 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Bank Name (Optional)
                </label>
                <input
                  type="text"
                  value={bankDetails.bankName}
                  onChange={(e) =>
                    setBankDetails({
                      ...bankDetails,
                      bankName: e.target.value,
                    })
                  }
                  placeholder="Enter bank name"
                  className="w-full border-2 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* Submit Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-3"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={() => router.back()}
            disabled={submitting}
            className="flex-1 py-4 border-2 border-gray-200 rounded-lg font-semibold hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={submitting || selectedItems.length === 0}
            className="flex-1 py-4 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Return Request"
            )}
          </motion.button>
        </motion.div>
      </form>
    </div>
  );
}
