"use client";

import { motion } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Package,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  Truck,
  Home,
  Search,
  FileCheck,
  DollarSign,
  MapPin,
  Phone,
  CreditCard,
} from "lucide-react";
import Image from "next/image";
import { useReturn } from "@/hooks/useUserReturns";
import { getReturnReasonLabel, getReturnStatusLabel, ReturnStatus } from "@/lib/api/return.api";

export default function ReturnDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data, isLoading, error } = useReturn(params.id);

  const returnData = data?.data;

  const getStatusIcon = (status: ReturnStatus) => {
    switch (status) {
      case ReturnStatus.PENDING:
        return <Clock className="w-5 h-5" />;
      case ReturnStatus.APPROVED:
        return <CheckCircle2 className="w-5 h-5" />;
      case ReturnStatus.REJECTED:
        return <XCircle className="w-5 h-5" />;
      case ReturnStatus.PICKUP_SCHEDULED:
        return <Home className="w-5 h-5" />;
      case ReturnStatus.PICKED_UP:
      case ReturnStatus.IN_TRANSIT:
        return <Truck className="w-5 h-5" />;
      case ReturnStatus.RECEIVED:
        return <Package className="w-5 h-5" />;
      case ReturnStatus.INSPECTED:
        return <Search className="w-5 h-5" />;
      case ReturnStatus.REFUND_INITIATED:
      case ReturnStatus.REFUND_COMPLETED:
        return <DollarSign className="w-5 h-5" />;
      default:
        return <Clock className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: ReturnStatus) => {
    switch (status) {
      case ReturnStatus.PENDING:
        return "from-yellow-500 to-orange-500";
      case ReturnStatus.APPROVED:
        return "from-green-500 to-emerald-500";
      case ReturnStatus.REJECTED:
        return "from-red-500 to-rose-500";
      case ReturnStatus.PICKUP_SCHEDULED:
      case ReturnStatus.PICKED_UP:
      case ReturnStatus.IN_TRANSIT:
        return "from-blue-500 to-cyan-500";
      case ReturnStatus.RECEIVED:
      case ReturnStatus.INSPECTED:
        return "from-purple-500 to-pink-500";
      case ReturnStatus.REFUND_INITIATED:
      case ReturnStatus.REFUND_COMPLETED:
        return "from-emerald-500 to-teal-500";
      default:
        return "from-gray-500 to-slate-500";
    }
  };

  // Timeline data
  const getTimeline = () => {
    if (!returnData) return [];

    const timeline = [
      {
        status: ReturnStatus.PENDING,
        label: "Return Requested",
        date: returnData.createdAt,
        completed: true,
      },
    ];

    if (returnData.status === ReturnStatus.REJECTED) {
      timeline.push({
        status: ReturnStatus.REJECTED,
        label: "Return Rejected",
        date: returnData.updatedAt,
        completed: true,
      });
    } else {
      const statuses = [
        { status: ReturnStatus.APPROVED, label: "Return Approved" },
        { status: ReturnStatus.PICKUP_SCHEDULED, label: "Pickup Scheduled" },
        { status: ReturnStatus.PICKED_UP, label: "Item Picked Up" },
        { status: ReturnStatus.IN_TRANSIT, label: "In Transit" },
        { status: ReturnStatus.RECEIVED, label: "Received at Warehouse" },
        { status: ReturnStatus.INSPECTED, label: "Item Inspected" },
        { status: ReturnStatus.REFUND_INITIATED, label: "Refund Initiated" },
        { status: ReturnStatus.REFUND_COMPLETED, label: "Refund Completed" },
      ];

      const currentStatusIndex = statuses.findIndex(
        (s) => s.status === returnData.status,
      );

      statuses.forEach((s, index) => {
        timeline.push({
          ...s,
          date: index <= currentStatusIndex ? returnData.updatedAt : null,
          completed: index <= currentStatusIndex,
        });
      });
    }

    return timeline;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error || !returnData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-10 h-10 text-red-400" />
          </div>
          <p className="text-red-500 text-lg font-medium">Return not found</p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.back()}
            className="mt-4 px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
          >
            Go Back
          </motion.button>
        </div>
      </div>
    );
  }

  const timeline = getTimeline();

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
                Return Details
              </h1>
              <p className="text-sm text-gray-500">{returnData.returnNumber}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 lg:p-6 max-w-4xl mx-auto space-y-4">
        {/* Status Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`bg-gradient-to-br ${getStatusColor(returnData.status)} text-white rounded-2xl p-6`}
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm opacity-80 mb-1">Return Status</p>
              <h2 className="text-2xl font-bold">
                {getReturnStatusLabel(returnData.status)}
              </h2>
            </div>
            <div className="bg-white/20 p-3 rounded-full">
              {getStatusIcon(returnData.status)}
            </div>
          </div>

          {/* Refund Amount */}
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <p className="text-sm opacity-80 mb-1">Expected Refund</p>
            <p className="text-3xl font-bold">
              ₹{Number(returnData.refundAmount).toFixed(2)}
            </p>
            <p className="text-xs opacity-70 mt-1">
              Method: {returnData.refundMethod.replace("_", " ")}
            </p>
          </div>
        </motion.div>

        {/* Rejection Reason (if rejected) */}
        {returnData.status === ReturnStatus.REJECTED &&
          returnData.rejectionReason && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border-2 border-red-200 rounded-xl p-4"
            >
              <div className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-900">Return Rejected</p>
                  <p className="text-sm text-red-700 mt-1">
                    {returnData.rejectionReason}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

        {/* Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6"
        >
          <h3 className="font-semibold mb-6">Return Timeline</h3>
          <div className="space-y-4">
            {timeline.map((item, index) => (
              <div key={index} className="flex gap-4">
                {/* Icon */}
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      item.completed
                        ? "bg-green-100 text-green-600"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {item.completed ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <Clock className="w-5 h-5" />
                    )}
                  </div>
                  {index < timeline.length - 1 && (
                    <div
                      className={`w-0.5 h-full min-h-[40px] ${
                        item.completed ? "bg-green-200" : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 pb-8">
                  <p
                    className={`font-medium ${
                      item.completed ? "text-gray-900" : "text-gray-400"
                    }`}
                  >
                    {item.label}
                  </p>
                  {item.date && (
                    <p className="text-sm text-gray-500 mt-1">
                      {new Date(item.date).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Return Reason */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6"
        >
          <h3 className="font-semibold mb-4">Return Reason</h3>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-600">Category</label>
              <p className="font-medium mt-1">
                {getReturnReasonLabel(returnData.reason)}
              </p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Details</label>
              <p className="text-gray-900 mt-1 whitespace-pre-wrap">
                {returnData.reasonDetails}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Returned Items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6"
        >
          <h3 className="font-semibold mb-4">Returned Items</h3>
          <div className="space-y-4">
            {returnData.returnItems.map((item: any) => (
              <div
                key={item.id}
                className="flex gap-4 p-4 bg-gray-50 rounded-xl"
              >
                <div className="relative w-20 h-20 lg:w-24 lg:h-24 rounded-lg overflow-hidden ring-2 ring-gray-200 flex-shrink-0">
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
                  <h4 className="font-semibold mb-1">{item.product.name}</h4>
                  {item.variant?.attributes && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {Object.entries(item.variant.attributes).map(([k, v]) => (
                        <span
                          key={k}
                          className="text-xs bg-white px-2 py-1 rounded-full border"
                        >
                          {k}:{" "}
                          <span className="font-semibold">{String(v)}</span>
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      Qty: {item.quantity}
                    </span>
                    <div className="text-right">
                      <div className="text-xs text-gray-500">
                        ₹{Number(item.price).toFixed(2)} × {item.quantity}
                      </div>
                      <div className="font-semibold">
                        ₹{(Number(item.price) * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Order Details Link */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() =>
              router.push(`/my-account/orders/${returnData.order.id}`)
            }
            className="w-full bg-white border-2 border-gray-200 rounded-xl p-4 hover:border-gray-300 transition"
          >
            <div className="flex items-center justify-between">
              <div className="text-left">
                <p className="text-sm text-gray-600">Original Order</p>
                <p className="font-semibold mt-1">
                  {returnData.order.orderNumber}
                </p>
              </div>
              <ArrowLeft className="w-5 h-5 text-gray-400 rotate-180" />
            </div>
          </motion.button>
        </motion.div>

        {/* Refund Details (if applicable) */}
        {returnData.refundMethod === "BANK_TRANSFER" &&
          returnData.bankDetails && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-6"
            >
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Bank Details
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Account Holder</span>
                  <span className="font-medium">
                    {returnData.bankDetails.accountHolderName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Account Number</span>
                  <span className="font-medium font-mono">
                    ••••
                    {returnData.bankDetails.accountNumber.slice(-4)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">IFSC Code</span>
                  <span className="font-medium font-mono">
                    {returnData.bankDetails.ifscCode}
                  </span>
                </div>
                {returnData.bankDetails.bankName && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Bank Name</span>
                    <span className="font-medium">
                      {returnData.bankDetails.bankName}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          )}

        {/* Admin Notes (if any) */}
        {returnData.adminNotes && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4"
          >
            <div className="flex items-start gap-3">
              <FileCheck className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-blue-900">Admin Notes</p>
                <p className="text-sm text-blue-700 mt-1 whitespace-pre-wrap">
                  {returnData.adminNotes}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
