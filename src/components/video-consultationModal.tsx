import React, { useEffect, useState } from "react";
import {
  X,
  User,
  Mail,
  Phone,
  MessageSquare,
  Video,
  ChevronRight,
  Calendar,
  Clock,
  Loader2,
} from "lucide-react";
import { useAuthModal } from "@/store/useAuthModalStore";
import { useMutation } from "@tanstack/react-query";
import {
  consultationApi,
  ConsultationPlatform,
  CreateConsultationRequest,
} from "@/lib/api/consultation";
import { toast } from "sonner";

type VideoConsultationModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  productId?: string;
  categoryId?: string;
  productName?: string;
};

const VideoConsultationModal: React.FC<VideoConsultationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  productId,
  categoryId,
  productName,
}) => {
  const { user } = useAuthModal();
  const openModal = useAuthModal((state) => state.openModal);

  // Form state
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    platform: ConsultationPlatform.WHATSAPP,
    preferredDate: "",
    preferredTime: "",
    notes: "",
  });

  // Populate form with user data when available
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        fullName: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
        email: user.email || "",
        phone: user.phone || "",
      }));
    }
  }, [user]);

  // Create consultation mutation
  const createConsultationMutation = useMutation({
    mutationFn: (data: CreateConsultationRequest) =>
      consultationApi.createConsultation(data),
    onSuccess: (response) => {
      toast.success("Consultation request submitted successfully!");
      onClose();
      onSuccess?.();
      // Reset form
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        platform: ConsultationPlatform.WHATSAPP,
        preferredDate: "",
        preferredTime: "",
        notes: "",
      });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to submit request");
    },
  });

  // Close on ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      openModal("login");
      toast.info("Please login to book a consultation");
      onClose();
      return;
    }

    // Validation
    if (!formData.preferredDate || !formData.preferredTime) {
      toast.error("Please select date and time for consultation");
      return;
    }

    // Combine date and time into ISO datetime string
    const dateTime = new Date(
      `${formData.preferredDate}T${formData.preferredTime}:00`,
    );
    const isoDateTime = dateTime.toISOString();

    // Submit consultation request
    const requestData: CreateConsultationRequest = {
      productId,
      categoryId,
      platform: formData.platform,
      preferredDate: isoDateTime,
      preferredTime: formData.preferredTime,
      isPurchaseConsultation: !!productId,
      consultationNotes: formData.notes || undefined,
    };

    createConsultationMutation.mutate(requestData);
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePlatformChange = (platform: ConsultationPlatform) => {
    setFormData((prev) => ({ ...prev, platform }));
  };

  if (!isOpen) return null;

  // Get minimum date (today)
  const today = new Date().toISOString().split("T")[0];

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-500 to-indigo-600 text-white p-6 flex items-center justify-between rounded-t-3xl z-10">
          <div>
            <h2 className="text-2xl font-bold">Book Video Consultation</h2>
            <p className="text-sm opacity-90 mt-1">
              {productName
                ? `For ${productName}`
                : "Connect with our expert stylists"}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <form
          onSubmit={handleSubmit}
          className="p-6 lg:p-8 overflow-y-auto flex-1"
        >
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Left - Info */}
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-5 border-2 border-purple-100">
                <h3 className="font-bold text-lg mb-3">How it works</h3>

                <div className="space-y-3">
                  {[
                    {
                      num: 1,
                      title: "Book Appointment",
                      desc: "Choose your preferred time",
                    },
                    {
                      num: 2,
                      title: "Connect via Video",
                      desc: "Join on WhatsApp or Zoom/Meet",
                    },
                    {
                      num: 3,
                      title: "Shop & Select",
                      desc: "Browse with expert guidance",
                    },
                  ].map((step) => (
                    <div key={step.num} className="flex gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                        {step.num}
                      </div>
                      <div>
                        <div className="font-semibold text-sm">
                          {step.title}
                        </div>
                        <div className="text-xs text-gray-600">{step.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-yellow-50 rounded-2xl p-4 border-2 border-yellow-200">
                <p className="text-sm font-semibold text-yellow-900">
                  ✨ Free consultation for all customers
                </p>
              </div>
            </div>

            {/* Right - Form */}
            <div className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="Enter your name"
                    required
                    className="w-full pl-11 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-purple-500 transition"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="your@email.com"
                    required
                    className="w-full pl-11 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-purple-500 transition"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Phone Number
                </label>
                <div className="flex gap-2">
                  <select className="w-24 px-3 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-purple-500 font-medium">
                    <option>+91</option>
                  </select>

                  <div className="relative flex-1">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="98765 43210"
                      required
                      pattern="[0-9]{10}"
                      className="w-full pl-11 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-purple-500 transition"
                    />
                  </div>
                </div>
              </div>

              {/* Preferred Date */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Preferred Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="date"
                    name="preferredDate"
                    value={formData.preferredDate}
                    onChange={handleInputChange}
                    min={today}
                    required
                    className="w-full pl-11 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-purple-500 transition"
                  />
                </div>
              </div>

              {/* Preferred Time */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Preferred Time
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="time"
                    name="preferredTime"
                    value={formData.preferredTime}
                    onChange={handleInputChange}
                    required
                    className="w-full pl-11 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-purple-500 transition"
                  />
                </div>
              </div>

              {/* Platform Selection */}
              <div>
                <label className="block text-sm font-semibold mb-3">
                  Preferred Platform
                </label>

                <div className="space-y-2">
                  {[
                    {
                      id: ConsultationPlatform.WHATSAPP,
                      name: "WhatsApp Video",
                      icon: MessageSquare,
                      bg: "bg-green-500",
                    },
                    {
                      id: ConsultationPlatform.ZOOM,
                      name: "Zoom",
                      icon: Video,
                      bg: "bg-blue-500",
                    },
                    {
                      id: ConsultationPlatform.GOOGLE_MEET,
                      name: "Google Meet",
                      icon: Video,
                      bg: "bg-orange-500",
                    },
                  ].map((platform) => {
                    const Icon = platform.icon;
                    const isSelected = formData.platform === platform.id;

                    return (
                      <label
                        key={platform.id}
                        className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer hover:bg-gray-50 transition ${
                          isSelected
                            ? "border-purple-500 bg-purple-50"
                            : "border-gray-200"
                        }`}
                      >
                        <input
                          type="radio"
                          name="platform"
                          checked={isSelected}
                          onChange={() => handlePlatformChange(platform.id)}
                          className="w-5 h-5 accent-purple-500"
                        />

                        <div
                          className={`w-10 h-10 ${platform.bg} rounded-full flex items-center justify-center`}
                        >
                          <Icon className="w-5 h-5 text-white" />
                        </div>

                        <div className="flex-1">
                          <div className="font-semibold text-sm">
                            {platform.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            Video call
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Additional Notes */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Additional Notes (Optional)
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Any specific requirements or questions..."
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-purple-500 transition resize-none"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={createConsultationMutation.isPending}
                className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-4 rounded-xl font-bold hover:shadow-xl transition-all flex items-center justify-center gap-2 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createConsultationMutation.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Confirm Booking
                    <ChevronRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VideoConsultationModal;
