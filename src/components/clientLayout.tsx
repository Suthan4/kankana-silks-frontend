"use client";

import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import SplashScreen from "./splashScreen";
import Header from "./header";
import { usePathname } from "next/navigation";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [showSplash, setShowSplash] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 1200); // timing matters

    return () => clearTimeout(timer);
  }, []);
  // ❗ define where header should be hidden
  const hideHeaderRoutes = ["/login", "/checkout", "/cart", "/wishlist"];
  const hideHeader = hideHeaderRoutes.includes(pathname);

  return (
    <>
      {/* ✅ HEADER ALWAYS MOUNTED */}
      <div className={hideHeader ? "invisible absolute" : "visible"}>
        <Header />
      </div>

      {/* ✅ SPLASH OVERLAY */}
      <AnimatePresence>{showSplash && <SplashScreen />}</AnimatePresence>

      {/* CONTENT */}
      {children}
    </>
  );
}
