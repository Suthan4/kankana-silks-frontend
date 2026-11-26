"use client";

import { createPortal } from "react-dom";
import { AnimatePresence, motion, MotionConfig } from "framer-motion";
import { ModalScrollLock } from "@/components/ui/ModalScrollLock";
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
    <MotionConfig reducedMotion="user">
      <>
      {/* Backdrop and drawer have independent presence lifecycles. This lets
          the backdrop fade while the panel completes its slide-out transition. */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.button
            key="mobile-menu-backdrop"
            type="button"
            aria-label="Close navigation menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed inset-0 z-[110] bg-black/50 md:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="mobile-navigation-panel"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
            className="mobile-drawer-panel fixed inset-y-0 left-0 z-[111] w-[85%] max-w-[420px] overflow-y-auto overscroll-contain bg-white pb-[env(safe-area-inset-bottom)] md:hidden"
            style={{ WebkitOverflowScrolling: "touch" }}
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
            onClick={(event) => event.stopPropagation()}
          >
            <ModalScrollLock />
            <div className="px-4 py-6">
              <button
                className="mb-4"
                onClick={onClose}
                aria-label="Close menu"
                type="button"
              >
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
        )}
      </AnimatePresence>
      </>
    </MotionConfig>,
    portalRoot,
  );
}
