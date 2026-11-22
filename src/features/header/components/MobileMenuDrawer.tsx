"use client";

import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import type { User } from "@/store/useAuthModalStore";
import type { Category } from "@/lib/api/category.api";
import { MobileMenuProfile } from "./MobileMenuProfile";
import { MobileCategoryTree } from "./MobileCategoryTree";

interface MobileMenuDrawerProps {
  open: boolean;
  portalRoot: HTMLElement | null;
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
  portalRoot,
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
  if (!portalRoot) return null;

  return createPortal(
    <AnimatePresence initial={false}>
      {open && (
        <div
          className="md:hidden fixed inset-0 z-[110] isolate"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 110,
            isolation: "isolate",
            contain: "layout paint",
            transform: "translate3d(0, 0, 0)",
            WebkitTransform: "translate3d(0, 0, 0)",
          }}
        >
          {/* Static backdrop avoids animating opacity over the hero image. */}
          <button
            type="button"
            aria-label="Close navigation menu"
            className="absolute inset-0 h-full w-full touch-none bg-black/50"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
            className="mobile-drawer-panel absolute inset-y-0 left-0 w-[85%] max-w-[420px] overflow-y-auto overscroll-contain bg-white pb-[env(safe-area-inset-bottom)]"
            style={{ WebkitOverflowScrolling: "touch" }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="px-4 py-6">
              <button className="mb-4" onClick={onClose} aria-label="Close menu">
                <span aria-hidden="true">×</span>
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
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    portalRoot,
  );
}
