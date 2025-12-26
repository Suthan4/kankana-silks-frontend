"use client";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Video,
  MessageSquare,
  Phone,
  Mail,
  MapPin,
  User,
} from "lucide-react";

interface VideoAppointmentDetailsProps {
  appointmentId?: string;
  onBack?: () => void;
}

export default function VideoAppointmentDetails({
  appointmentId,
  onBack,
}: VideoAppointmentDetailsProps) {
  const appointment = {
    id: appointmentId || "VID-2024-001",
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
    customer: {
      name: "Aisha Kapoor",
      email: "aisha.kapoor@example.com",
      phone: "+91 98765 43210",
    },
    details: {
      purpose: "Saree Selection",
      category: "Wedding Collection",
      preferences: "Red and gold tones, Traditional designs",
      notes:
        "Looking for wedding collection in red and gold tones. Interested in Kanchipuram and Banarasi varieties.",
      duration: "30 minutes",
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gradient-to-br from-green-50 via-white to-teal-50 p-4 md:p-8"
    >
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center justify-between mb-6"
        >
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Appointments</span>
          </button>
          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
            {appointment.status.charAt(0).toUpperCase() +
              appointment.status.slice(1)}
          </span>
        </motion.div>

        {/* Main Appointment Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl shadow-xl overflow-hidden mb-6"
        >
          {/* Header Section */}
          <div className="bg-gradient-to-r from-green-400 to-teal-400 p-6 md:p-8 text-white">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center"
                >
                  <Video className="w-6 h-6" />
                </motion.div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold">
                    Video Appointment
                  </h1>
                  <p className="text-sm opacity-90">{appointment.id}</p>
                </div>
              </div>
            </div>

            {/* Date & Time */}
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg">
                <Calendar className="w-5 h-5" />
                <span className="font-medium">{appointment.date}</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg">
                <Clock className="w-5 h-5" />
                <span className="font-medium">{appointment.time}</span>
              </div>
            </div>

            {/* Platform */}
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              <span className="font-medium">{appointment.platform}</span>
            </div>
          </div>

          {/* Body Section */}
          <div className="p-6 md:p-8 space-y-6">
            {/* Consultant Info */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Your Consultant
              </h2>
              <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-gray-50 to-green-50 rounded-2xl border border-green-100">
                <img
                  src={appointment.consultant.image}
                  alt={appointment.consultant.name}
                  className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover ring-4 ring-green-200 shadow-lg"
                />
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-lg">
                    {appointment.consultant.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    {appointment.consultant.role}
                  </p>
                  <div className="flex flex-wrap gap-3 text-sm">
                    <a
                      href={`tel:${appointment.consultant.phone}`}
                      className="flex items-center gap-1 text-gray-600 hover:text-green-600 transition"
                    >
                      <Phone className="w-4 h-4" />
                      <span>{appointment.consultant.phone}</span>
                    </a>
                    <a
                      href={`mailto:${appointment.consultant.email}`}
                      className="flex items-center gap-1 text-gray-600 hover:text-green-600 transition"
                    >
                      <Mail className="w-4 h-4" />
                      <span className="hidden md:inline">
                        {appointment.consultant.email}
                      </span>
                      <span className="md:hidden">Email</span>
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Appointment Details */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="grid md:grid-cols-2 gap-4"
            >
              <div>
                <label className="text-sm font-semibold text-gray-600 mb-2 block">
                  Purpose
                </label>
                <p className="text-gray-900 font-medium">
                  {appointment.details.purpose}
                </p>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-600 mb-2 block">
                  Category
                </label>
                <p className="text-gray-900 font-medium">
                  {appointment.details.category}
                </p>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-600 mb-2 block">
                  Duration
                </label>
                <p className="text-gray-900 font-medium">
                  {appointment.details.duration}
                </p>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-600 mb-2 block">
                  Platform
                </label>
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-green-600" />
                  <p className="text-gray-900 font-medium">
                    {appointment.platform}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Preferences */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.35 }}
            >
              <label className="text-sm font-semibold text-gray-600 mb-2 block">
                Your Preferences
              </label>
              <p className="text-gray-700 text-sm bg-gray-50 p-4 rounded-xl border border-gray-200">
                {appointment.details.preferences}
              </p>
            </motion.div>

            {/* Notes */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <label className="text-sm font-semibold text-gray-600 mb-2 block">
                Additional Notes
              </label>
              <p className="text-gray-700 text-sm bg-amber-50 p-4 rounded-xl border border-amber-200">
                {appointment.details.notes}
              </p>
            </motion.div>

            {/* Customer Info */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.45 }}
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Your Contact Details
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <User className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="text-xs text-gray-500">Name</p>
                    <p className="text-sm font-medium text-gray-900">
                      {appointment.customer.name}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <Phone className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="text-xs text-gray-500">Phone</p>
                    <p className="text-sm font-medium text-gray-900">
                      {appointment.customer.phone}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl md:col-span-2">
                  <Mail className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm font-medium text-gray-900">
                      {appointment.customer.email}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-3 pt-4"
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 bg-gradient-to-r from-green-500 to-teal-500 text-white py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition flex items-center justify-center gap-2"
              >
                <Video className="w-5 h-5" />
                Join Session Now
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="sm:w-40 py-4 border-2 border-gray-300 rounded-xl font-semibold hover:bg-gray-50 transition"
              >
                Reschedule
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="sm:w-40 py-4 border-2 border-red-300 text-red-600 rounded-xl font-semibold hover:bg-red-50 transition"
              >
                Cancel
              </motion.button>
            </motion.div>
          </div>
        </motion.div>

        {/* Info Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="bg-blue-50 rounded-2xl p-5 flex items-start gap-4 border border-blue-200"
        >
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            <Video className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="font-semibold text-blue-900 mb-2">
              Prepare for your session
            </p>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Ensure stable internet connection</li>
              <li>• Test your camera and microphone</li>
              <li>• Our consultant will call you on {appointment.platform}</li>
              <li>• Keep your preferences list ready to discuss</li>
            </ul>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
