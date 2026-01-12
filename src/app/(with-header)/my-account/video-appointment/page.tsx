"use client";

import { useState } from "react";
import {
  Video,
  Calendar,
  Clock,
  Plus,
  X,
  Phone,
  Mail,
  User,
  MessageSquare,
  Star,
  ChevronRight,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function VideoAppointmentPage() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("upcoming");

  const appointments = [
    {
      id: "VID-001",
      date: "Oct 24, 2024",
      time: "2:00 PM",
      consultant: "Priya S.",
      role: "Senior Style Consultant",
      image:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
      status: "upcoming",
      platform: "WhatsApp Video",
    },
    {
      id: "VID-002",
      date: "Nov 02, 2024",
      time: "10:00 AM",
      consultant: "Ravi K.",
      role: "Style Consultant",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
      status: "scheduled",
      platform: "WhatsApp Video",
    },
  ];

  const pastAppointments = [
    {
      id: "VID-003",
      date: "Sep 15, 2024",
      consultant: "Ananya R.",
      rating: 5,
      status: "completed",
    },
  ];

  const displayAppointments =
    activeTab === "upcoming" ? appointments : pastAppointments;

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
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl flex items-center justify-center hover:shadow-xl transition-all hover:scale-110 shadow-lg"
            >
              <Plus className="w-6 h-6" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2">
            {["upcoming", "completed"].map((tab) => (
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

      {/* Appointments List */}
      <div className="p-4 lg:p-6 space-y-4 max-w-4xl mx-auto">
        {activeTab === "upcoming" &&
          appointments.map((apt) => (
            <div
              key={apt.id}
              className="bg-white rounded-2xl border-2 border-gray-100 overflow-hidden hover:shadow-xl transition-all cursor-pointer"
              onClick={() =>
                router.push(`/my-account/video-appointment/${apt.id}`)
              }
            >
              <div className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white p-5 lg:p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-sm font-semibold opacity-90">
                    <Calendar className="w-4 h-4" />
                    <span>UPCOMING SESSION</span>
                  </div>
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg"></div>
                </div>

                <div className="flex items-center gap-3 mb-3">
                  <Clock className="w-6 h-6" />
                  <div>
                    <div className="text-xl lg:text-2xl font-bold">
                      {apt.date}
                    </div>
                    <div className="text-sm opacity-90">{apt.time}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg backdrop-blur-sm">
                  <MessageSquare className="w-4 h-4" />
                  <span className="text-sm font-medium">{apt.platform}</span>
                </div>
              </div>

              <div className="p-5 lg:p-6">
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src={apt.image}
                    alt={apt.consultant}
                    className="w-16 h-16 rounded-xl object-cover ring-4 ring-purple-100"
                  />
                  <div className="flex-1">
                    <div className="font-bold text-lg">{apt.consultant}</div>
                    <div className="text-sm text-gray-500">{apt.role}</div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button className="flex-1 bg-black text-white py-3 rounded-xl font-semibold hover:bg-gray-800 transition-all flex items-center justify-center gap-2">
                    <Video className="w-4 h-4" />
                    Join Now
                  </button>
                  <button className="px-4 py-3 border-2 border-gray-200 rounded-xl font-semibold hover:bg-gray-50 transition-all">
                    Details
                  </button>
                </div>
              </div>
            </div>
          ))}

        {activeTab === "completed" &&
          pastAppointments.map((apt) => (
            <div
              key={apt.id}
              className="bg-white rounded-2xl border-2 border-gray-100 p-5 lg:p-6"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-16 h-16 bg-gray-200 rounded-xl opacity-75"></div>
                <div className="flex-1">
                  <div className="font-bold text-lg">{apt.consultant}</div>
                  <div className="text-sm text-gray-500 mb-2">{apt.date}</div>
                  <div className="flex items-center gap-1">
                    {[...Array(apt.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button className="py-3 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition-all">
                  Book Again
                </button>
                <button className="py-3 border-2 border-gray-200 rounded-xl font-semibold hover:bg-gray-50 transition-all">
                  Invoice
                </button>
              </div>
            </div>
          ))}

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

      {/* Booking Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-gradient-to-r from-purple-500 to-indigo-600 text-white p-6 flex items-center justify-between rounded-t-3xl z-10">
              <div>
                <h2 className="text-2xl font-bold">Book Video Session</h2>
                <p className="text-sm opacity-90 mt-1">
                  Connect with our expert stylists
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-white/20 rounded-full transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 lg:p-8">
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
                            <div className="text-xs text-gray-600">
                              {step.desc}
                            </div>
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
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Enter your name"
                        className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        placeholder="your@email.com"
                        className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Phone Number
                    </label>
                    <div className="flex gap-2">
                      <select className="w-24 px-3 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none font-medium">
                        <option>+91</option>
                        <option>+1</option>
                        <option>+44</option>
                      </select>
                      <div className="relative flex-1">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="tel"
                          placeholder="98765 43210"
                          className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
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
                          color: "green",
                        },
                        {
                          id: "facetime",
                          name: "FaceTime",
                          icon: Video,
                          color: "gray",
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
                              className={`w-10 h-10 bg-${platform.color}-500 rounded-full flex items-center justify-center`}
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
                    onClick={() => setIsModalOpen(false)}
                    className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-4 rounded-xl font-bold hover:shadow-xl transition-all flex items-center justify-center gap-2 text-lg"
                  >
                    Confirm Booking
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
