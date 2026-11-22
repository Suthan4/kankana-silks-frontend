"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import type { Category } from "@/lib/api/category.api";

interface Props {
  categories: Category[];
  getCategoryUrl: (slug: string) => string;
  onNavigate: () => void;
}

export function CategoryMegaMenuImageRail({
  categories,
  getCategoryUrl,
  onNavigate,
}: Props) {
  return (
    <aside className="min-h-0 overflow-y-auto border-l border-gray-200 px-6 py-8 lg:px-8 xl:px-10">
      <div
        className={`grid w-fit content-start justify-start gap-x-5 gap-y-8 ${
          categories.length === 1
            ? "grid-cols-1"
            : categories.length === 2
              ? "grid-cols-2"
              : "grid-cols-3"
        }`}
      >
        {categories.map((sub, index) => (
          <motion.article
            key={sub.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.22,
              delay: index * 0.05,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="w-[190px] lg:w-[210px] xl:w-[240px] 2xl:w-[250px]"
          >
            <Link href={getCategoryUrl(sub.slug)} onClick={onNavigate} className="group block">
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#f4f4f4]">
                <Image
                  src={sub.image!}
                  alt={sub.name}
                  fill
                  sizes="(min-width: 1536px) 250px, (min-width: 1280px) 240px, (min-width: 1024px) 210px, 190px"
                  className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.025]"
                />
              </div>
              <h3 className="mt-3 whitespace-normal text-[13px] font-semibold uppercase leading-[1.4] tracking-[0.09em] text-gray-900">
                {sub.name}
              </h3>
            </Link>
          </motion.article>
        ))}
      </div>
    </aside>
  );
}
