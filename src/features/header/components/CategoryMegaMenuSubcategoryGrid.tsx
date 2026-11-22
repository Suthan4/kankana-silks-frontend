"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import type { Category } from "@/lib/api/category.api";

interface Props {
  category: Category;
  useVerticalCategoryList: boolean;
  shouldUseGrid: boolean;
  getCategoryUrl: (slug: string) => string;
  onNavigate: () => void;
}

export function CategoryMegaMenuSubcategoryGrid({
  category,
  useVerticalCategoryList,
  shouldUseGrid,
  getCategoryUrl,
  onNavigate,
}: Props) {
  return (
    <div
      className={
        useVerticalCategoryList
          ? "flex flex-col items-start gap-6"
          : shouldUseGrid
            ? "grid grid-cols-2 gap-x-8 gap-y-8 lg:grid-cols-3 xl:grid-cols-4"
            : "grid grid-cols-1 gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-3"
      }
    >
      {(category.children ?? []).map((sub, index) => (
        <motion.div
          key={sub.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.16, delay: index * 0.025 }}
          className={useVerticalCategoryList ? "w-full" : "min-w-0"}
        >
          <Link
            href={getCategoryUrl(sub.slug)}
            onClick={onNavigate}
            className="group flex w-fit items-center gap-2 text-base font-semibold tracking-wide text-gray-900"
          >
            <span className="h-[1.5px] w-0 shrink-0 bg-black transition-all duration-200 group-hover:w-4" />
            <span className="transition-colors duration-200 group-hover:text-black">
              {sub.name}
            </span>
          </Link>
          {sub.children && sub.children.length > 0 && (
            <ul className="mt-3 flex flex-col gap-3 border-l border-gray-100 pl-4">
              {sub.children.map((grandchild) => (
                <li key={grandchild.id}>
                  <Link
                    href={getCategoryUrl(grandchild.slug)}
                    onClick={onNavigate}
                    className="block text-[15px] leading-6 text-gray-500 transition-colors duration-200 hover:text-black"
                  >
                    {grandchild.name}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </motion.div>
      ))}
    </div>
  );
}
