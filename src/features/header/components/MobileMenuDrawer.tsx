"use client";

import { X } from "lucide-react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import type { User } from "@/store/useAuthModalStore";
import type { Category } from "@/lib/api/category.api";
import { MobileMenuProfile } from "./MobileMenuProfile";
import { MobileCategoryTree } from "./MobileCategoryTree";

interface MobileMenuDrawerProps {
  open: boolean;
  categories: Category[];
  loading: boolean;
  user: User | null;
  activeNav: string;
  setActiveNav: (value: string) => void;
  activeSubNav: string;
  setActiveSubNav: (value: string) => void;
  getCategoryUrl: (slug: string) => string;
  onClose: () => void;
  onLogin: () => void;
  onLogout: () => void;
}

export function MobileMenuDrawer({
  open,
  categories,
  loading,
  user,
  activeNav,
  setActiveNav,
  activeSubNav,
  setActiveSubNav,
  getCategoryUrl,
  onClose,
  onLogin,
  onLogout,
}: MobileMenuDrawerProps) {
  return (
    <Sheet
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose();
      }}
    >
      <SheetContent
        side="left"
        showCloseButton={false}
        className="m-0 h-[100dvh] w-[min(85vw,420px)] max-w-none gap-0 overflow-hidden rounded-none border-r border-neutral-200 bg-white p-0 shadow-none md:hidden"
      >
        <SheetTitle className="sr-only">Site navigation</SheetTitle>
        <div
          className="h-full min-h-0 overflow-y-auto overscroll-contain pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)]"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          <div className="px-4 py-6">
            <button
              className="mb-4 flex h-10 w-10 items-center justify-center rounded-full text-neutral-700 hover:bg-neutral-100"
              onClick={onClose}
              aria-label="Close menu"
              type="button"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
            <MobileMenuProfile
              user={user}
              onClose={onClose}
              onLogin={onLogin}
              onLogout={onLogout}
            />
            <MobileCategoryTree
              categories={categories}
              loading={loading}
              activeNav={activeNav}
              setActiveNav={setActiveNav}
              activeSubNav={activeSubNav}
              setActiveSubNav={setActiveSubNav}
              getCategoryUrl={getCategoryUrl}
              onNavigate={onClose}
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
