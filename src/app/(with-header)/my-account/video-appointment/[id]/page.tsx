"use client";

import {
  ArrowLeft,
  Video,
  Calendar,
  Clock,
  Phone,
  Mail,
  MessageSquare,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function VideoAppointmentDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();

  const appointment = {
    id: params.id,
    date: "Nov 02, 2024",
    time: "10:00 AM - 10:30 AM",
    platform: "WhatsApp Video",
    status: "confirmed",
    consultant: {
      name: "Ravi Kumar",
      role: "Senior Style Consultant",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300",
      phone: "+91 98765 43210",
      email: "ravi.kumar@kankanasilks.com",
    },
    details: {
      purpose: "Saree Selection",
      category: "Wedding Collection",
      preferences: "Red and gold tones, Traditional designs",
      notes: "Looking for wedding collection in red and gold tones.",
    },
  };

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
                Appointment Details
              </h1>
              <p className="text-sm text-gray-500">{appointment.id}</p>
            </div>
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
              Confirmed
            </span>
          </div>
        </div>
      </div>

      <div className="p-4 lg:p-6 max-w-4xl mx-auto space-y-4">
        {/* Main Card */}
        <div className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white rounded-2xl p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-sm opacity-90 mb-2">UPCOMING SESSION</p>
              <h2 className="text-2xl font-bold mb-2">{appointment.date}</h2>
              <p className="text-lg opacity-95">{appointment.time}</p>
            </div>
            <div className="bg-white/20 p-3 rounded-full">
              <Video className="w-6 h-6" />
            </div>
          </div>

          <div className="flex items-center gap-2 bg-white/20 px-4 py-3 rounded-lg">
            <MessageSquare className="w-5 h-5" />
            <span className="font-medium">{appointment.platform}</span>
          </div>
        </div>

        {/* Consultant */}
        <div className="bg-white rounded-2xl p-6">
          <h3 className="font-semibold mb-4">Your Consultant</h3>
          <div className="flex items-start gap-4 p-4 bg-gradient-to-br from-gray-50 to-purple-50 rounded-xl border">
            <img
              src={appointment.consultant.image}
              alt={appointment.consultant.name}
              className="w-16 h-16 rounded-full object-cover ring-4 ring-purple-200"
            />
            <div className="flex-1">
              <h4 className="font-bold text-lg">
                {appointment.consultant.name}
              </h4>
              <p className="text-sm text-gray-600 mb-3">
                {appointment.consultant.role}
              </p>
              <div className="flex flex-wrap gap-3 text-sm">
                <a
                  href={`tel:${appointment.consultant.phone}`}
                  className="flex items-center gap-1 text-gray-600 hover:text-black"
                >
                  <Phone className="w-4 h-4" />
                  <span className="hidden sm:inline">
                    {appointment.consultant.phone}
                  </span>
                  <span className="sm:hidden">Call</span>
                </a>
                <a
                  href={`mailto:${appointment.consultant.email}`}
                  className="flex items-center gap-1 text-gray-600 hover:text-black"
                >
                  <Mail className="w-4 h-4" />
                  <span className="hidden sm:inline">
                    {appointment.consultant.email}
                  </span>
                  <span className="sm:hidden">Email</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="bg-white rounded-2xl p-6">
          <h3 className="font-semibold mb-4">Session Details</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">
                Purpose
              </label>
              <p className="font-medium">{appointment.details.purpose}</p>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">
                Category
              </label>
              <p className="font-medium">{appointment.details.category}</p>
            </div>
          </div>

          <div className="mt-4">
            <label className="text-xs text-gray-500 mb-2 block">
              Your Preferences
            </label>
            <p className="text-sm text-gray-700 bg-gray-50 p-4 rounded-lg">
              {appointment.details.preferences}
            </p>
          </div>

          <div className="mt-4">
            <label className="text-xs text-gray-500 mb-2 block">Notes</label>
            <p className="text-sm text-gray-700 bg-amber-50 p-4 rounded-lg border border-amber-200">
              {appointment.details.notes}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button className="flex-1 bg-black text-white py-4 rounded-xl font-semibold hover:bg-gray-800 transition flex items-center justify-center gap-2">
            <Video className="w-5 h-5" />
            Join Session
          </button>
          <button className="sm:w-36 py-4 border-2 border-gray-300 rounded-xl font-semibold hover:bg-gray-50 transition">
            Reschedule
          </button>
          <button className="sm:w-36 py-4 border-2 border-red-300 text-red-600 rounded-xl font-semibold hover:bg-red-50 transition">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
