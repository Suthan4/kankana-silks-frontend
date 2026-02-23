"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
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
  ImageIcon,
  Video,
  ExternalLink,
  Download,
  Upload,
} from "lucide-react";
import Image from "next/image";
import { useReturn } from "@/hooks/useUserReturns";
import {
  getReturnReasonLabel,
  getReturnStatusLabel,
  ReturnStatus,
} from "@/lib/api/return.api";

export default function ReturnDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data, isLoading, error } = useReturn(params.id);

  const returnData = data?.data;

  // Media viewer state
  const [selectedMedia, setSelectedMedia] = useState<any>(null);
  const [mediaModalOpen, setMediaModalOpen] = useState(false);

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

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
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

        {/* Rejection Reason */}
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

        {/* ✅ Uploaded Media Section */}
        {returnData.media && returnData.media.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-6"
          >
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <ImageIcon className="w-5 h-5" />
              Uploaded Media ({returnData.media.length})
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {returnData.media
                .sort((a: any, b: any) => a.order - b.order)
                .map((media: any) => (
                  <button
                    key={media.id}
                    onClick={() => {
                      setSelectedMedia(media);
                      setMediaModalOpen(true);
                    }}
                    className="relative group aspect-square rounded-lg overflow-hidden bg-gray-100 hover:ring-2 hover:ring-blue-600 transition-all"
                  >
                    {media.type === "IMAGE" ? (
                      <Image
                        src={media.url}
                        alt={media.description || "Return media"}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="relative w-full h-full">
                        <Image
                          src={media.thumbnailUrl || "/placeholder-video.png"}
                          alt={media.description || "Video thumbnail"}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20">
                          <Video className="w-12 h-12 text-white" />
                        </div>
                        {media.duration && (
                          <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                            {formatDuration(media.duration)}
                          </div>
                        )}
                      </div>
                    )}
                    <div className="absolute top-2 left-2">
                      {media.type === "IMAGE" ? (
                        <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded">
                          IMAGE
                        </span>
                      ) : (
                        <span className="bg-purple-500 text-white text-xs px-2 py-1 rounded">
                          VIDEO
                        </span>
                      )}
                    </div>
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all flex items-center justify-center">
                      <ExternalLink className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </button>
                ))}
            </div>

            {/* Upload More Media Button */}
            {returnData.status === ReturnStatus.PENDING && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() =>
                  router.push(
                    `/my-account/returns/${returnData.id}/upload-media`,
                  )
                }
                className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors font-medium"
              >
                <Upload className="w-4 h-4" />
                Upload Additional Media
              </motion.button>
            )}
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

        {/* Refund Details */}
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

        {/* Admin Notes */}
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

      {/* ✅ Media Viewer Modal */}
      <AnimatePresence>
        {mediaModalOpen && selectedMedia && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMediaModalOpen(false)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 p-4"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-5xl w-full bg-white rounded-lg overflow-hidden"
            >
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {selectedMedia.type} Preview
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {formatFileSize(selectedMedia.fileSize)}
                    {selectedMedia.width &&
                      selectedMedia.height &&
                      ` • ${selectedMedia.width}x${selectedMedia.height}`}
                    {selectedMedia.duration &&
                      ` • ${formatDuration(selectedMedia.duration)}`}
                  </p>
                  {selectedMedia.description && (
                    <p className="text-sm text-gray-700 mt-2">
                      {selectedMedia.description}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setMediaModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="p-4 bg-gray-50">
                {selectedMedia.type === "IMAGE" ? (
                  <div
                    className="relative w-full"
                    style={{ maxHeight: "70vh" }}
                  >
                    <Image
                      src={selectedMedia.url}
                      alt={selectedMedia.description || "Return media"}
                      width={selectedMedia.width || 800}
                      height={selectedMedia.height || 600}
                      className="w-full h-auto object-contain"
                    />
                  </div>
                ) : (
                  <video
                    src={selectedMedia.url}
                    controls
                    className="w-full max-h-[70vh] rounded-lg"
                  >
                    Your browser does not support video playback.
                  </video>
                )}
              </div>

              <div className="p-4 border-t border-gray-200 flex gap-2">
                <a
                  href={selectedMedia.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open in New Tab
                </a>
                <a
                  href={selectedMedia.url}
                  download
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
