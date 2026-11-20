"use client";

import { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import type { Swiper as SwiperType } from "swiper";
import type { HomeSection } from "@/lib/api/home-section.api";
import SmartImage from "../common/smartImage";

// Mobile: 2 fluid cards per view. Tablet and up: fixed card widths, so cards
// stay the same size on any screen (like the header menu) and the number
// visible grows with the viewport.
const SLIDE_CLASS =
  "!w-[calc((100%-0.75rem)/2)] md:!w-[240px] lg:!w-[270px] xl:!w-[290px]";

const arrowClass =
  "absolute top-1/3 z-20 hidden h-11 w-11 items-center justify-center rounded-full bg-white shadow-lg transition hover:scale-105 md:flex";

function ProductGrid({ section }: { section: HomeSection }) {
  const [swiper, setSwiper] = useState<SwiperType | null>(null);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(true);

  if (!section.products?.length) return null;

  const products =
    section.limit > 0
      ? section.products.slice(0, section.limit)
      : section.products;

  const sync = (s: SwiperType) => {
    setIsBeginning(s.isBeginning);
    setIsEnd(s.isEnd);
  };

  const scrollable = !(isBeginning && isEnd);

  return (
    <section
      className="relative overflow-hidden pb-10 pt-10 md:pt-14"
      style={{ backgroundColor: section.backgroundColor }}
    >
      <div className="relative mx-auto w-full max-w-[1600px] px-4 md:px-6 lg:px-10 2xl:px-14">
        {(section.showTitle || section.showSubtitle) && (
          <div className="mb-6 text-center md:mb-10">
            {section.showTitle && (
              <h2
                className="mb-2 text-2xl font-semibold tracking-tight md:text-4xl"
                style={{ color: section.textColor }}
              >
                {section.title}
              </h2>
            )}
            {section.showSubtitle && section.subtitle && (
              <p
                className="mx-auto max-w-3xl text-base leading-relaxed opacity-80 md:text-xl"
                style={{ color: section.textColor }}
              >
                {section.subtitle}
              </p>
            )}
          </div>
        )}

        <div className="relative">
          {scrollable && !isBeginning && (
            <button
              type="button"
              onClick={() => swiper?.slidePrev()}
              aria-label="Previous products"
              className={`${arrowClass} -left-5`}
            >
              <svg
                className="h-5 w-5 text-black"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
          )}
          {scrollable && !isEnd && (
            <button
              type="button"
              onClick={() => swiper?.slideNext()}
              aria-label="Next products"
              className={`${arrowClass} -right-5`}
            >
              <svg
                className="h-5 w-5 text-black"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          )}

          <Swiper
            slidesPerView="auto"
            slidesPerGroupAuto
            spaceBetween={12}
            breakpoints={{
              768: { spaceBetween: 20 },
              1024: { spaceBetween: 24 },
            }}
            watchOverflow
            onSwiper={(s) => {
              setSwiper(s);
              sync(s);
            }}
            onSlideChange={sync}
            onBreakpoint={sync}
            onResize={sync}
            onUpdate={sync}
          >
            {products.map((product) => {
              const image = product.media?.[0]?.url;
              const inStock = product.stock?.some((s) => s.quantity > 0);
              const basePrice = Number(product.basePrice);
              const sellingPrice = Number(product.sellingPrice);
              const discount =
                basePrice > sellingPrice
                  ? Math.round(((basePrice - sellingPrice) / basePrice) * 100)
                  : 0;

              return (
                <SwiperSlide key={product.id} className={SLIDE_CLASS}>
                  <a
                    href={`/products/${product.slug}`}
                    className="group flex h-full flex-col min-w-0"
                  >
                    <div className="relative aspect-[4/5] w-full overflow-hidden">
                      {image ? (
                        <SmartImage
                          src={image}
                          alt={product.name}
                          fill
                          sizes="(min-width: 1280px) 290px, (min-width: 1024px) 270px, (min-width: 768px) 240px, 48vw"
                          draggable={false}
                          className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gray-100">
                          <span className="text-6xl font-light text-gray-400">
                            {product.name[0]}
                          </span>
                        </div>
                      )}

                      <div className="absolute left-0 top-0 flex flex-col gap-2">
                        {!inStock && (
                          <span className="rounded-full bg-red-600 px-3 py-1.5 text-xs font-bold text-white shadow-lg">
                            Sold Out
                          </span>
                        )}
                        {discount > 0 && (
                          <span className="bg-main-primary/90 px-2.5 py-1 text-[11px] font-medium text-main-secondary backdrop-blur-md">
                            {discount}% OFF
                          </span>
                        )}
                      </div>
                    </div>

                    <div
                      className="flex flex-1 flex-col pt-3"
                      style={{ color: section.textColor }}
                    >
                      <h3 className="line-clamp-2 text-sm font-medium tracking-tight transition-opacity group-hover:opacity-80 md:text-[15px]">
                        {product.name}
                      </h3>
                      <div className="mt-auto flex flex-wrap items-baseline gap-x-2 pt-1.5">
                        <span className="text-base font-semibold tracking-tight">
                          ₹{sellingPrice.toLocaleString("en-IN")}
                        </span>
                        {discount > 0 && (
                          <span className="text-xs text-gray-500 line-through">
                            ₹{basePrice.toLocaleString("en-IN")}
                          </span>
                        )}
                      </div>
                    </div>
                  </a>
                </SwiperSlide>
              );
            })}
          </Swiper>
        </div>
      </div>
    </section>
  );
}

export default ProductGrid;
