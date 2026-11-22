"use client";

import { useEffect, useRef, useState } from "react";
import type { Category } from "@/lib/api/category.api";

export function useCategorySubcategoryScroller(children: Category["children"]) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;

    const updateArrows = () => {
      setShowLeftArrow(element.scrollLeft > 5);
      setShowRightArrow(element.scrollLeft + element.clientWidth < element.scrollWidth - 5);
    };

    updateArrows();
    element.addEventListener("scroll", updateArrows);
    window.addEventListener("resize", updateArrows);
    return () => {
      element.removeEventListener("scroll", updateArrows);
      window.removeEventListener("resize", updateArrows);
    };
  }, [children]);

  const scrollCategories = (direction: "left" | "right") => {
    scrollRef.current?.scrollBy({
      left: direction === "right" ? 220 : -220,
      behavior: "smooth",
    });
  };

  return { scrollRef, showLeftArrow, showRightArrow, scrollCategories };
}
