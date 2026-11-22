"use client";

import { useEffect, useState } from "react";
import { useModalScrollLock } from "@/hooks/useModalScrollLock";
import { useAuthModal, type User } from "@/store/useAuthModalStore";
import { toast } from "sonner";
import type { Product, ProductVariant } from "@/lib/api/product.api";

export function useCategoryPageUI(user: User | null) {
  const { openModal } = useAuthModal();
  const [isMounted, setIsMounted] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [desktopFilterOpen, setDesktopFilterOpen] = useState(false);
  const [gridCols, setGridCols] = useState<2 | 3 | 4>(3);
  const [mobileGrid, setMobileGrid] = useState<1 | 2>(2);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [requestProduct, setRequestProduct] = useState<Product | null>(null);
  const [requestVariant, setRequestVariant] = useState<ProductVariant | null>(null);

  useEffect(() => setIsMounted(true), []);

  useModalScrollLock(
    mobileFilterOpen &&
      typeof window !== "undefined" &&
      window.innerWidth < 768 &&
      typeof CSS !== "undefined" &&
      CSS.supports("-webkit-touch-callout", "none"),
  );

  const openRequestModal = (product: Product, variant: ProductVariant | null) => {
    if (!user) {
      openModal("login");
      toast.info("Please login to request this product");
      return;
    }
    setRequestProduct(product);
    setRequestVariant(variant);
    setIsRequestModalOpen(true);
  };

  const closeRequestModal = () => {
    setIsRequestModalOpen(false);
    setRequestProduct(null);
    setRequestVariant(null);
  };

  return {
    isMounted,
    mobileFilterOpen,
    setMobileFilterOpen,
    desktopFilterOpen,
    setDesktopFilterOpen,
    gridCols,
    setGridCols,
    mobileGrid,
    setMobileGrid,
    isRequestModalOpen,
    requestProduct,
    requestVariant,
    openRequestModal,
    closeRequestModal,
  };
}
