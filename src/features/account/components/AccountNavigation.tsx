"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  User,
  Package,
  Heart,
  MapPin,
  LogOut,
  Video,
  Home,
  ClipboardList,
} from "lucide-react";
import { useAuthModal } from "@/store/useAuthModalStore";

const menuItems = [
  { label: "Profile", href: "/my-account/profile", icon: User },
  { label: "My Orders", href: "/my-account/orders", icon: Package },
  { label: "Product Requests", href: "/my-account/product-requests", icon: ClipboardList },
  { label: "Addresses", href: "/my-account/addresses", icon: MapPin },
  { label: "Video Shopping", href: "/my-account/video-appointment", icon: Video },
  { label: "Wishlist", href: "/my-account/wishlist", icon: Heart },
];

export function AccountNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, showPasswordModal } = useAuthModal();

  return (
    <>
      <aside className="hidden lg:block w-64 flex-shrink-0">
        <div className="bg-white rounded-2xl border border-gray-200 sticky top-8 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-gray-200 bg-gradient-to-br from-gray-50 to-white">
            <div className="flex flex-col items-center text-center">
              <h3 className="font-futura-bold text-gray-900 text-lg">{user?.firstName} {user?.lastName}</h3>
              <h3 className="text-sm opacity-80">{user?.email}</h3>
            </div>
          </div>
          <nav aria-label="Account" className="p-3">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <button key={item.href} type="button" onClick={() => router.push(item.href)} aria-current={isActive ? "page" : undefined}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all mb-1 relative ${isActive ? "bg-gray-50 text-gray-900" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}`}>
                  <Icon className="w-5 h-5" /><span className="font-medium text-sm">{item.label}</span>
                </button>
              );
            })}
          </nav>
          <div className="p-3 border-t border-gray-200">
            <button type="button" className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-all">
              <LogOut className="w-5 h-5" /><span className="font-medium text-sm">Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {!showPasswordModal && (
        <nav aria-label="Account quick links" className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 shadow-lg">
          <div className="grid grid-cols-7 h-16">
            <button type="button" onClick={() => router.push("/")} className="flex flex-col items-center justify-center gap-1 text-gray-900 hover:text-black">
              <Home className="w-5 h-5" /><span className="text-[10px] font-medium">Home</span>
            </button>
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <button key={item.href} type="button" onClick={() => router.push(item.href)} aria-current={isActive ? "page" : undefined}
                  className={`flex flex-col items-center justify-center gap-1 transition-all relative min-w-0 ${isActive ? "text-black" : "text-gray-700"}`}>
                  {isActive && <div className="absolute top-0 left-2 right-2 h-0.5 bg-black rounded-full" />}
                  <Icon className={`w-5 h-5 ${isActive ? "scale-110" : ""}`} />
                  <span className="text-[9px] font-medium truncate max-w-full px-0.5">{item.label === "Product Requests" ? "Requests" : item.label === "Video Shopping" ? "Video" : item.label === "My Orders" ? "Orders" : item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      )}
    </>
  );
}
