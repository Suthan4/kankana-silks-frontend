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
  const [navBottom, setNavBottom] = useState(140);
  const navRef = useRef<HTMLElement>(null);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollRafRef = useRef<number | null>(null);
  const lastScrollYRef = useRef(0);
  const accumulatedScrollRef = useRef(0);

  useEffect(() => {
    const getSafeScrollY = () => Math.max(0, window.scrollY);
    lastScrollYRef.current = getSafeScrollY();
    accumulatedScrollRef.current = 0;
    setIsScrolled(!hasHeroBehindHeader || lastScrollYRef.current > 40);
    setShowNav(lastScrollYRef.current < 80);

    const updateHeader = () => {
      const currentScrollY = getSafeScrollY();
      const delta = currentScrollY - lastScrollYRef.current;
      setIsScrolled(!hasHeroBehindHeader || currentScrollY > 40);

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
      if (scrollRafRef.current !== null) return;
      scrollRafRef.current = window.requestAnimationFrame(updateHeader);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
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

  useEffect(() => {
    const updateNavBottom = () => {
      if (navRef.current) setNavBottom(navRef.current.getBoundingClientRect().bottom);
    };
    updateNavBottom();
    window.addEventListener("resize", updateNavBottom);
    return () => window.removeEventListener("resize", updateNavBottom);
  }, [showNav]);

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
    if (navRef.current) setNavBottom(navRef.current.getBoundingClientRect().bottom);
  };

  return {
    pathname,
    hasHeroBehindHeader,
    isScrolled,
    showNav,
    navBottom,
    navRef,
    handleHeaderEnter,
    handleHeaderLeave,
    handleCategoryHover,
    clearHoverTimeout,
  };
}
