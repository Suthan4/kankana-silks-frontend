"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useCartDrawer } from "@/store/useCartDrawer";

// The cart drawer (and its animation/mutation code) isn't needed to paint the
// page, so it's split out of the initial JavaScript and mounted once the
// browser is idle - or immediately if someone opens the cart first.
const MiniCartDrawer = dynamic(() => import("./miniCartDrawer"), {
  ssr: false,
});

export default function MiniCartDrawerProvider() {
  const isOpen = useCartDrawer((state) => state.isOpen);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(() => setReady(true), {
        timeout: 4000,
      });
      return () => window.cancelIdleCallback(id);
    }
    const timer = setTimeout(() => setReady(true), 2500);
    return () => clearTimeout(timer);
  }, []);

  return ready || isOpen ? <MiniCartDrawer /> : null;
}
