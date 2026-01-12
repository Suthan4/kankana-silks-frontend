"use client";

import { usePathname, useRouter } from "next/navigation";
import { User, Package, Heart, MapPin, LogOut, Video, Home } from "lucide-react";

const menuItems = [
  { label: "Profile", href: "/my-account/profile", icon: User },
  { label: "My Orders", href: "/my-account/orders", icon: Package },
  { label: "Addresses", href: "/my-account/addresses", icon: MapPin },
  {
    label: "Video Shopping",
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
        <div className="container mx-auto px-4 py-8">
          <div className="flex gap-6">
            {/* Sidebar */}
            <aside className="w-64 flex-shrink-0">
              <div className="bg-white rounded-2xl border border-gray-200 sticky top-8 overflow-hidden shadow-sm">
                {/* Profile Header */}
                <div className="p-6 border-b border-gray-200 bg-gradient-to-br from-gray-50 to-white">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-gray-900 to-gray-700 rounded-full flex items-center justify-center text-white text-3xl mb-3 ring-4 ring-gray-100">
                      👩
                    </div>
                    <h3 className="font-bold text-gray-900 text-lg">
                      Aisha Kapoor
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      Member since 2023
                    </p>
                  </div>
                </div>

                {/* Menu Items */}
                <nav className="p-3">
                  {/* Home Button */}
                  <button
                    onClick={() => router.push("/")}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all mb-2 text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-b border-gray-100"
                  >
                    <Home className="w-5 h-5" />
                    <span className="font-medium text-sm">Back to Home</span>
                  </button>

                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive =
                      pathname === item.href ||
                      pathname.startsWith(item.href + "/");
                    return (
                      <button
                        key={item.href}
                        onClick={() => router.push(item.href)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all mb-1 relative ${
                          isActive
                            ? "bg-gray-50 text-gray-900"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        }`}
                      >
                        {/* Top border for active */}
                        {isActive && (
                          <div className="absolute top-0 left-3 right-3 h-0.5 bg-black rounded-full" />
                        )}
                        <Icon className="w-5 h-5" />
                        <span className="font-medium text-sm">
                          {item.label}
                        </span>
                      </button>
                    );
                  })}
                </nav>

                {/* Sign Out */}
                <div className="p-3 border-t border-gray-200">
                  <button className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-all">
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium text-sm">Sign Out</span>
                  </button>
                </div>
              </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-w-0">{children}</main>
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden">
        <main className="pb-20">{children}</main>

        {/* Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 shadow-lg">
          <div className="grid grid-cols-5 h-16">
            {/* Home Button */}
            <button
              onClick={() => router.push("/")}
              className="flex flex-col items-center justify-center gap-1 transition-all text-gray-900 hover:text-black"
            >
              <Home className="w-5 h-5" />
              <span className="text-xs font-medium">Home</span>
            </button>

            {menuItems.slice(0, 4).map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <button
                  key={item.href}
                  onClick={() => router.push(item.href)}
                  className={`flex flex-col items-center justify-center gap-1 transition-all relative ${
                    isActive ? "text-black" : "text-gray-900"
                  }`}
                >
                  {/* Top border for active */}
                  {isActive && (
                    <div className="absolute top-0 left-4 right-4 h-0.5 bg-black rounded-full" />
                  )}
                  <Icon className={`w-5 h-5 ${isActive ? "scale-110" : ""}`} />
                  <span className="text-xs font-medium">
                    {item.label.split(" ")[0]}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
