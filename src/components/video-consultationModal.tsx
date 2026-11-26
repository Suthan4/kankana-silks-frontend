"use client";

import { ModalScrollLock } from "@/components/ui/ModalScrollLock";
import { Portal } from "@/components/ui/Portal";
import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  X,
  User,
  Mail,
  Phone,
  MessageSquare,
  Video,
  ArrowRight,
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

// Single border on focus: outline + ring are fully disabled, only border-color changes.
const inputClass =
  "w-full rounded-lg border border-gray-300 bg-white py-3 pl-10 pr-3 text-base text-black " +
  "placeholder:text-gray-400 shadow-none transition-colors " +
  "outline-none focus:outline-none focus-visible:outline-none " +
  "ring-0 focus:ring-0 focus-visible:ring-0 " +
  "focus:border-brand-primary sm:text-sm";

const iconClass =
  "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400";

const labelClass = "mb-1.5 block text-sm font-medium text-black";

const initialForm = {
  fullName: "",
  email: "",
  phone: "",
  platform: ConsultationPlatform.WHATSAPP,
  preferredDate: "",
  preferredTime: "",
  notes: "",
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

  const [formData, setFormData] = useState(initialForm);

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

  const createConsultationMutation = useMutation({
    mutationFn: (data: CreateConsultationRequest) =>
      consultationApi.createConsultation(data),
    onSuccess: () => {
      toast.success("Consultation request submitted successfully!");
      onClose();
      onSuccess?.();
      setFormData(initialForm);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to submit request");
    },
  });


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

    if (!formData.preferredDate || !formData.preferredTime) {
      toast.error("Please select date and time for consultation");
      return;
    }

    const dateTime = new Date(
      `${formData.preferredDate}T${formData.preferredTime}:00`,
    );
    const isoDateTime = dateTime.toISOString();

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

  const today = new Date().toISOString().split("T")[0];

  const steps = [
    { title: "Book an appointment", desc: "Choose your preferred time" },
    { title: "Connect via video", desc: "Join on WhatsApp, Zoom or Meet" },
    { title: "Shop with guidance", desc: "Browse with an expert stylist" },
  ];

  const platforms = [
    {
      id: ConsultationPlatform.WHATSAPP,
      name: "WhatsApp",
      icon: MessageSquare,
    },
    { id: ConsultationPlatform.ZOOM, name: "Zoom", icon: Video },
    { id: ConsultationPlatform.GOOGLE_MEET, name: "Google Meet", icon: Video },
  ];

  return (
    <Portal>
      <AnimatePresence>
        {isOpen && (
      <motion.div
        key="video-consultation-modal"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
        className="ios-modal-viewport fixed inset-0 z-[1000] flex items-end justify-center overflow-hidden bg-black/50 md:items-center md:p-4"
        onPointerDown={(event) => {
          if (event.target === event.currentTarget) onClose();
        }}
        role="presentation"
      >
      <ModalScrollLock />
      <AnimatePresence propagate>
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 16 }}
        transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="video-consultation-title"
        className="ios-modal-panel flex w-full max-w-3xl flex-col overflow-hidden rounded-t-2xl bg-surface-elevated text-text-main shadow-brand-float md:rounded-2xl"
        style={{
          height: "min(92dvh, 820px)",
          maxHeight: "calc(100dvh - env(safe-area-inset-top) - 8px)",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        {/* Header */}
        <header className="relative flex shrink-0 items-start justify-between border-b border-gray-200 px-5 pb-4 pt-5 sm:px-6">
          <div className="absolute left-1/2 top-2 h-1 w-9 -translate-x-1/2 rounded-full bg-gray-300 md:hidden" />
          <div className="min-w-0 pr-3 pt-1 md:pt-0">
            <h2
              id="video-consultation-title"
              className="text-lg font-semibold leading-tight sm:text-xl"
            >
              Book Video Consultation
            </h2>
            <p className="mt-0.5 text-sm text-gray-500">
              {productName
                ? `For ${productName}`
                : "Connect with our expert stylists"}
            </p>
          </div>
          <button
            type="button"
            aria-label="Close video consultation"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-gray-600 outline-none transition hover:bg-gray-100 hover:text-black focus-visible:outline-none"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        {/* Form */}
        <form
          id="video-consultation-form"
          onSubmit={handleSubmit}
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-6 sm:py-6"
        >
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-10">
            {/* Info column */}
            <div className="space-y-5">
              <div>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
                  How it works
                </h3>
                <ol className="space-y-4">
                  {steps.map((step, i) => (
                    <li key={step.title} className="flex items-start gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-black text-xs font-medium">
                        {i + 1}
                      </span>
                      <div className="min-w-0">
                        <div className="text-sm font-medium">{step.title}</div>
                        <div className="text-xs text-gray-500">{step.desc}</div>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
                Free consultation for all customers.
              </div>
            </div>

            {/* Fields column */}
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Full name</label>
                <div className="relative">
                  <User className={iconClass} />
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="Enter your name"
                    required
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Email address</label>
                <div className="relative">
                  <Mail className={iconClass} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="your@email.com"
                    required
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Phone number</label>
                <div className="flex gap-2">
                  <select
                    className="w-20 shrink-0 rounded-lg border border-gray-300 bg-white px-2 py-3 text-base outline-none ring-0 focus:border-brand-primary focus:outline-none focus:ring-0 focus-visible:outline-none sm:text-sm"
                    defaultValue="+91"
                  >
                    <option>+91</option>
                  </select>
                  <div className="relative min-w-0 flex-1">
                    <Phone className={iconClass} />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="98765 43210"
                      required
                      pattern="[0-9]{10}"
                      inputMode="numeric"
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Date</label>
                  <div className="relative">
                    <Calendar className={iconClass} />
                    <input
                      type="date"
                      name="preferredDate"
                      value={formData.preferredDate}
                      onChange={handleInputChange}
                      min={today}
                      required
                      className={inputClass}
                    />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Time</label>
                  <div className="relative">
                    <Clock className={iconClass} />
                    <input
                      type="time"
                      name="preferredTime"
                      value={formData.preferredTime}
                      onChange={handleInputChange}
                      required
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className={labelClass}>Preferred platform</label>
                <div className="grid grid-cols-3 gap-2">
                  {platforms.map((platform) => {
                    const Icon = platform.icon;
                    const isSelected = formData.platform === platform.id;
                    return (
                      <label
                        key={platform.id}
                        className={`flex cursor-pointer flex-col items-center gap-1.5 rounded-lg border px-2 py-3 text-center transition ${
                          isSelected
                            ? "border-black bg-black text-white"
                            : "border-gray-300 bg-white text-black hover:border-gray-500"
                        }`}
                      >
                        <input
                          type="radio"
                          name="platform"
                          checked={isSelected}
                          onChange={() => handlePlatformChange(platform.id)}
                          className="sr-only"
                        />
                        <Icon className="h-5 w-5" />
                        <span className="text-xs font-medium">
                          {platform.name}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className={labelClass}>
                  Additional notes{" "}
                  <span className="font-normal text-gray-400">(optional)</span>
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Any specific requirements or questions..."
                  rows={3}
                  className="brand-input w-full resize-none px-3 py-3 text-base sm:text-sm"
                />
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div
          className="shrink-0 border-t border-gray-200 bg-white px-5 pt-3 sm:px-6"
          style={{ paddingBottom: "max(14px, env(safe-area-inset-bottom))" }}
        >
          <button
            type="submit"
            form="video-consultation-form"
            disabled={createConsultationMutation.isPending}
            className="brand-button min-h-12 w-full rounded-lg px-4 py-3 text-base disabled:cursor-not-allowed"
          >
            {createConsultationMutation.isPending ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                Confirm booking
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </motion.section>
      </AnimatePresence>
      </motion.div>
        )}
      </AnimatePresence>
    </Portal>
  );
};

export default VideoConsultationModal;
