import React, { useEffect } from "react";
import {
  X,
  User,
  Mail,
  Phone,
  MessageSquare,
  Video,
  ChevronRight,
} from "lucide-react";
import { useAuthModal } from "@/store/useAuthModalStore";

type VideoConsultationModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
};

const VideoConsultationModal: React.FC<VideoConsultationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  const { user } = useAuthModal();
  const openModal = useAuthModal((state) => state.openModal);

  // Close on ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-500 to-indigo-600 text-white p-6 flex items-center justify-between rounded-t-3xl z-10">
          <div>
            <h2 className="text-2xl font-bold">Book Video Session</h2>
            <p className="text-sm opacity-90 mt-1">
              Connect with our expert stylists
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
        <div className="p-6 lg:p-8 max-h-[80vh] overflow-y-auto">
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
                      desc: "Join on WhatsApp or FaceTime",
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
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Enter your name"
                    className="w-full pl-11 pr-4 py-3 border-none outline outline-gray-00 rounded-xl focus:outline-black"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    placeholder="your@email.com"
                    className="w-full pl-11 pr-4 py-3 border-none outline outline-gray-400 rounded-xl focus:outline-black"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Phone Number
                </label>
                <div className="flex gap-2">
                  <select className="w-24 px-3 py-3 border-none outline outline-gray-400 rounded-xl focus:outline-black font-medium">
                    <option>+91</option>
                  </select>

                  <div className="relative flex-1">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      placeholder="98765 43210"
                      className="w-full pl-11 pr-4 py-3 outline outline-gray-400 rounded-xl focus:border-black border-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-3">
                  Preferred Platform
                </label>

                <div className="space-y-2">
                  {[
                    {
                      id: "whatsapp",
                      name: "WhatsApp Video",
                      icon: MessageSquare,
                      bg: "bg-green-500",
                    },
                    {
                      id: "zoom/googlemeet",
                      name: "Zoom or Google meet",
                      icon: Video,
                      bg: "bg-gray-600",
                    },
                  ].map((platform) => {
                    const Icon = platform.icon;

                    return (
                      <label
                        key={platform.id}
                        className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition"
                      >
                        <input
                          type="radio"
                          name="platform"
                          className="w-5 h-5"
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

              <button
                onClick={() => {
                  if(!user){
                    openModal("login")
                    onClose();
                  }
                  onClose();
                }}
                // disabled={true}
                className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-4 rounded-xl font-bold hover:shadow-xl transition-all flex items-center justify-center gap-2 text-lg"
              >
                {!user?.email ? "Login to continue" : "Confirm Booking"}

                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoConsultationModal;
