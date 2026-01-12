"use client";

import {
  User,
  MapPin,
  Heart,
  Package,
  Video,
  ChevronRight,
  Settings,
  LogOut,
  Bell,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();

  const quickActions = [
    {
      id: "orders",
      icon: Package,
      label: "My Orders",
      count: "3",
      href: "/my-account/orders",
      gradient: "from-blue-500 to-blue-600",
      bgGradient: "from-blue-50 to-blue-100",
    },
    {
      id: "video",
      icon: Video,
      label: "Video Shop",
      count: "1",
      href: "/my-account/video-appointment",
      gradient: "from-purple-500 to-purple-600",
      bgGradient: "from-purple-50 to-purple-100",
    },
    {
      id: "addresses",
      icon: MapPin,
      label: "Addresses",
      count: "2",
      href: "/my-account/addresses",
      gradient: "from-green-500 to-green-600",
      bgGradient: "from-green-50 to-green-100",
    },
    {
      id: "wishlist",
      icon: Heart,
      label: "Wishlist",
      count: "8",
      href: "/my-account/wishlist",
      gradient: "from-red-500 to-red-600",
      bgGradient: "from-red-50 to-red-100",
    },
  ];

  const settings = [
    {
      icon: User,
      label: "Personal Details",
      sub: "Name, Email, Phone",
      href: "/my-account/profile/edit",
    },
    {
      icon: Bell,
      label: "Notifications",
      sub: "Manage preferences",
      href: "/my-account/notifications",
    },
    {
      icon: Settings,
      label: "Settings",
      sub: "Privacy & Security",
      href: "/my-account/settings",
    },
  ];

  return (
    <div className="space-y-4 lg:space-y-6 p-4 lg:p-0">
      {/* Mobile Profile Header */}
      <div className="lg:hidden bg-gradient-to-br from-gray-900 to-gray-700 text-white rounded-2xl p-6 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-3xl ring-4 ring-white/30">
            👩
          </div>
          <div className="flex-1">
            <h2 className="font-bold text-xl">Aisha Kapoor</h2>
            <p className="text-sm opacity-90">aisha@example.com</p>
            <p className="text-sm opacity-90">+91 98765 43210</p>
          </div>
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden lg:block">
        <h1 className="text-3xl font-bold mb-2">My Account</h1>
        <p className="text-gray-600">Manage your profile and preferences</p>
      </div>

      {/* Quick Actions - Enhanced Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              onClick={() => router.push(action.href)}
              className={`relative p-5 lg:p-6 bg-gradient-to-br ${action.bgGradient} rounded-2xl border-2 border-gray-100 hover:shadow-xl transition-all hover:scale-105 text-left group overflow-hidden`}
            >
              <div
                className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${action.gradient} opacity-10 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform`}
              ></div>

              <div
                className={`w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-br ${action.gradient} rounded-xl flex items-center justify-center mb-3 shadow-lg`}
              >
                <Icon className="w-6 h-6 lg:w-7 lg:h-7 text-white" />
              </div>

              <div className="font-bold text-sm lg:text-base mb-1">
                {action.label}
              </div>
              <div className="text-xs text-gray-600">{action.count} items</div>

              {action.count && (
                <div
                  className={`absolute top-3 right-3 w-6 h-6 bg-gradient-to-br ${action.gradient} text-white rounded-full text-xs flex items-center justify-center font-bold shadow-lg`}
                >
                  {action.count}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Account Settings */}
      <div className="bg-white rounded-2xl border-2 border-gray-100 overflow-hidden shadow-sm">
        <div className="p-5 lg:p-6 border-b bg-gradient-to-r from-gray-50 to-white">
          <h3 className="font-bold text-lg">Account Settings</h3>
          <p className="text-sm text-gray-500">Manage your account details</p>
        </div>

        <div className="divide-y">
          {settings.map((item, i) => {
            const Icon = item.icon;
            return (
              <button
                key={i}
                onClick={() => item.href && router.push(item.href)}
                className="w-full flex items-center gap-4 p-5 lg:p-6 hover:bg-gray-50 transition-all group"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <Icon className="w-6 h-6 text-gray-700" />
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className="font-semibold text-sm lg:text-base">
                    {item.label}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {item.sub}
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 group-hover:translate-x-1 transition-transform" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Sign Out - Mobile Only */}
      <div className="lg:hidden">
        <button className="w-full flex items-center justify-center gap-3 p-5 bg-white border-2 border-red-200 text-red-600 rounded-2xl font-semibold hover:bg-red-50 transition-all">
          <LogOut className="w-5 h-5" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}
