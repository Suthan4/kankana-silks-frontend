"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Package, LayoutGrid, Grid2x2, List } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: string;
  children?: Category[];
  isActive: boolean;
  order: number;
  _count?: { products: number };
}

interface ShopClientProps {
  categories: Category[];
}

type GridType = "3col" | "4col" | "list";

export default function ShopClient({ categories }: ShopClientProps) {
  const [grid, setGrid] = useState<GridType>("4col");

  const getCategoryUrl = (slug: string) => `/shop/${encodeURIComponent(slug)}`;

  const parentCategories = categories.filter((cat) => !cat.parentId);

  const totalProducts = categories.reduce(
    (sum, cat) => sum + (cat._count?.products || 0),
    0,
  );

  const gridClass = {
    "3col": "grid grid-cols-2 lg:grid-cols-3",
    "4col": "grid grid-cols-2 lg:grid-cols-4",
    list: "flex flex-col",
  }[grid];

  return (
    <div className="min-h-screen bg-white pt-30 md:pt-5">
      {/* TOOLBAR */}
      <div className="relative z-10 border-b border-gray-100 bg-white">
        <div className="max-w-screen mx-auto px-6 md:px-12 flex items-center justify-between h-11">
          {/* Grid toggles */}
          <div className="flex items-center gap-1">
            {(["3col", "4col", "list"] as GridType[]).map((g) => {
              const Icon =
                g === "3col" ? LayoutGrid : g === "4col" ? Grid2x2 : List;

              return (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGrid(g)}
                  aria-label={`Switch to ${g} layout`}
                  aria-pressed={grid === g}
                  className={`w-8 h-8 flex items-center justify-center transition-colors ${
                    grid === g
                      ? "text-black"
                      : "text-gray-300 hover:text-gray-500"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </button>
              );
            })}
          </div>

          {/* Product count */}
          {totalProducts > 0 && (
            <p className="text-[11px] tracking-widest text-gray-400 uppercase">
              {totalProducts.toLocaleString()} Sarees
            </p>
          )}
        </div>
      </div>

      {/* CATEGORY GRID */}
      <div className="max-w-screen mx-auto px-6 md:px-12 py-8">
        <header className="mb-8 max-w-3xl">
          <h1 className="text-3xl font-semibold tracking-tight text-gray-950 sm:text-4xl">
            Shop Silk Sarees Online
          </h1>

          <h2 className="mt-3 text-lg font-semibold text-gray-900">
            Explore our saree collections
          </h2>

          <p className="mt-2 text-sm leading-7 text-gray-600 sm:text-base">
            Browse Kanchipuram, Banarasi, Paithani, Mysore silk, handloom and
            other currently listed collections at Kankana Silks. Open a category
            to view its products, compare product details and check current
            availability before ordering.
          </p>
        </header>

        {parentCategories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Package className="w-10 h-10 text-gray-200" />

            <p className="text-xs tracking-widest uppercase text-gray-300">
              No collections available
            </p>
          </div>
        ) : (
          <div className={`${gridClass} border-t border-l border-gray-100`}>
            {parentCategories.map((category) =>
              grid === "list" ? (
                /* LIST VIEW */
                <div
                  key={category.id}
                  className="bg-white border-r border-b border-gray-100"
                >
                  <Link
                    href={getCategoryUrl(category.slug)}
                    className="group flex items-center gap-6 px-4 py-4 hover:bg-gray-50 transition-colors border-b border-gray-100"
                  >
                    {/* Thumbnail */}
                    <div className="relative w-20 h-20 flex-shrink-0 bg-gray-50 overflow-hidden">
                      {category.image ? (
                        <Image
                          src={category.image}
                          alt={category.name}
                          fill
                          sizes="80px"
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-6 h-6 text-gray-200" />
                        </div>
                      )}
                    </div>

                    {/* Category information */}
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] tracking-[0.18em] uppercase text-gray-900 font-medium">
                        {category.name}
                      </p>

                      {category.description && (
                        <p className="text-xs text-gray-400 mt-1 line-clamp-1">
                          {category.description}
                        </p>
                      )}

                      {category.children && category.children.length > 0 && (
                        <div className="flex gap-2 mt-2 flex-wrap">
                          {category.children.slice(0, 3).map((sub) => (
                            <span
                              key={sub.id}
                              className="text-[10px] tracking-wider uppercase text-gray-400"
                            >
                              {sub.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Count and arrow */}
                    <div className="flex items-center gap-4 flex-shrink-0">
                      {category._count?.products ? (
                        <span className="text-[10px] tracking-widest uppercase text-gray-400 hidden sm:block">
                          {category._count.products} Sarees
                        </span>
                      ) : null}

                      <span className="text-gray-300 group-hover:text-black group-hover:translate-x-1 inline-block transition-all duration-300">
                        →
                      </span>
                    </div>
                  </Link>
                </div>
              ) : (
                /* GRID VIEW */
                <div
                  key={category.id}
                  className="bg-white border-r border-b border-gray-100"
                >
                  <Link
                    href={getCategoryUrl(category.slug)}
                    className="group block bg-white"
                  >
                    {/* Category image */}
                    <div
                      className={`relative w-full bg-white overflow-hidden ${
                        grid === "4col" ? "h-64 md:h-72" : "h-72 md:h-96"
                      }`}
                    >
                      {category.image ? (
                        <>
                          <Image
                            src={category.image}
                            alt={category.name}
                            fill
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                          />

                          {/* Hover overlay */}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500 pointer-events-none" />
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-50">
                          <Package className="w-10 h-10 text-gray-200" />
                        </div>
                      )}

                      {/* Product count */}
                      {category._count?.products ? (
                        <div className="absolute top-3 right-3 bg-white/95 px-2 py-0.5 text-[9px] tracking-widest uppercase text-gray-600">
                          {category._count.products} Sarees
                        </div>
                      ) : null}

                      {/* Subcategory pills */}
                      {category.children && category.children.length > 0 && (
                        <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out flex flex-wrap gap-1.5">
                          {category.children.slice(0, 3).map((sub) => (
                            <span
                              key={sub.id}
                              className="bg-white/95 px-2 py-0.5 text-[9px] tracking-wider uppercase text-gray-700"
                            >
                              {sub.name}
                            </span>
                          ))}

                          {category.children.length > 3 && (
                            <span className="bg-white/95 px-2 py-0.5 text-[9px] tracking-wider uppercase text-gray-400">
                              +{category.children.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Category name */}
                    <div className="flex items-center justify-between px-3 py-3 bg-white">
                      <div>
                        <p className="text-[10px] tracking-[0.18em] uppercase text-gray-900 font-medium">
                          {category.name}
                        </p>

                        {category.description && grid === "3col" && (
                          <p className="text-[10px] text-gray-400 mt-0.5 line-clamp-1">
                            {category.description}
                          </p>
                        )}
                      </div>

                      <span className="text-gray-300 group-hover:text-black group-hover:translate-x-0.5 inline-block transition-all duration-300 text-xs">
                        →
                      </span>
                    </div>
                  </Link>
                </div>
              ),
            )}
          </div>
        )}
      </div>

      {/* BOTTOM STRIP */}
      <div className="border-t border-gray-100 mt-4">
        <div className="max-w-screen-xl mx-auto px-5 md:px-12 py-8 md:py-14 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 md:gap-6">
          <div>
            <p className="text-[10px] tracking-[0.22em] uppercase text-gray-400 mb-1">
              Bespoke Service
            </p>

            <h2 className="text-lg md:text-xl font-light text-gray-900">
              Looking for something special?
            </h2>

            <p className="text-[11px] md:text-xs text-gray-400 mt-1.5 max-w-sm leading-relaxed">
              Custom orders, personalised recommendations — our team is ready.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <Link
              href="/contact-us"
              className="px-5 py-2.5 bg-black text-white text-[10px] tracking-[0.15em] uppercase font-medium hover:bg-gray-800 transition-colors"
            >
              Get in Touch
            </Link>

            <Link
              href="/about-us"
              className="px-5 py-2.5 border border-gray-200 text-[10px] tracking-[0.15em] uppercase font-medium text-gray-700 hover:border-black hover:text-black transition-colors"
            >
              Our Story
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
