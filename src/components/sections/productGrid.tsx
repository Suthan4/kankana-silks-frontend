"use client";

import { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import type { Swiper as SwiperType } from "swiper";
import type { HomeSection } from "@/lib/api/home-section.api";
import SmartImage from "../common/smartImage";
import Link from "next/link";
import WishlistButton from "@/components/ui/WishlistButton";
import HomeSectionHeading from "../common/homeSectionHeading";
import { getCartItemStockMessage, getProductStockOverview } from "@/lib/utils/cartStock";
import { formatMaskedPrice } from "@/lib/utils/priceMasked";

// Keep slide dimensions stable before and after Swiper initialisation.
// The width already accounts for the gap between mobile slides.
const SLIDE_CLASS =
  "!w-[calc((100%-0.75rem)/2)] md:!w-[calc((100%-2.5rem)/3)] lg:!w-[calc((100%-4.5rem)/4)]";

const HANDPICKED_SLIDE_CLASS = "!w-[calc((100%-0.75rem)/2)] md:!w-[240px] lg:!w-[270px] xl:!w-[290px]";

const arrowClass =
  "absolute top-1/3 z-20 hidden h-11 w-11 items-center justify-center rounded-full bg-white shadow-lg transition hover:scale-105 md:flex";

function ProductGrid({
  section,
  eagerCount = 0,
}: {
  section: HomeSection;
  eagerCount?: number;
}) {
  const [swiper, setSwiper] = useState<SwiperType | null>(null);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(true);
  const [activeProductIndex, setActiveProductIndex] = useState(0);

  if (!section.products?.length) return null;

  const isHandpicked = section.title.trim().toLowerCase() === "handpicked for you";

  const products =
    section.limit > 0
      ? section.products.slice(0, section.limit)
      : section.products;

  const sync = (s: SwiperType) => {
    setIsBeginning(s.isBeginning);
    setIsEnd(s.isEnd);
    setActiveProductIndex(s.realIndex);
  };

  const scrollable = !(isBeginning && isEnd);

  return (
    <section
      className={`relative overflow-hidden pb-8 pt-8 md:pb-12 md:pt-12 lg:pb-14 lg:pt-14 ${isHandpicked ? "home-handpicked-section" : ""}`}
      style={{ backgroundColor: isHandpicked ? "#FDFBF9" : section.backgroundColor }}
    >
      <div className={`relative mx-auto w-full max-w-[1600px] ${isHandpicked ? "px-5 md:px-6 lg:px-10 2xl:px-14" : "px-4 md:px-6 lg:px-10 2xl:px-14"}`}>
        {(isHandpicked || section.showTitle || section.showSubtitle) && (
          <div className="mb-5">
            <HomeSectionHeading
              title={section.title}
              subtitle={section.subtitle}
              showTitle={isHandpicked || section.showTitle}
              showSubtitle={section.showSubtitle}
              textColor={isHandpicked ? "#211817" : section.textColor}
              className="mb-0 max-w-none px-0"
            />
            {isHandpicked && (
              <div className="mt-3 flex justify-end">
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-1 text-[13px] font-medium tracking-wide text-[#653536] underline decoration-[#C68B83]/60 underline-offset-4"
                >
                  View all <span aria-hidden="true">→</span>
                </Link>
              </div>
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
                  d="M9 5l7-7-7 7"
                />
              </svg>
            </button>
          )}

          <Swiper
            className={isHandpicked ? "home-handpicked-swiper" : ""}
            slidesPerView="auto"
            spaceBetween={12}
            breakpoints={{ 768: { spaceBetween: 20 }, 1024: { spaceBetween: 24 } }}
            initialSlide={0}
            slidesPerGroupAuto
            watchOverflow
            onSwiper={(s) => {
              setSwiper(s);
              sync(s);
            }}
            onSlideChange={sync}
            onResize={sync}
            onUpdate={sync}
          >
            {products.map((product, productIndex) => {
              const image = product.media?.[0]?.url;
              const stockOverview = getProductStockOverview(product);
              const stockState = stockOverview.state;
              const stockMessage = getCartItemStockMessage(stockOverview.item);

              const basePrice = Number(product.basePrice);
              const sellingPrice = Number(product.sellingPrice);

              const discount =
                basePrice > sellingPrice
                  ? Math.round(((basePrice - sellingPrice) / basePrice) * 100)
                  : 0;

              return (
                <SwiperSlide key={product.id} className={isHandpicked ? HANDPICKED_SLIDE_CLASS : SLIDE_CLASS}>
                  <div className="group relative flex h-full min-w-0 flex-col">
                    <Link
                      href={`/${product.category.slug}/${product.slug}`}
                      className="flex h-full min-w-0 flex-col"
                    >
                    <div className={`relative aspect-[4/5] w-full overflow-hidden bg-gray-50 ${isHandpicked ? "rounded-xl" : ""}`}>
                      {image ? (
                        <SmartImage
                          src={image}
                          alt={product.name}
                          fill
                          quality={60}
                          priority={productIndex < eagerCount}
                          loading={productIndex < eagerCount ? "eager" : "lazy"}
                          sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 48vw"
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
                        {stockOverview.isZeroStock && (
                          <span className="rounded-full bg-red-600 px-3 py-1.5 text-xs font-futura-bold text-white shadow-lg">
                            Sold Out
                          </span>
                        )}

                        {!stockOverview.isZeroStock && !stockOverview.isOutOfStock && stockState.isLastOne && (
                          <span className="rounded-full bg-amber-100 px-3 py-1.5 text-xs font-futura-bold text-amber-900 shadow-sm">
                            Last one
                          </span>
                        )}

                        {!stockOverview.isZeroStock && !stockOverview.isOutOfStock && stockState.isLimited && !stockState.isLastOne && (
                          <span className="rounded-full bg-amber-100 px-3 py-1.5 text-xs font-futura-bold text-amber-900 shadow-sm">
                            Limited to 1
                          </span>
                        )}

                        {!stockOverview.isZeroStock && discount > 0 && (
                          <span className="bg-main-primary/90 px-2.5 py-1 text-[11px] font-medium text-main-secondary backdrop-blur-md">
                            {discount}% OFF
                          </span>
                        )}
                      </div>
                    </div>

                    <div
                      className={`flex flex-1 flex-col ${isHandpicked ? "pt-2.5" : "pt-3"}`}
                      style={{ color: section.textColor }}
                    >
                      <h3 className={`line-clamp-2 font-medium leading-5 tracking-tight transition-opacity group-hover:opacity-80 ${isHandpicked ? "text-[14px] md:text-[15px]" : "text-sm md:text-[15px]"}`}>
                        {product.name}
                      </h3>

                      <div className="mt-auto flex flex-wrap items-baseline gap-x-2 pt-1">
                        <span className={isHandpicked ? "text-[13px] font-normal tracking-normal text-[#7A6466] md:text-base md:font-semibold" : "text-base font-semibold tracking-tight"}>
                          {stockOverview.isZeroStock
                            ? formatMaskedPrice(sellingPrice)
                            : `₹${sellingPrice.toLocaleString("en-IN")}`}
                        </span>

                        {!stockOverview.isZeroStock && discount > 0 && (
                          <span className="text-xs text-gray-500 line-through">
                            ₹{basePrice.toLocaleString("en-IN")}
                          </span>
                        )}
                      </div>
                      {!stockOverview.isZeroStock && stockMessage && (
                        <p className="mt-1 text-[11px] font-medium leading-4 text-amber-700">
                          {stockMessage.message}
                        </p>
                      )}
                    </div>
                    </Link>
                    <WishlistButton
                      productId={product.id}
                      size="sm"
                      className="absolute right-2 top-2 z-10 h-8 w-8 border-0 bg-black/10 text-white shadow-none backdrop-blur-sm hover:bg-black/20"
                    />
                  </div>
                </SwiperSlide>
              );
            })}
          </Swiper>

          {!isHandpicked && products.length > 4 && (
            <div className="mt-5 hidden items-center justify-center gap-2 md:flex" aria-label="Product carousel navigation">
              {Array.from({ length: Math.ceil(products.length / 4) }).map((_, pageIndex) => (
                <button
                  key={pageIndex}
                  type="button"
                  onClick={() => swiper?.slideTo(pageIndex * 4)}
                  aria-label={`Show product group ${pageIndex + 1}`}
                  aria-current={Math.floor(activeProductIndex / 4) === pageIndex ? "true" : undefined}
                  className={`h-1.5 rounded-full transition-all duration-300 ${Math.floor(activeProductIndex / 4) === pageIndex ? "w-6 bg-neutral-900" : "w-1.5 bg-neutral-300 hover:bg-neutral-500"}`}
                />
              ))}
            </div>
          )}

          {isHandpicked && products.length > 2 && (
            <div className="mt-4 flex items-center justify-center gap-3 md:hidden" aria-label="Product carousel navigation">
              <span className="text-[11px] font-medium tracking-wide text-warm-gray-500">
                Swipe to explore
              </span>
              <div className="flex items-center gap-1.5">
                {Array.from({ length: Math.ceil(products.length / 2) }).map((_, pageIndex) => (
                  <button
                    key={pageIndex}
                    type="button"
                    onClick={() => swiper?.slideTo(pageIndex * 2)}
                    aria-label={`Show product group ${pageIndex + 1}`}
                    aria-current={Math.floor(activeProductIndex / 2) === pageIndex ? "true" : undefined}
                    className={`h-1.5 rounded-full transition-all duration-300 ${Math.floor(activeProductIndex / 2) === pageIndex ? "w-5 bg-brand-primary" : "w-1.5 bg-brand-primary/25 hover:bg-brand-primary/55"}`}
                  />
                ))}
              </div>
              <span aria-hidden="true" className="text-xs text-brand-primary">→</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default ProductGrid;
