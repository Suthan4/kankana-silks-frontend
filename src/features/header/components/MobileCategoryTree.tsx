"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import type { Category } from "@/lib/api/category.api";

interface MobileCategoryTreeProps {
  categories: Category[];
  loading: boolean;
  activeNav: string;
  setActiveNav: (value: string) => void;
  activeSubNav: string;
  setActiveSubNav: (value: string) => void;
  getCategoryUrl: (slug: string) => string;
  onNavigate: () => void;
}

export function MobileCategoryTree({
  categories,
  loading,
  activeNav,
  setActiveNav,
  activeSubNav,
  setActiveSubNav,
  getCategoryUrl,
  onNavigate,
}: MobileCategoryTreeProps) {
  if (loading) {
    return (
      <div className="space-y-1">
        {[120, 90, 110, 80, 100].map((width, index) => (
          <div key={index} className="border-b border-gray-100 px-1 py-5">
            <div className="h-4 animate-pulse rounded-full bg-gray-200" style={{ width }} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {categories.map((category) => {
        const isOpen = activeNav === category.name;
        return (
          <div key={category.id} className="border-b border-gray-200">
            <div className="flex items-center">
              {(category.children?.length ?? 0) > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveNav(isOpen ? "" : category.name)}
                  className="flex h-12 w-10 shrink-0 items-center justify-center"
                  aria-expanded={isOpen}
                >
                  <span className="relative h-4 w-4">
                    <span className="absolute left-0 top-1/2 h-[1.5px] w-4 -translate-y-1/2 bg-black" />
                    {!isOpen && (
                      <span className="absolute left-1/2 top-0 h-4 w-[1.5px] -translate-x-1/2 bg-black" />
                    )}
                  </span>
                </button>
              )}
              <Link
                href={getCategoryUrl(category.slug)}
                onClick={onNavigate}
                className="flex-1 py-2 text-[15px] font-medium uppercase tracking-[0.08em] text-black"
              >
                {category.name}
              </Link>
            </div>

            <AnimatePresence initial={false}>
              {isOpen && category.children && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <div className="pb-4 pl-10 pr-4">
                    <div className="space-y-5">
                      {category.children.map((sub) => {
                        const subKey = `${category.name}-${sub.name}`;
                        const isSubOpen = activeSubNav === subKey;
                        return (
                          <div key={sub.id}>
                            <div className="flex items-center">
                              {(sub.children?.length ?? 0) > 0 && (
                                <button
                                  type="button"
                                  onClick={() => setActiveSubNav(isSubOpen ? "" : subKey)}
                                  className="mr-2 flex h-8 w-6 shrink-0 items-center justify-center"
                                  aria-expanded={isSubOpen}
                                >
                                  <span className="relative h-3 w-3">
                                    <span className="absolute left-0 top-1/2 h-[1.5px] w-3 -translate-y-1/2 bg-black" />
                                    {!isSubOpen && (
                                      <span className="absolute left-1/2 top-0 h-3 w-[1.5px] -translate-x-1/2 bg-black" />
                                    )}
                                  </span>
                                </button>
                              )}
                              <Link
                                href={getCategoryUrl(sub.slug)}
                                onClick={onNavigate}
                                className="text-[14px] font-medium uppercase tracking-[0.06em] text-black"
                              >
                                {sub.name}
                              </Link>
                            </div>

                            <AnimatePresence initial={false}>
                              {isSubOpen && sub.children && sub.children.length > 0 && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="overflow-hidden"
                                >
                                  <div className="mt-3 space-y-3 pl-8">
                                    {sub.children.map((grand) => (
                                      <Link
                                        key={grand.id}
                                        href={getCategoryUrl(grand.slug)}
                                        onClick={onNavigate}
                                        className="block text-[12px] uppercase tracking-[0.05em] text-gray-500"
                                      >
                                        {grand.name}
                                      </Link>
                                    ))}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </div>

                    <Link
                      href={getCategoryUrl(category.slug)}
                      onClick={onNavigate}
                      className="mt-5 inline-flex items-center text-xs font-semibold uppercase tracking-wider text-black"
                    >
                      View All →
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
