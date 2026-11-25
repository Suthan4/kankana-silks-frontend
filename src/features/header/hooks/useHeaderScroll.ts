"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

interface UseHeaderScrollOptions {
  setHoveredCategory: (categoryId: string | null) => void;
  setUserMenuOpen: (open: boolean) => void;
  setLocationModalOpen: (open: boolean) => void;
  setIsHeaderHovered: (hovered: boolean) => void;
}

export function useHeaderScroll({
  setHoveredCategory,
  setUserMenuOpen,
  setLocationModalOpen,
  setIsHeaderHovered,
}: UseHeaderScrollOptions) {
  const pathname = usePathname();
  const hasHeroBehindHeader = pathname === "/";
  const [isScrolled, setIsScrolled] = useState(!hasHeroBehindHeader);
  const [showNav, setShowNav] = useState(true);
  const [showMobileHeader, setShowMobileHeader] = useState(true);
  const navRef = useRef<HTMLElement>(null);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollRafRef = useRef<number | null>(null);
  const lastScrollYRef = useRef(0);
  const accumulatedScrollRef = useRef(0);
  const mobileScrollDeltaRef = useRef(0);
  // Header top row is 65px; desktop category nav is 42px when visible.
  // Derive the menu offset from these fixed dimensions instead of forcing
  // synchronous layout reads during hover/resize.
  const navBottom = 65 + (showNav ? 42 : 0);

  useEffect(() => {
    const getSafeScrollY = () => Math.max(0, window.scrollY);
    lastScrollYRef.current = getSafeScrollY();
    accumulatedScrollRef.current = 0;
    mobileScrollDeltaRef.current = 0;
    setShowMobileHeader(true);
    let mobileIdleTimeout: number | null = null;
    setIsScrolled(!hasHeroBehindHeader || lastScrollYRef.current > 40);
    setShowNav(lastScrollYRef.current < 80);

    const updateHeader = () => {
      const currentScrollY = getSafeScrollY();
      const delta = currentScrollY - lastScrollYRef.current;
      setIsScrolled(!hasHeroBehindHeader || currentScrollY > 40);

      // Hide on downward intent, reveal on upward intent or when scrolling settles.
      if (currentScrollY < 80) {
        mobileScrollDeltaRef.current = 0;
        setShowMobileHeader(true);
      } else if (delta !== 0 && window.innerWidth < 768) {
        mobileScrollDeltaRef.current += delta;
        if (mobileScrollDeltaRef.current >= 12) {
          setShowMobileHeader(false);
          mobileScrollDeltaRef.current = 0;
        } else if (mobileScrollDeltaRef.current <= -8) {
          setShowMobileHeader(true);
          mobileScrollDeltaRef.current = 0;
        }
      }

      if (delta !== 0) {
        setHoveredCategory(null);
        setUserMenuOpen(false);
        if (window.innerWidth >= 768) setLocationModalOpen(false);
        setIsHeaderHovered(false);
        if (hoverTimeoutRef.current) {
          clearTimeout(hoverTimeoutRef.current);
          hoverTimeoutRef.current = null;
        }
      }

      if (currentScrollY < 80) {
        accumulatedScrollRef.current = 0;
        setShowNav(true);
      } else if (delta !== 0) {
        const previousDirection = Math.sign(accumulatedScrollRef.current);
        const currentDirection = Math.sign(delta);
        if (previousDirection !== 0 && previousDirection !== currentDirection) {
          accumulatedScrollRef.current = 0;
        }
        accumulatedScrollRef.current += delta;
        if (accumulatedScrollRef.current >= 24) {
          setShowNav(false);
          accumulatedScrollRef.current = 0;
        } else if (accumulatedScrollRef.current <= -24) {
          setShowNav(true);
          accumulatedScrollRef.current = 0;
        }
      }

      lastScrollYRef.current = currentScrollY;
      scrollRafRef.current = null;
    };

    const handleScroll = () => {
      if (mobileIdleTimeout !== null) window.clearTimeout(mobileIdleTimeout);
      mobileIdleTimeout = window.setTimeout(() => {
        setShowMobileHeader(true);
        mobileScrollDeltaRef.current = 0;
        mobileIdleTimeout = null;
      }, 320);

      if (scrollRafRef.current !== null) return;
      scrollRafRef.current = window.requestAnimationFrame(updateHeader);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (mobileIdleTimeout !== null) window.clearTimeout(mobileIdleTimeout);
      if (scrollRafRef.current !== null) {
        window.cancelAnimationFrame(scrollRafRef.current);
        scrollRafRef.current = null;
      }
    };
  }, [
    hasHeroBehindHeader,
    setHoveredCategory,
    setUserMenuOpen,
    setLocationModalOpen,
    setIsHeaderHovered,
  ]);

  const clearHoverTimeout = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
  };

  const handleHeaderEnter = () => {
    clearHoverTimeout();
    setIsHeaderHovered(true);
  };

  const handleHeaderLeave = () => {
    clearHoverTimeout();
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHeaderHovered(false);
      setHoveredCategory(null);
      setUserMenuOpen(false);
      setLocationModalOpen(false);
    }, 100);
  };

  const handleCategoryHover = (categoryId: string) => {
    clearHoverTimeout();
    setHoveredCategory(categoryId);
  };

  return {
    pathname,
    hasHeroBehindHeader,
    isScrolled,
    showNav,
    showMobileHeader,
    navBottom,
    navRef,
    handleHeaderEnter,
    handleHeaderLeave,
    handleCategoryHover,
    clearHoverTimeout,
  };
}
