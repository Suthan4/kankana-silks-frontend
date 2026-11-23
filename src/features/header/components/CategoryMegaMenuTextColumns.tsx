"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import type { Category } from "@/lib/api/category.api";

interface Props {
  columns: Category[][];
  getCategoryUrl: (slug: string) => string;
  onNavigate: () => void;
}

export function CategoryMegaMenuTextColumns({
  columns,
  getCategoryUrl,
  onNavigate,
}: Props) {
  return (
    <div className="grid grid-cols-2 items-start gap-x-8 gap-y-8 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 xl:gap-x-10">
      {columns.map((column, columnIndex) => (
        <div key={`category-column-${columnIndex}`} className="flex min-w-0 flex-col gap-7">
          {column.map((sub, itemIndex) => (
            <motion.div
              key={sub.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.16, delay: (columnIndex + itemIndex) * 0.025 }}
              className="min-w-0"
            >
              <Link
                href={getCategoryUrl(sub.slug)}
                onClick={onNavigate}
                className="group flex w-fit items-center gap-2 text-base font-semibold tracking-wide text-gray-900"
              >
                <span className="h-[1.5px] w-0 shrink-0 bg-brand-primary transition-all duration-200 group-hover:w-4" />
                <span className="transition-colors duration-200 group-hover:text-brand-primary">
                  {sub.name}
                </span>
              </Link>
              {sub.children && sub.children.length > 0 && (
                <ul className="mt-3 flex flex-col gap-2.5 border-l border-gray-100 pl-4">
                  {sub.children.map((grandchild, grandchildIndex) => (
                    <motion.li
                      key={grandchild.id}
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.12, delay: grandchildIndex * 0.015 }}
                    >
                      <Link
                        href={getCategoryUrl(grandchild.slug)}
                        onClick={onNavigate}
                        className="block text-[15px] leading-6 text-gray-500 transition-colors duration-200 hover:text-brand-primary"
                      >
                        {grandchild.name}
                      </Link>
                    </motion.li>
                  ))}
                </ul>
              )}
            </motion.div>
          ))}
        </div>
      ))}
    </div>
  );
}
