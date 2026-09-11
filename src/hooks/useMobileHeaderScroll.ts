import { useEffect, useRef, useState } from "react";

export const useMobileHeaderScroll = () => {
  const [showSearchRow, setShowSearchRow] = useState(true);

  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    // Only run this behavior on mobile
    const mediaQuery = window.matchMedia("(max-width: 767px)");

    if (!mediaQuery.matches) return;

    lastScrollY.current = Math.max(window.scrollY, 0);

    const updateHeader = () => {
      const currentScrollY = Math.max(window.scrollY, 0);
      const previousScrollY = lastScrollY.current;

      // Always show when we're at/near the top
      if (currentScrollY <= 10) {
        setShowSearchRow(true);
        lastScrollY.current = currentScrollY;
        ticking.current = false;
        return;
      }

      const scrollDifference = currentScrollY - previousScrollY;

      // Ignore tiny movements to prevent flickering
      if (Math.abs(scrollDifference) < 4) {
        ticking.current = false;
        return;
      }

      if (scrollDifference > 0) {
        // Scrolling DOWN
        setShowSearchRow(false);
      } else {
        // Scrolling UP
        setShowSearchRow(true);
      }

      lastScrollY.current = currentScrollY;
      ticking.current = false;
    };

    const handleScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(updateHeader);
        ticking.current = true;
      }
    };

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return showSearchRow;
};
