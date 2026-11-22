"use client";

import Image from "next/image";
import Link from "next/link";
import type { Category } from "@/lib/api/category.api";

interface Props {
  category: Category;
  maxHeight: string;
  getCategoryUrl: (slug: string) => string;
  onNavigate: () => void;
}

export function CategoryMegaMenuLeafPanel({
  category,
  maxHeight,
  getCategoryUrl,
  onNavigate,
}: Props) {
  return (
    <section
      style={{ maxHeight }}
      className="flex min-h-[400px] items-stretch overflow-hidden"
    >
      {category.image && (
        <div className="relative aspect-[640/894] w-[340px] shrink-0 overflow-hidden bg-gray-100">
          <Image
            src={category.image}
            alt={category.name}
            fill
            sizes="340px"
            className="object-cover object-center transition-transform duration-700 hover:scale-[1.025]"
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/30 to-transparent" />
        </div>
      )}

      <div className="flex max-w-xl flex-col justify-center overflow-y-auto px-12 py-12">
        <span className="mb-5 block h-[2px] w-8 bg-[#c4a882]" />
        <h3 className="mb-4 font-serif text-3xl font-light uppercase tracking-[0.18em] text-gray-900">
          {category.name}
        </h3>
        {category.description && (
          <p className="line-clamp-4 text-base leading-relaxed text-gray-500">
            {category.description}
          </p>
        )}
        <Link
          href={getCategoryUrl(category.slug)}
          onClick={onNavigate}
          className="group mt-8 inline-flex w-fit items-center gap-3 text-sm font-semibold uppercase tracking-[0.16em] text-black"
        >
          <span className="border-b border-transparent transition-colors duration-200 group-hover:border-black">
            Explore Collection
          </span>
          <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
        </Link>
      </div>
    </section>
  );
}
