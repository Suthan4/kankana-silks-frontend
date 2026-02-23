"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Package,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Info,
  Upload,
  X,
  ImageIcon,
  Video,
  FileText,
} from "lucide-react";
import { useOrder } from "@/hooks/useOrders";
import { useReturnEligibility } from "@/hooks/useReturnEligibility";
import Image from "next/image";
import { toast } from "sonner";
import { useCreateReturn } from "@/hooks/useUserReturns";
import {
  getReturnReasonLabel,
  isFreeReturnReason,
  RefundMethod,
  ReturnReason,
} from "@/lib/api/return.api";

// Media file type
interface MediaFile {
  id: string;
  file: File;
  preview: string;
  type: "IMAGE" | "VIDEO";
  description: string;
  uploading: boolean;
  uploaded: boolean;
  url?: string;
  key?: string;
  thumbnailUrl?: string;
  mimeType: string;
  fileSize: number;
  width?: number;
  height?: number;
  duration?: number;
}

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

  // ✅ Media upload state
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [uploadingAll, setUploadingAll] = useState(false);

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

  // ✅ Handle media file selection
  const handleMediaSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (files.length === 0) return;

    // Check total file count
    if (mediaFiles.length + files.length > 10) {
      toast.error("Maximum 10 media files allowed");
      return;
    }

    for (const file of files) {
      // Validate file type
      if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
        toast.error(
          `Invalid file type: ${file.name}. Only images and videos are allowed.`,
        );
        continue;
      }

      // Validate file size (50MB)
      if (file.size > 50 * 1024 * 1024) {
        toast.error(`File too large: ${file.name}. Maximum size is 50MB.`);
        continue;
      }

      const mediaFile: MediaFile = {
        id: Math.random().toString(36).substring(7),
        file,
        preview: URL.createObjectURL(file),
        type: file.type.startsWith("image/") ? "IMAGE" : "VIDEO",
        description: "",
        uploading: false,
        uploaded: false,
        mimeType: file.type,
        fileSize: file.size,
      };

      // Get dimensions for images
      if (file.type.startsWith("image/")) {
        const img = new window.Image();
        img.src = mediaFile.preview;
        await new Promise((resolve) => {
          img.onload = () => {
            mediaFile.width = img.width;
            mediaFile.height = img.height;
            resolve(null);
          };
        });
      }

      // Get duration and dimensions for videos
      if (file.type.startsWith("video/")) {
        const video = document.createElement("video");
        video.src = mediaFile.preview;
        await new Promise((resolve) => {
          video.onloadedmetadata = () => {
            mediaFile.duration = video.duration;
            mediaFile.width = video.videoWidth;
            mediaFile.height = video.videoHeight;
            resolve(null);
          };
        });
      }

      setMediaFiles((prev) => [...prev, mediaFile]);
    }

    // Reset input
    e.target.value = "";
  };

  // ✅ Remove media file
  const removeMedia = (id: string) => {
    setMediaFiles((prev) => {
      const file = prev.find((f) => f.id === id);
      if (file?.preview) {
        URL.revokeObjectURL(file.preview);
      }
      return prev.filter((f) => f.id !== id);
    });
  };

  // ✅ Update media description
  const updateDescription = (id: string, description: string) => {
    setMediaFiles((prev) =>
      prev.map((file) => (file.id === id ? { ...file, description } : file)),
    );
  };

  // ✅ Upload single media file to R2
  const uploadMediaFile = async (mediaFile: MediaFile): Promise<boolean> => {
    try {
      // Update uploading state
      setMediaFiles((prev) =>
        prev.map((f) => (f.id === mediaFile.id ? { ...f, uploading: true } : f)),
      );

      // Get presigned URL from backend
      const urlResponse = await fetch("/api/media/get-upload-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          fileName: mediaFile.file.name,
          fileType: mediaFile.mimeType,
          fileSize: mediaFile.fileSize,
        }),
      });

      if (!urlResponse.ok) {
        throw new Error("Failed to get upload URL");
      }

      const { data } = await urlResponse.json();
      const { uploadUrl, fileUrl, fileKey } = data;

      // Upload to R2 using presigned URL
      const uploadResponse = await fetch(uploadUrl, {
        method: "PUT",
        body: mediaFile.file,
        headers: {
          "Content-Type": mediaFile.mimeType,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload file");
      }

      let thumbnailUrl: string | undefined;

      // Generate and upload thumbnail for videos
      if (mediaFile.type === "VIDEO") {
        const video = document.createElement("video");
        video.src = mediaFile.preview;
        video.currentTime = 1; // Capture frame at 1 second

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        await new Promise((resolve) => {
          video.onseeked = () => {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            ctx?.drawImage(video, 0, 0);

            canvas.toBlob(
              async (blob) => {
                if (!blob) {
                  resolve(null);
                  return;
                }

                try {
                  // Get presigned URL for thumbnail
                  const thumbUrlResponse = await fetch(
                    "/api/media/get-thumbnail-upload-url",
                    {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                      },
                      body: JSON.stringify({
                        fileName: `${mediaFile.file.name}.jpg`,
                        fileType: "image/jpeg",
                        fileSize: blob.size,
                      }),
                    },
                  );

                  if (thumbUrlResponse.ok) {
                    const thumbData = await thumbUrlResponse.json();

                    // Upload thumbnail
                    await fetch(thumbData.data.uploadUrl, {
                      method: "PUT",
                      body: blob,
                      headers: {
                        "Content-Type": "image/jpeg",
                      },
                    });

                    thumbnailUrl = thumbData.data.fileUrl;
                  }
                } catch (error) {
                  console.error("Failed to upload thumbnail:", error);
                }

                resolve(null);
              },
              "image/jpeg",
              0.8,
            );
          };
        });
      }

      // Update file with uploaded data
      setMediaFiles((prev) =>
        prev.map((f) =>
          f.id === mediaFile.id
            ? {
                ...f,
                uploading: false,
                uploaded: true,
                url: fileUrl,
                key: fileKey,
                thumbnailUrl,
              }
            : f,
        ),
      );

      return true;
    } catch (error) {
      console.error("Error uploading file:", error);

      // Update error state
      setMediaFiles((prev) =>
        prev.map((f) =>
          f.id === mediaFile.id ? { ...f, uploading: false, uploaded: false } : f,
        ),
      );

      toast.error(`Failed to upload ${mediaFile.file.name}`);
      return false;
    }
  };

  // ✅ Upload all media files
  const uploadAllMedia = async (): Promise<boolean> => {
    const unuploadedFiles = mediaFiles.filter((f) => !f.uploaded);

    if (unuploadedFiles.length === 0) return true;

    setUploadingAll(true);

    try {
      const results = await Promise.all(
        unuploadedFiles.map((file) => uploadMediaFile(file)),
      );

      const allSuccess = results.every((result) => result);

      if (!allSuccess) {
        toast.error("Some files failed to upload. Please try again.");
      }

      return allSuccess;
    } finally {
      setUploadingAll(false);
    }
  };

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

    // ✅ Validate media upload
    if (mediaFiles.length === 0) {
      toast.error("Please upload at least one photo or video showing the issue");
      return;
    }

    if (mediaFiles.some((f) => f.uploading)) {
      toast.error("Please wait for all files to finish uploading");
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
      // ✅ Upload all media first
      const uploadSuccess = await uploadAllMedia();

      if (!uploadSuccess) {
        return;
      }

      // ✅ Prepare media data for API
      const media = mediaFiles.map((file, index) => ({
        type: file.type,
        url: file.url!,
        key: file.key!,
        thumbnailUrl: file.thumbnailUrl,
        mimeType: file.mimeType,
        fileSize: file.fileSize,
        duration: file.duration,
        width: file.width,
        height: file.height,
        order: index,
        description: file.description || undefined,
      }));

      // ✅ Create return with media
      await createReturn({
        orderId: order!.id,
        orderItems: selectedItems.map((item) => ({
          orderItemId: item.orderItemId,
          quantity: item.quantity,
          reason,
        })),
        reasonDetails,
        media, // ✅ Include media in request
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

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
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

        {/* ✅ MEDIA UPLOAD SECTION */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6"
        >
          <h3 className="font-semibold mb-4">
            Upload Photos/Videos * (Required)
          </h3>

          {/* Instructions */}
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 mb-4 flex items-start gap-3">
            <FileText className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-yellow-900 mb-2">
                Please include photos/videos showing:
              </p>
              <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
                <li>Full product from multiple angles</li>
                <li>Close-up of any defects or issues</li>
                <li>Product tags and labels (if applicable)</li>
                <li>Packaging condition (if damaged)</li>
              </ul>
            </div>
          </div>

          {/* Upload Button */}
          <label
            htmlFor="media-upload"
            className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors mb-4"
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-12 h-12 text-gray-400 mb-3" />
              <p className="mb-2 text-sm text-gray-600">
                <span className="font-semibold">Click to upload</span> or drag
                and drop
              </p>
              <p className="text-xs text-gray-500">
                Images or Videos (max 50MB each, up to 10 files)
              </p>
            </div>
            <input
              id="media-upload"
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={handleMediaSelect}
              className="hidden"
            />
          </label>

          {/* Media Preview */}
          {mediaFiles.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-900">
                Selected Media ({mediaFiles.length}/10)
              </p>
              {mediaFiles.map((media) => (
                <div
                  key={media.id}
                  className="flex gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200"
                >
                  {/* Preview */}
                  <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-200">
                    {media.type === "IMAGE" ? (
                      <Image
                        src={media.preview}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="relative w-full h-full">
                        <video
                          src={media.preview}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20">
                          <Video className="w-8 h-8 text-white" />
                        </div>
                      </div>
                    )}

                    {/* Type Badge */}
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

                    {/* Upload Status */}
                    {media.uploading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                        <Loader2 className="w-6 h-6 text-white animate-spin" />
                      </div>
                    )}
                    {media.uploaded && (
                      <div className="absolute top-2 right-2">
                        <CheckCircle2 className="w-5 h-5 text-green-500 bg-white rounded-full" />
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {media.file.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(media.fileSize)}
                          {media.width &&
                            media.height &&
                            ` • ${media.width}x${media.height}`}
                          {media.duration &&
                            ` • ${Math.floor(media.duration / 60)}:${Math.floor(media.duration % 60).toString().padStart(2, "0")}`}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeMedia(media.id)}
                        disabled={submitting || uploadingAll}
                        className="text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <textarea
                      value={media.description}
                      onChange={(e) =>
                        updateDescription(media.id, e.target.value)
                      }
                      placeholder="Add a description (optional)"
                      rows={2}
                      disabled={submitting || uploadingAll}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed resize-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
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
            disabled={submitting || uploadingAll}
            className="flex-1 py-4 border-2 border-gray-200 rounded-lg font-semibold hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={
              submitting ||
              uploadingAll ||
              selectedItems.length === 0 ||
              mediaFiles.length === 0 ||
              mediaFiles.some((f) => f.uploading)
            }
            className="flex-1 py-4 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting || uploadingAll ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {uploadingAll ? "Uploading Media..." : "Submitting..."}
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