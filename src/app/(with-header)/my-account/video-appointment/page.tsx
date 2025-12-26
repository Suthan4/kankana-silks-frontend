"use client";
import React, { useState } from "react";
import {
  Calendar,
  Clock,
  Video,
  MessageSquare,
  Star,
  ChevronLeft,
  Plus,
  X,
  Check,
  Mail,
  Phone,
  User,
} from "lucide-react";

const AppointmentsDashboard = () => {
  const [activeTab, setActiveTab] = useState("upcoming");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState("whatsapp");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    countryCode: "+91",
  });

  const appointments = {
    upcoming: [
      {
        id: 1,
        date: "Oct 24, 2:00 PM",
        name: "Priya S.",
        role: "Senior Retail Consultant",
        message:
          '"Client is interested in Kathiyawadi silk options for a winter wedding. Popular..."',
        type: "next",
        status: "confirmed",
      },
    ],
    later: [
      {
        id: 2,
        date: "Nov 02, 10:00 AM",
        name: "Ravi K.",
        type: "Whatsapp Video • Saree Selection",
        status: "scheduled",
      },
    ],
    past: [
      {
        id: 3,
        date: "Sep 15",
        name: "Ananya R.",
        status: "completed",
        rating: 5,
      },
    ],
  };

  const handleSubmit = () => {
    console.log("Form submitted:", formData, "Platform:", selectedPlatform);
    alert("Appointment confirmed! We will contact you shortly.");
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 animate-fade-in">
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-white rounded-full transition-all duration-200 hover:shadow-md">
              <ChevronLeft className="w-6 h-6 text-gray-700" />
            </button>
            <h1 className="text-3xl font-bold text-gray-900">
              My Appointments
            </h1>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-primary-dark text-white p-3 rounded-full hover:shadow-lg transition-all duration-300 hover:scale-110"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 bg-white p-2 rounded-2xl shadow-sm w-fit">
          {["upcoming", "completed"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-8 py-3 rounded-xl font-medium transition-all duration-300 ${
                activeTab === tab
                  ? "bg-primary-dark text-white shadow-md"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Next Session Card */}
          {activeTab === "upcoming" && (
            <div className="bg-white rounded-3xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 animate-slide-up border border-orange-100">
              <div className="flex items-center gap-2 text-primary-dark text-sm font-semibold mb-4">
                <Calendar className="w-4 h-4" />
                NEXT SESSION
              </div>

              <div className="flex items-center gap-2 text-amber-600 mb-4">
                <Clock className="w-5 h-5" />
                <span className="font-semibold">Oct 24, 2:00 PM</span>
                <span className="ml-auto w-3 h-3 bg-green-400 rounded-full animate-pulse"></span>
              </div>

              <div className="flex items-start gap-4 mb-4">
                <img
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop"
                  alt="Priya S."
                  className="w-16 h-16 rounded-2xl object-cover ring-2 ring-orange-200"
                />
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-gray-900">Priya S.</h3>
                  <p className="text-sm text-gray-500">
                    Senior Retail Consultant
                  </p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-4 mb-4 border border-orange-100">
                <div className="flex items-start gap-2">
                  <MessageSquare className="w-4 h-4 text-orange-500 mt-1 flex-shrink-0" />
                  <p className="text-sm text-gray-700 italic">
                    "Client is interested in Kathiyawadi silk options for a
                    winter wedding. Popular..."
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button className="flex-1 bg-primary to-orange-400 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105">
                  Join Session
                </button>
                <button className="px-6 py-3 border-2 border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-all duration-300">
                  Reschedule
                </button>
              </div>
            </div>
          )}

          {/* Later Sessions */}
          {activeTab === "upcoming" && (
            <div className="bg-white rounded-3xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 animate-slide-up-delay-1">
              <div className="flex items-center gap-2 text-gray-500 text-sm font-semibold mb-6">
                LATER
              </div>

              <div className="flex items-start gap-4 mb-4">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop"
                  alt="Ravi K."
                  className="w-16 h-16 rounded-2xl object-cover ring-2 ring-gray-200"
                />
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-gray-900">Ravi K.</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                    <Clock className="w-4 h-4" />
                    <span>Nov 02, 10:00 AM</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600 mb-4 bg-green-50 p-3 rounded-xl">
                <Video className="w-4 h-4 text-green-600" />
                <span>Whatsapp Video • Saree Selection</span>
              </div>

              <div className="flex gap-3">
                <button className="px-6 py-3 border-2 border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-all duration-300">
                  Cancel
                </button>
                <button className="flex-1 bg-primary text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300">
                  View Details
                </button>
              </div>
            </div>
          )}

          {/* Past Appointments */}
          {activeTab === "completed" && (
            <div className="bg-white rounded-3xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 animate-slide-up">
              <div className="flex items-center gap-2 text-gray-500 text-sm font-semibold mb-6">
                PAST
              </div>

              <div className="flex items-start gap-4 mb-4">
                <img
                  src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop"
                  alt="Ananya R."
                  className="w-16 h-16 rounded-2xl object-cover ring-2 ring-gray-200 opacity-75"
                />
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-gray-900">Ananya R.</h3>
                  <p className="text-sm text-gray-500">Already Consulted</p>
                  <div className="flex items-center gap-1 mt-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 fill-amber-400 text-amber-400"
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button className="flex-1 bg-gray-900 text-white py-3 rounded-xl font-semibold hover:bg-gray-800 transition-all duration-300">
                  Book Again
                </button>
                <button className="px-6 py-3 border-2 border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-all duration-300">
                  Invoice
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-3xl z-10">
              <h2 className="text-2xl font-bold text-gray-900">
                Book Video Shopping
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-all duration-200"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            <div className="p-6 lg:p-8">
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Left Section - Hero */}
                <div className="space-y-6">
                  <div className="relative rounded-2xl overflow-hidden shadow-xl group">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/70 z-10"></div>
                    <img
                      src="https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=800&q=80"
                      alt="Luxury silk saree"
                      className="w-full h-64 lg:h-80 object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute bottom-0 left-0 right-0 p-6 z-20 text-white">
                      <h3 className="text-2xl lg:text-3xl font-serif mb-2">
                        Experience Luxury Remotely
                      </h3>
                      <p className="text-sm opacity-90">
                        Our experts will walk you through our latest Kanjivaram
                        and Banarasi collections from the comfort of your home.
                      </p>
                    </div>
                  </div>

                  {/* How it Works */}
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-100">
                    <h3 className="text-xl font-serif text-amber-600 mb-4">
                      How it works
                    </h3>
                    <div className="space-y-4">
                      {[
                        {
                          num: 1,
                          title: "Book an Appointment",
                          desc: "Choose a time and platform that works for you.",
                        },
                        {
                          num: 2,
                          title: "Connect with a Stylist",
                          desc: "Join the video call on your preferred app.",
                        },
                        {
                          num: 3,
                          title: "Shop with Ease",
                          desc: "Select your favorites and we'll ship them globally.",
                        },
                      ].map((step) => (
                        <div key={step.num} className="flex gap-3">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-400 text-white flex items-center justify-center font-semibold">
                            {step.num}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-800 mb-1">
                              {step.title}
                            </h4>
                            <p className="text-sm text-gray-600">{step.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Section - Form */}
                <div className="space-y-5">
                  <div className="inline-block bg-gradient-to-r from-amber-400 to-amber-500 text-white px-4 py-1 rounded-full text-sm">
                    ✨ New to us?
                  </div>

                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="e.g. Anjali Sharma"
                        value={formData.fullName}
                        onChange={(e) =>
                          setFormData({ ...formData, fullName: e.target.value })
                        }
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none transition"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        placeholder="name@example.com"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none transition"
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={formData.countryCode}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            countryCode: e.target.value,
                          })
                        }
                        className="w-24 px-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-400 outline-none"
                      >
                        <option>+91</option>
                        <option>+1</option>
                        <option>+44</option>
                      </select>
                      <div className="relative flex-1">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="tel"
                          placeholder="98765 43210"
                          value={formData.phone}
                          onChange={(e) =>
                            setFormData({ ...formData, phone: e.target.value })
                          }
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none transition"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Platform Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Preferred Platform
                    </label>
                    <div className="space-y-3">
                      <div
                        onClick={() => setSelectedPlatform("whatsapp")}
                        className={`relative flex items-center justify-between p-4 border-2 rounded-xl cursor-pointer transition ${
                          selectedPlatform === "whatsapp"
                            ? "border-green-500 bg-green-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                            <MessageSquare className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-800">
                              WhatsApp Video
                            </div>
                            <div className="text-sm text-gray-500">
                              Best for video viewing
                            </div>
                          </div>
                        </div>
                        {selectedPlatform === "whatsapp" && (
                          <div className="w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>

                      <div
                        onClick={() => setSelectedPlatform("facetime")}
                        className={`relative flex items-center justify-between p-4 border-2 rounded-xl cursor-pointer transition ${
                          selectedPlatform === "facetime"
                            ? "border-gray-800 bg-gray-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center">
                            <Video className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-800">
                              FaceTime
                            </div>
                            <div className="text-sm text-gray-500">
                              Chat in quality video
                            </div>
                          </div>
                        </div>
                        {selectedPlatform === "facetime" && (
                          <div className="w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    onClick={handleSubmit}
                    className="w-full bg-gradient-to-r from-amber-400 to-orange-400 text-white font-semibold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 hover:scale-105"
                  >
                    Confirm Appointment
                    <span>→</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AppointmentsDashboard;
