"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Upload,
  X,
  ImageIcon,
  Video,
  Loader2,
  CheckCircle2,
  AlertCircle,
  FileText,
} from "lucide-react";
import Image from "next/image";
import { useReturn } from "@/hooks/useUserReturns";
import { toast } from "sonner";
import { ReturnApiService } from "@/lib/api/return.api";

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

export default function UploadAdditionalMediaPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data, isLoading } = useReturn(params.id);

  const returnData = data?.data;

  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleMediaSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (files.length === 0) return;

    if (mediaFiles.length + files.length > 10) {
      toast.error("Maximum 10 media files allowed in total");
      return;
    }

    for (const file of files) {
      if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
        toast.error(
          `Invalid file type: ${file.name}. Only images and videos are allowed.`,
        );
        continue;
      }

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

    e.target.value = "";
  };

  const removeMedia = (id: string) => {
    setMediaFiles((prev) => {
      const file = prev.find((f) => f.id === id);
      if (file?.preview) {
        URL.revokeObjectURL(file.preview);
      }
      return prev.filter((f) => f.id !== id);
    });
  };

  const updateDescription = (id: string, description: string) => {
    setMediaFiles((prev) =>
      prev.map((file) => (file.id === id ? { ...file, description } : file)),
    );
  };

  const uploadMediaFile = async (mediaFile: MediaFile): Promise<boolean> => {
    try {
      setMediaFiles((prev) =>
        prev.map((f) => (f.id === mediaFile.id ? { ...f, uploading: true } : f)),
      );

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

      if (!urlResponse.ok) throw new Error("Failed to get upload URL");

      const { data } = await urlResponse.json();
      const { uploadUrl, fileUrl, fileKey } = data;

      const uploadResponse = await fetch(uploadUrl, {
        method: "PUT",
        body: mediaFile.file,
        headers: {
          "Content-Type": mediaFile.mimeType,
        },
      });

      if (!uploadResponse.ok) throw new Error("Failed to upload file");

      let thumbnailUrl: string | undefined;

      if (mediaFile.type === "VIDEO") {
        const video = document.createElement("video");
        video.src = mediaFile.preview;
        video.currentTime = 1;

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

                  await fetch(thumbData.data.uploadUrl, {
                    method: "PUT",
                    body: blob,
                    headers: {
                      "Content-Type": "image/jpeg",
                    },
                  });

                  thumbnailUrl = thumbData.data.fileUrl;
                }

                resolve(null);
              },
              "image/jpeg",
              0.8,
            );
          };
        });
      }

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

      setMediaFiles((prev) =>
        prev.map((f) =>
          f.id === mediaFile.id ? { ...f, uploading: false, uploaded: false } : f,
        ),
      );

      return false;
    }
  };

  const uploadAllMedia = async (): Promise<boolean> => {
    const unuploadedFiles = mediaFiles.filter((f) => !f.uploaded);

    if (unuploadedFiles.length === 0) return true;

    const results = await Promise.all(
      unuploadedFiles.map((file) => uploadMediaFile(file)),
    );

    return results.every((result) => result);
  };

  const handleSubmit = async () => {
    if (mediaFiles.length === 0) {
      toast.error("Please add at least one photo or video");
      return;
    }

    if (mediaFiles.some((f) => f.uploading)) {
      toast.error("Please wait for all files to finish uploading");
      return;
    }

    try {
      setUploading(true);

      const uploadSuccess = await uploadAllMedia();

      if (!uploadSuccess) {
        toast.error("Some files failed to upload. Please try again.");
        return;
      }

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

      await ReturnApiService.addMediaToReturn(params.id, { media });

      setSubmitted(true);
      toast.success("Media uploaded successfully!");

      setTimeout(() => {
        router.push("/my-account/returns");
      }, 2000);
    } catch (error: any) {
      console.error("Error submitting media:", error);
      toast.error(error.message || "Failed to submit additional media");
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!returnData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Return not found</p>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Media Uploaded Successfully!
          </h2>
          <p className="text-gray-600">
            Thank you for providing additional photos/videos. Our team will
            review them shortly.
          </p>
        </motion.div>
      </div>
    );
  }

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
                Upload Additional Media
              </h1>
              <p className="text-sm text-gray-500">
                Return #{returnData.returnNumber}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 lg:p-6 max-w-4xl mx-auto space-y-4">
        {/* Admin Request Message */}
        {returnData.adminNotes && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">
                  Additional Media Requested
                </h3>
                <p className="text-sm text-blue-800 whitespace-pre-wrap">
                  {returnData.adminNotes}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4"
        >
          <div className="flex items-start gap-3">
            <FileText className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-yellow-900 mb-2">
                Please include photos/videos showing:
              </h3>
              <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
                <li>Full product from multiple angles</li>
                <li>Close-up of any defects or issues</li>
                <li>Product tags and labels (if applicable)</li>
                <li>Packaging condition (if damaged)</li>
                <li>Any other relevant details</li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Upload Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6"
        >
          <h3 className="font-semibold mb-4">Upload Photos/Videos</h3>

          {/* File Input */}
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
                        disabled={uploading}
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
                      disabled={uploading}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed resize-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

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
            disabled={uploading}
            className="flex-1 py-4 border-2 border-gray-200 rounded-lg font-semibold hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSubmit}
            disabled={
              uploading ||
              mediaFiles.length === 0 ||
              mediaFiles.some((f) => f.uploading)
            }
            className="flex-1 py-4 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {uploading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                Upload Media ({mediaFiles.length})
              </>
            )}
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}