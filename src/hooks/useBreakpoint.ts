"use client";

import { useEffect, useRef, useState } from "react";

export function useBreakpoint() {
  const [isMobile, setIsMobile] = useState(false);
  const isMobileRef = useRef<boolean | null>(null);

  useEffect(() => {
    const check = () => {
      const mobile = window.innerWidth < 768; // md breakpoint

      // only update if value actually changed
      if (isMobileRef.current !== mobile) {
        isMobileRef.current = mobile;
        setIsMobile(mobile);
      }
    };

    check(); // initial check
    window.addEventListener("resize", check);

    return () => window.removeEventListener("resize", check);
  }, []);

  return { isMobile };
}
