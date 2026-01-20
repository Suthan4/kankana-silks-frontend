"use client";

import { useState } from "react";
import {
  Video,
  Calendar,
  Clock,
  Plus,
  MessageSquare,
  Star,
  ChevronRight,
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import VideoConsultationModal from "@/components/video-consultationModal";
import { useQuery } from "@tanstack/react-query";
import {
  consultationApi,
  Consultation,
  ConsultationStatus,
  ConsultationPlatform,
} from "@/lib/api/consultation";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";

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

const statusIcons = {
  REQUESTED: AlertCircle,
  APPROVED: CheckCircle,
  REJECTED: XCircle,
  COMPLETED: CheckCircle,
  CANCELLED: XCircle,
};

export default function VideoAppointmentPage() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"upcoming" | "completed">(
    "upcoming"
  );

  // Fetch consultations based on active tab
  const { data, isLoading, error } = useQuery({
    queryKey: ["video-consultations", activeTab],
    queryFn: () => {
      const status =
        activeTab === "upcoming"
          ? [ConsultationStatus.REQUESTED, ConsultationStatus.APPROVED]
          : [ConsultationStatus.COMPLETED];

      return consultationApi.getUserConsultations({
        sortBy: "preferredDate",
        sortOrder: activeTab === "upcoming" ? "asc" : "desc",
      });
    },
  });

  // Filter consultations based on tab
  const consultations = data?.data?.consultations || [];
  const filteredConsultations = consultations.filter((consultation) => {
    if (activeTab === "upcoming") {
      return (
        consultation.status === ConsultationStatus.REQUESTED ||
        consultation.status === ConsultationStatus.APPROVED
      );
    } else {
      return consultation.status === ConsultationStatus.COMPLETED;
    }
  });

  const handleConsultationSuccess = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white border-b p-4 lg:p-6 sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold">Video Shopping</h1>
              <p className="text-sm text-gray-500 mt-1">
                Shop from home with our expert stylists
              </p>
            </div>
            {/* <button
              onClick={() => setIsModalOpen(true)}
              className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl flex items-center justify-center hover:shadow-xl transition-all hover:scale-110 shadow-lg"
            >
              <Plus className="w-6 h-6" />
            </button> */}
          </div>

          {/* Tabs */}
          <div className="flex gap-2">
            {(["upcoming", "completed"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                  activeTab === tab
                    ? "bg-black text-white shadow-lg"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="p-4 lg:p-6 max-w-4xl mx-auto">
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 text-center">
            <XCircle className="w-12 h-12 text-red-600 mx-auto mb-3" />
            <p className="text-red-900 font-semibold">
              Failed to load consultations
            </p>
            <p className="text-red-700 text-sm mt-1">Please try again later</p>
          </div>
        </div>
      )}

      {/* Consultations List */}
      {!isLoading && !error && (
        <div className="p-4 lg:p-6 space-y-4 max-w-4xl mx-auto">
          {/* Empty State */}
          {filteredConsultations.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl p-12 text-center"
            >
              <Video className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No {activeTab} consultations
              </h3>
              <p className="text-gray-600 mb-6">
                {activeTab === "upcoming"
                  ? "Book your first video consultation to get started"
                  : "You haven't completed any consultations yet"}
              </p>
              {activeTab === "upcoming" && (
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="inline-block bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-6 py-3 rounded-full font-semibold hover:shadow-xl transition"
                >
                  Book Consultation
                </button>
              )}
            </motion.div>
          )}

          {/* Upcoming Consultations */}
          {activeTab === "upcoming" &&
            filteredConsultations.map((consultation: Consultation, index) => {
              const platformInfo =
                platformConfig[
                  consultation.platform as keyof typeof platformConfig
                ];
              const PlatformIcon = platformInfo.icon;
              const StatusIcon =
                statusIcons[
                  consultation.status as keyof typeof statusIcons
                ];

              const preferredDate = new Date(consultation.preferredDate);
              const formattedDate = preferredDate.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              });

              const isApproved =
                consultation.status === ConsultationStatus.APPROVED;

              return (
                <motion.div
                  key={consultation.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-2xl border-2 border-gray-100 overflow-hidden hover:shadow-xl transition-all cursor-pointer"
                  onClick={() =>
                    router.push(
                      `/my-account/video-appointment/${consultation.id}`
                    )
                  }
                >
                  <div
                    className={`${
                      isApproved
                        ? "bg-gradient-to-br from-purple-500 to-indigo-600"
                        : "bg-gradient-to-br from-gray-600 to-gray-700"
                    } text-white p-5 lg:p-6`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2 text-sm font-semibold opacity-90">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {isApproved ? "CONFIRMED SESSION" : "PENDING APPROVAL"}
                        </span>
                      </div>
                      <div
                        className={`w-3 h-3 ${
                          isApproved ? "bg-green-400" : "bg-yellow-400"
                        } rounded-full ${
                          isApproved ? "animate-pulse" : ""
                        } shadow-lg`}
                      ></div>
                    </div>

                    <div className="flex items-center gap-3 mb-3">
                      <Clock className="w-6 h-6" />
                      <div>
                        <div className="text-xl lg:text-2xl font-bold">
                          {formattedDate}
                        </div>
                        <div className="text-sm opacity-90">
                          {consultation.preferredTime}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg backdrop-blur-sm">
                      <PlatformIcon className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        {platformInfo.label}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 lg:p-6">
                    {/* Status */}
                    <div className="flex items-center gap-2 mb-4">
                      <StatusIcon
                        className={`w-5 h-5 ${
                          isApproved ? "text-green-600" : "text-yellow-600"
                        }`}
                      />
                      <span
                        className={`text-sm font-semibold ${
                          isApproved ? "text-green-700" : "text-yellow-700"
                        }`}
                      >
                        {consultation.status === ConsultationStatus.REQUESTED
                          ? "Waiting for confirmation"
                          : "Confirmed - Ready to join"}
                      </span>
                    </div>

                    {/* Notes */}
                    {consultation.consultationNotes && (
                      <div className="bg-gray-50 rounded-lg p-3 mb-4">
                        <p className="text-sm text-gray-700 line-clamp-2">
                          {consultation.consultationNotes}
                        </p>
                      </div>
                    )}

                    {/* Created */}
                    <p className="text-xs text-gray-500 mb-4">
                      Requested{" "}
                      {formatDistanceToNow(new Date(consultation.createdAt), {
                        addSuffix: true,
                      })}
                    </p>

                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-2">
                      {isApproved && consultation.meetingLink ? (
                        <a
                          href={consultation.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="flex-1 bg-black text-white py-3 rounded-xl font-semibold hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
                        >
                          <Video className="w-4 h-4" />
                          Join Now
                        </a>
                      ) : (
                        <button
                          disabled
                          className="flex-1 bg-gray-200 text-gray-500 py-3 rounded-xl font-semibold cursor-not-allowed"
                        >
                          Pending
                        </button>
                      )}
                      <button className="px-4 py-3 border-2 border-gray-200 rounded-xl font-semibold hover:bg-gray-50 transition-all flex items-center justify-center gap-2">
                        Details
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}

          {/* Completed Consultations */}
          {activeTab === "completed" &&
            filteredConsultations.map((consultation: Consultation, index) => {
              const platformInfo =
                platformConfig[
                  consultation.platform as keyof typeof platformConfig
                ];

              const preferredDate = new Date(consultation.preferredDate);
              const formattedDate = preferredDate.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              });

              return (
                <motion.div
                  key={consultation.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-2xl border-2 border-gray-100 p-5 lg:p-6"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center">
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-md text-xs font-semibold">
                          COMPLETED
                        </span>
                      </div>
                      <p className="font-bold text-lg mb-1">
                        {platformInfo.label} Session
                      </p>
                      <p className="text-sm text-gray-600 mb-2">
                        {formattedDate} at {consultation.preferredTime}
                      </p>
                      {consultation.consultationNotes && (
                        <p className="text-sm text-gray-500 line-clamp-2">
                          {consultation.consultationNotes}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="py-3 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition-all"
                    >
                      Book Again
                    </button>
                    <button
                      onClick={() =>
                        router.push(
                          `/my-account/video-appointment/${consultation.id}`
                        )
                      }
                      className="py-3 border-2 border-gray-200 rounded-xl font-semibold hover:bg-gray-50 transition-all"
                    >
                      View Details
                    </button>
                  </div>
                </motion.div>
              );
            })}

          {/* Info Card */}
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-6 border-2 border-purple-100">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                <Video className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-bold text-lg mb-2">Why Video Shopping?</p>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>✓ Personal styling consultation from home</li>
                  <li>✓ See products in real-time via video</li>
                  <li>✓ Expert guidance from our stylists</li>
                  <li>✓ Convenient and time-saving</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {/* <VideoConsultationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleConsultationSuccess}
      /> */}
    </div>
  );
}