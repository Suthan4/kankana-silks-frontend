"use client";

import { usePathname, useRouter } from "next/navigation";
import { User, Package, Heart, MapPin, LogOut, Video } from "lucide-react";
import { motion } from "motion/react";

const menuItems = [
  { label: "Profile", href: "/my-account/profile", icon: User },
  { label: "My Orders", href: "/my-account/orders", icon: Package },
  { label: "Addresses", href: "/my-account/addresses", icon: MapPin },
  {
    label: "Video Appointments",
    href: "/my-account/video-appointment",
    icon: Video,
  },
  { label: "Wishlist", href: "/my-account/wishlist", icon: Heart },
];

export default function MyAccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Layout */}
      <div className="hidden lg:block">
        <div className="container mx-auto px-6 py-8">
          {/* Breadcrumb */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-sm text-gray-600 mb-6"
          >
            <span className="hover:text-gray-900 cursor-pointer">Home</span>
            <span>›</span>
            <span className="hover:text-gray-900 cursor-pointer">Account</span>
            <span>›</span>
            <span className="text-gray-900">{pathname}</span>
          </motion.div>

          <div className="grid grid-cols-4 gap-6">
            {/* Sidebar */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="col-span-1"
            >
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                {/* Profile Header */}
                <div className="p-6 border-b">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      {/* <User className="w-6 h-6 text-gray-600" /> */}
                      👩
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Aisha Kapoor
                      </h3>
                      <p className="text-xs text-gray-500">Member since 2023</p>
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <ul>
                  {menuItems.map((item, index) => {
                    const Icon = item.icon;
                    const isActive =
                      pathname === item.href ||
                      pathname.startsWith(item.href + "/");
                    return (
                      <motion.li
                        key={item.href}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => router.push(item.href)}
                        className={`relative cursor-pointer px-6 py-3 flex items-center gap-3 transition-colors ${
                          isActive
                            ? "bg-yellow-50 text-yellow-700"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{item.label}</span>
                        {isActive && (
                          <motion.div
                            layoutId="activeMenuItem"
                            className="absolute left-0 top-0 bottom-0 w-1 bg-yellow-400"
                            transition={{
                              type: "spring",
                              stiffness: 380,
                              damping: 30,
                            }}
                          />
                        )}
                      </motion.li>
                    );
                  })}
                </ul>
              </div>
            </motion.div>

            {/* Desktop Layout */}
            {/* ✅ MAIN CONTENT SLOT */}
            <main className="col-span-3">{children}</main>
          </div>
        </div>
      </div>
      {/* ================= MOBILE ================= */}
      {/* Mobile Layout */}
      <div className="lg:hidden">{children}</div>
    </div>
  );
}
