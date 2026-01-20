"use client";

import {
  ArrowLeft,
  Video,
  Calendar,
  Clock,
  Phone,
  Mail,
  MessageSquare,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2,
  ExternalLink,
  User,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  consultationApi,
  ConsultationStatus,
  ConsultationPlatform,
} from "@/lib/api/consultation";
import { toast } from "sonner";
import { motion } from "framer-motion";

const platformConfig = {
  WHATSAPP: {
    label: "WhatsApp Video",
    icon: MessageSquare,
    color: "text-green-600",
    bg: "bg-green-50",
  },
  ZOOM: {
    label: "Zoom",
    icon: Video,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  GOOGLE_MEET: {
    label: "Google Meet",
    icon: Video,
    color: "text-orange-600",
    bg: "bg-orange-50",
  },
};

const statusConfig = {
  REQUESTED: {
    label: "Pending Approval",
    icon: AlertCircle,
    color: "text-yellow-600",
    bg: "bg-yellow-100",
  },
  APPROVED: {
    label: "Confirmed",
    icon: CheckCircle,
    color: "text-green-600",
    bg: "bg-green-100",
  },
  REJECTED: {
    label: "Rejected",
    icon: XCircle,
    color: "text-red-600",
    bg: "bg-red-100",
  },
  COMPLETED: {
    label: "Completed",
    icon: CheckCircle,
    color: "text-blue-600",
    bg: "bg-blue-100",
  },
  CANCELLED: {
    label: "Cancelled",
    icon: XCircle,
    color: "text-gray-600",
    bg: "bg-gray-100",
  },
};

export default function VideoAppointmentDetailsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
   const params = useParams<{ id: string }>();
   const id = params?.id;

  // Fetch consultation details
  const { data, isLoading, error } = useQuery({
    queryKey: ["consultation", id],
    queryFn: () => consultationApi.getConsultation(id),
  });

  // Cancel consultation mutation
  const cancelMutation = useMutation({
    mutationFn: () => consultationApi.cancelConsultation(params.id),
    onSuccess: () => {
      toast.success("Consultation cancelled successfully");
      queryClient.invalidateQueries({ queryKey: ["consultation", params.id] });
      queryClient.invalidateQueries({ queryKey: ["video-consultations"] });
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to cancel consultation",
      );
    },
  });

  const handleCancel = () => {
    if (
      window.confirm(
        "Are you sure you want to cancel this consultation? This action cannot be undone.",
      )
    ) {
      cancelMutation.mutate();
    }
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md text-center">
          <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Failed to Load
          </h2>
          <p className="text-gray-600 mb-6">
            Unable to load consultation details. Please try again.
          </p>
          <button
            onClick={() => router.back()}
            className="bg-black text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const consultation = data?.data;
  if (!consultation) return null;

  const platformInfo =
    platformConfig[consultation.platform as keyof typeof platformConfig];
  const statusInfo =
    statusConfig[consultation.status as keyof typeof statusConfig];
  const StatusIcon = statusInfo.icon;
  const PlatformIcon = platformInfo.icon;

  const preferredDate = new Date(consultation.preferredDate);
  const formattedDate = preferredDate.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const canCancel =
    consultation.status === ConsultationStatus.REQUESTED ||
    consultation.status === ConsultationStatus.APPROVED;

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
                Consultation Details
              </h1>
              <p className="text-sm text-gray-500">#{consultation.id}</p>
            </div>
            <span
              className={`px-3 py-1 ${statusInfo.bg} ${statusInfo.color} rounded-full text-sm font-medium flex items-center gap-1`}
            >
              <StatusIcon className="w-4 h-4" />
              {statusInfo.label}
            </span>
          </div>
        </div>
      </div>

      <div className="p-4 lg:p-6 max-w-4xl mx-auto space-y-4">
        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${
            consultation.status === ConsultationStatus.APPROVED
              ? "bg-gradient-to-br from-purple-500 to-indigo-600"
              : "bg-gradient-to-br from-gray-600 to-gray-700"
          } text-white rounded-2xl p-6`}
        >
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-sm opacity-90 mb-2">
                {consultation.status === ConsultationStatus.APPROVED
                  ? "CONFIRMED SESSION"
                  : "VIDEO CONSULTATION"}
              </p>
              <h2 className="text-2xl font-bold mb-2">{formattedDate}</h2>
              <p className="text-lg opacity-95">{consultation.preferredTime}</p>
            </div>
            <div className="bg-white/20 p-3 rounded-full">
              <Video className="w-6 h-6" />
            </div>
          </div>

          <div className="flex items-center gap-2 bg-white/20 px-4 py-3 rounded-lg">
            <PlatformIcon className="w-5 h-5" />
            <span className="font-medium">{platformInfo.label}</span>
          </div>

          {/* Meeting Link - Only show if approved */}
          {consultation.status === ConsultationStatus.APPROVED &&
            consultation.meetingLink && (
              <div className="mt-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4">
                <p className="text-sm opacity-90 mb-2">Meeting Link</p>
                <a
                  href={consultation.meetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white font-medium hover:underline flex items-center gap-2 break-all"
                >
                  {consultation.meetingLink}
                  <ExternalLink className="w-4 h-4 flex-shrink-0" />
                </a>
              </div>
            )}
        </motion.div>

        {/* User Info */}
        {consultation.user && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-6"
          >
            <h3 className="font-semibold mb-4">Your Information</h3>
            <div className="flex items-start gap-4 p-4 bg-gradient-to-br from-gray-50 to-purple-50 rounded-xl border">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-lg">
                  {consultation.user.firstName} {consultation.user.lastName}
                </h4>
                <div className="flex flex-wrap gap-3 text-sm mt-2">
                  {consultation.user.email && (
                    <a
                      href={`mailto:${consultation.user.email}`}
                      className="flex items-center gap-1 text-gray-600 hover:text-black"
                    >
                      <Mail className="w-4 h-4" />
                      <span className="hidden sm:inline">
                        {consultation.user.email}
                      </span>
                      <span className="sm:hidden">Email</span>
                    </a>
                  )}
                  {consultation.user.phone && (
                    <a
                      href={`tel:${consultation.user.phone}`}
                      className="flex items-center gap-1 text-gray-600 hover:text-black"
                    >
                      <Phone className="w-4 h-4" />
                      <span className="hidden sm:inline">
                        {consultation.user.phone}
                      </span>
                      <span className="sm:hidden">Call</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Session Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-6"
        >
          <h3 className="font-semibold mb-4">Session Details</h3>

          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">
                Session Type
              </label>
              <p className="font-medium">
                {consultation.isPurchaseConsultation
                  ? "Purchase Consultation"
                  : "General Consultation"}
              </p>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">
                Platform
              </label>
              <p className="font-medium">{platformInfo.label}</p>
            </div>
          </div>

          {consultation.consultationNotes && (
            <div className="mt-4">
              <label className="text-xs text-gray-500 mb-2 block">
                Your Notes
              </label>
              <p className="text-sm text-gray-700 bg-amber-50 p-4 rounded-lg border border-amber-200">
                {consultation.consultationNotes}
              </p>
            </div>
          )}

          {/* Rejection Reason */}
          {consultation.status === ConsultationStatus.REJECTED &&
            consultation.rejectionReason && (
              <div className="mt-4">
                <label className="text-xs text-gray-500 mb-2 block">
                  Rejection Reason
                </label>
                <p className="text-sm text-red-700 bg-red-50 p-4 rounded-lg border border-red-200">
                  {consultation.rejectionReason}
                </p>
              </div>
            )}

          {/* Approved By */}
          {consultation.status === ConsultationStatus.APPROVED &&
            consultation.approvedBy && (
              <div className="mt-4">
                <label className="text-xs text-gray-500 mb-2 block">
                  Approved By
                </label>
                <p className="text-sm text-green-700 bg-green-50 p-4 rounded-lg border border-green-200">
                  {consultation.approvedBy}
                </p>
              </div>
            )}
        </motion.div>

        {/* Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-6"
        >
          <h3 className="font-semibold mb-4">Timeline</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-purple-600 rounded-full mt-2"></div>
              <div>
                <p className="text-sm font-medium">Request Submitted</p>
                <p className="text-xs text-gray-500">
                  {new Date(consultation.createdAt).toLocaleString("en-US", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
              </div>
            </div>
            {consultation.updatedAt !== consultation.createdAt && (
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-gray-400 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium">Last Updated</p>
                  <p className="text-xs text-gray-500">
                    {new Date(consultation.updatedAt).toLocaleString("en-US", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-3"
        >
          {consultation.status === ConsultationStatus.APPROVED &&
            consultation.meetingLink && (
              <a
                href={consultation.meetingLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-black text-white py-4 rounded-xl font-semibold hover:bg-gray-800 transition flex items-center justify-center gap-2"
              >
                <Video className="w-5 h-5" />
                Join Session
              </a>
            )}

          {canCancel && (
            <button
              onClick={handleCancel}
              disabled={cancelMutation.isPending}
              className="sm:w-36 py-4 border-2 border-red-300 text-red-600 rounded-xl font-semibold hover:bg-red-50 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {cancelMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Cancelling...
                </>
              ) : (
                "Cancel"
              )}
            </button>
          )}
        </motion.div>

        {/* Help Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-100"
        >
          <h3 className="font-bold text-lg mb-2">Need Help?</h3>
          <p className="text-sm text-gray-700 mb-3">
            If you have any questions or need to reschedule, please contact our
            support team.
          </p>
          <div className="flex gap-3 text-sm">
            <a
              href="mailto:support@example.com"
              className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
            >
              <Mail className="w-4 h-4" />
              Email Support
            </a>
            <a
              href="tel:+911234567890"
              className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
            >
              <Phone className="w-4 h-4" />
              Call Support
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
