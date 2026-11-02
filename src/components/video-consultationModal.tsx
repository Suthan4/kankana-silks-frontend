"use client";

import { useModalScrollLock } from "@/hooks/useModalScrollLock";
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

  useModalScrollLock(isOpen);

  // Keep Escape handling separate from global scroll locking.
  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
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
      className="fixed inset-0 z-[1000] flex items-end justify-center bg-black/55 md:items-center md:p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      role="presentation"
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="video-consultation-title"
        className="flex w-full max-w-4xl flex-col overflow-hidden rounded-t-[28px] bg-white shadow-2xl md:rounded-[28px]"
        style={{
          height: "min(94dvh, 860px)",
          maxHeight: "calc(100dvh - env(safe-area-inset-top) - 8px)",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        <header className="relative z-10 flex shrink-0 items-center justify-between bg-gradient-to-r from-purple-500 to-indigo-600 px-5 pb-4 pt-4 text-white sm:px-6 sm:py-5">
          <div className="mx-auto absolute left-1/2 top-2 h-1.5 w-10 -translate-x-1/2 rounded-full bg-white/50 md:hidden" />
          <div className="min-w-0 pr-3 pt-2 md:pt-0">
            <h2 id="video-consultation-title" className="text-xl font-bold leading-tight sm:text-2xl">
              Book Video Consultation
            </h2>
            <p className="mt-1 text-sm opacity-90">
              {productName ? `For ${productName}` : "Connect with our expert stylists"}
            </p>
          </div>
          <button
            type="button"
            aria-label="Close video consultation"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition hover:bg-white/20 active:scale-95"
          >
            <X className="h-6 w-6" />
          </button>
        </header>

        <form
          id="video-consultation-form"
          onSubmit={handleSubmit}
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5 sm:px-6 sm:py-6"
        >
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 lg:gap-7">
            <div className="space-y-4">
              <div className="rounded-2xl border border-purple-100 bg-gradient-to-br from-purple-50 to-indigo-50 p-4 sm:p-5">
                <h3 className="mb-3 text-base font-bold sm:text-lg">How it works</h3>
                <div className="space-y-3">
                  {[
                    { num: 1, title: "Book Appointment", desc: "Choose your preferred time" },
                    { num: 2, title: "Connect via Video", desc: "Join on WhatsApp or Zoom/Meet" },
                    { num: 3, title: "Shop & Select", desc: "Browse with expert guidance" },
                  ].map((step) => (
                    <div key={step.num} className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 text-sm font-bold text-white">
                        {step.num}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold">{step.title}</div>
                        <div className="text-xs text-gray-600">{step.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-4">
                <p className="text-sm font-semibold text-yellow-900">
                  ✨ Free consultation for all customers
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="Enter your name"
                    required
                    className="w-full rounded-xl border-2 border-gray-300 py-3 pl-11 pr-4 text-base transition focus:border-purple-500 focus:outline-none sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="your@email.com"
                    required
                    className="w-full rounded-xl border-2 border-gray-300 py-3 pl-11 pr-4 text-base transition focus:border-purple-500 focus:outline-none sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">Phone Number</label>
                <div className="flex gap-2">
                  <select className="w-24 shrink-0 rounded-xl border-2 border-gray-300 px-3 py-3 text-base font-medium focus:border-purple-500 focus:outline-none sm:text-sm">
                    <option>+91</option>
                  </select>
                  <div className="relative min-w-0 flex-1">
                    <Phone className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="98765 43210"
                      required
                      pattern="[0-9]{10}"
                      inputMode="numeric"
                      className="w-full rounded-xl border-2 border-gray-300 py-3 pl-11 pr-3 text-base transition focus:border-purple-500 focus:outline-none sm:text-sm"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">Preferred Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    type="date"
                    name="preferredDate"
                    value={formData.preferredDate}
                    onChange={handleInputChange}
                    min={today}
                    required
                    className="w-full rounded-xl border-2 border-gray-300 py-3 pl-11 pr-4 text-base transition focus:border-purple-500 focus:outline-none sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">Preferred Time</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    type="time"
                    name="preferredTime"
                    value={formData.preferredTime}
                    onChange={handleInputChange}
                    required
                    className="w-full rounded-xl border-2 border-gray-300 py-3 pl-11 pr-4 text-base transition focus:border-purple-500 focus:outline-none sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="mb-3 block text-sm font-semibold">Preferred Platform</label>
                <div className="space-y-2">
                  {[
                    { id: ConsultationPlatform.WHATSAPP, name: "WhatsApp Video", icon: MessageSquare, bg: "bg-green-500" },
                    { id: ConsultationPlatform.ZOOM, name: "Zoom", icon: Video, bg: "bg-blue-500" },
                    { id: ConsultationPlatform.GOOGLE_MEET, name: "Google Meet", icon: Video, bg: "bg-orange-500" },
                  ].map((platform) => {
                    const Icon = platform.icon;
                    const isSelected = formData.platform === platform.id;
                    return (
                      <label
                        key={platform.id}
                        className={`flex min-h-[68px] cursor-pointer items-center gap-3 rounded-xl border-2 p-3 transition active:scale-[0.99] ${
                          isSelected ? "border-purple-500 bg-purple-50" : "border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        <input
                          type="radio"
                          name="platform"
                          checked={isSelected}
                          onChange={() => handlePlatformChange(platform.id)}
                          className="h-5 w-5 shrink-0 accent-purple-500"
                        />
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${platform.bg}`}>
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-semibold">{platform.name}</div>
                          <div className="text-xs text-gray-500">Video call</div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">Additional Notes (Optional)</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Any specific requirements or questions..."
                  rows={3}
                  className="w-full resize-none rounded-xl border-2 border-gray-300 px-4 py-3 text-base transition focus:border-purple-500 focus:outline-none sm:text-sm"
                />
              </div>
            </div>
          </div>
        </form>

        <div
          className="shrink-0 border-t border-gray-100 bg-white px-4 pt-3 sm:px-6"
          style={{ paddingBottom: "max(14px, env(safe-area-inset-bottom))" }}
        >
          <button
            type="submit"
            form="video-consultation-form"
            disabled={createConsultationMutation.isPending}
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 px-4 py-3.5 text-base font-bold text-white transition hover:shadow-lg active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {createConsultationMutation.isPending ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                Confirm Booking
                <ChevronRight className="h-5 w-5" />
              </>
            )}
          </button>
        </div>
      </section>
    </div>
  );
};

export default VideoConsultationModal;
