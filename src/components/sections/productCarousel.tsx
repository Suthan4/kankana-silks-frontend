"use client";

import { Product } from "@/lib/api/home-section.api";
import { useEffect, useRef, useState } from "react";
import { ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";
import WishlistButton from "../ui/WishlistButton";
import { toast } from "sonner";
import { useCartStore } from "@/store/useCartStore";
import { useCartDrawer } from "@/store/useCartDrawer";
import { cartApi } from "@/lib/api/cart.api";
import { useAuthModal } from "@/store/useAuthModalStore";
import { useQueryClient } from "@tanstack/react-query";

import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { Autoplay } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";

import SmartImage from "../common/smartImage";
import HomeSectionHeading from "../common/homeSectionHeading";
import { getCartItemStockMessage, getProductStockLabel, getProductStockOverview } from "@/lib/utils/cartStock";
import { formatMaskedPrice } from "@/lib/utils/priceMasked";

const stripHtml = (html?: string) => (html ? html.replace(/<[^>]+>/g, "") : "");
const inr = (value: number | string) => Number(value).toLocaleString("en-IN");
const arrowClass =
  "absolute top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-black/5 bg-white/90 text-xl text-gray-900 shadow-sm backdrop-blur-sm transition hover:scale-105 hover:bg-white active:scale-95";

export default function ProductCarousel({
  title,
  subtitle,
  products,
  backgroundColor = "#ffffff",
  textColor = "#000000",
  showTitle = true,
  showSubtitle = true,
}: {
  title: string;
  subtitle?: string;
  products: Product[];
  backgroundColor?: string;
  textColor?: string;
  showTitle?: boolean;
  showSubtitle?: boolean;
}) {
  const [index, setIndex] = useState(0);
  const swiperRef = useRef<SwiperType | null>(null);
  const router = useRouter();
  const { addItem: addToLocalCart } = useCartStore();
  const { open: openCartDrawer } = useCartDrawer();
  const { user } = useAuthModal();
  const queryClient = useQueryClient();

  // Keep index inside range when the product list changes
  useEffect(() => {
    setIndex((i) => (products.length ? Math.min(i, products.length - 1) : 0));
  }, [products]);

  if (!products?.length) return null;

  const safeIndex = Math.min(Math.max(index, 0), products.length - 1);
  const currentProduct = products[safeIndex];
  const currentStockOverview = getProductStockOverview(currentProduct);
  const currentStockLabel = currentStockOverview.isOutOfStock
    ? null
    : getProductStockLabel(currentStockOverview);
  const currentInStock = !currentStockOverview.isOutOfStock;
  const currentDiscount =
    !currentStockOverview.isZeroStock &&
    Number(currentProduct.basePrice) > Number(currentProduct.sellingPrice);

  const handleAddToCart = async (product: Product) => {
    const stockOverview = getProductStockOverview(product);

    if (stockOverview.isOutOfStock) {
      toast.error(
        getCartItemStockMessage(stockOverview.item)?.message ??
          "This product is currently unavailable.",
      );
      return;
    }

    // Variable products require an explicit variant selection on the detail page.
    if (product.hasVariants) {
      handleViewDetails(product);
      return;
    }

    try {
      addToLocalCart({
        id: crypto.randomUUID(),
        cartId: "local",
        productId: product.id,
        variantId: null,
        quantity: 1,
        product: {
          id: product.id,
          name: product.name,
          slug: product.slug,
          categoryId: product.category.id,
          sellingPrice: Number(product.sellingPrice),
          basePrice: Number(product.basePrice),
          media: product.media || [],
          allowOutOfStockOrders: product.allowOutOfStockOrders ?? false,
          stock: product.stock?.map((stock) => ({
            ...stock,
            lowStockThreshold: stock.lowStockThreshold ?? 0,
          })) || [],
        },
        variant: null,
      });

      if (user) {
        await cartApi.addToCart({ productId: product.id, quantity: 1 });
        await queryClient.invalidateQueries({ queryKey: ["cartApi"] });
      }

      toast.success("Added to cart");
      openCartDrawer();
    } catch {
      toast.error("Failed to add");
    }
  };

  const handleViewDetails = (product: Product) => {
    router.push(`/${product.category.slug}/${product.slug}`);
  };

  return (
    <section
      className="pb-8 pt-7 sm:pb-10 sm:pt-9 lg:pb-12 lg:pt-10"
      style={{ backgroundColor, color: textColor }}
    >
      <HomeSectionHeading
        title={title || "Best of One"}
        subtitle={subtitle}
        showTitle={showTitle}
        showSubtitle={showSubtitle}
        textColor={textColor}
      />

      {/* MOBILE: horizontal card swiper */}
      <div className="lg:hidden">
        <Swiper
          modules={[Autoplay]}
          className="product-carousel-swiper"
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
          }}
          onSlideChange={(swiper) => setIndex(swiper.realIndex)}
          loop={products.length > 2}
          watchOverflow
          allowTouchMove={products.length > 1}
          grabCursor={products.length > 1}
          touchStartPreventDefault={false}
          autoplay={
            products.length > 1
              ? { delay: 6000, disableOnInteraction: false, pauseOnMouseEnter: true }
              : false
          }
          slidesPerView={1.04}
          breakpoints={{
            640: { slidesPerView: 1.18, spaceBetween: 16 },
            768: { slidesPerView: 1.3, spaceBetween: 18 },
          }}
          centeredSlides={products.length > 1}
          spaceBetween={12}
        >
          {products.map((product) => {
            const stockOverview = getProductStockOverview(product);
            const stockLabel = stockOverview.isOutOfStock
              ? null
              : getProductStockLabel(stockOverview);
            const inStock = !stockOverview.isOutOfStock;

            const basePrice = Number(product.basePrice);
            const sellingPrice = Number(product.sellingPrice);
            const discount =
              basePrice > sellingPrice
                ? Math.round(((basePrice - sellingPrice) / basePrice) * 100)
                : 0;

            return (
              <SwiperSlide key={product.id}>
                <article className="mx-auto w-full max-w-[560px] overflow-hidden rounded-2xl border border-stone-100 bg-white text-black shadow-[0_12px_36px_rgba(32,22,18,0.08)]">
                  <div className="relative">
                    <button
                      type="button"
                      aria-label={`View ${product.name}`}
                      onClick={() => handleViewDetails(product)}
                      className="relative block aspect-[4/3] max-h-[42svh] min-h-[210px] w-full overflow-hidden bg-[#f7f5f2]"
                    >
                      {product.media?.[0]?.url ? (
                        <SmartImage
                          src={product.media[0].url}
                          alt=""
                          fill
                          sizes="(max-width: 640px) 92vw, 560px"
                          className="object-cover object-top"
                        />
                      ) : (
                        <span className="flex h-full items-center justify-center text-sm text-gray-400">
                          No image available
                        </span>
                      )}
                    </button>

                    {discount > 0 && !stockOverview.isZeroStock && (
                      <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1.5 text-[10px] font-semibold tracking-wide text-[#653A3A] shadow-sm backdrop-blur">
                        {discount}% OFF
                      </span>
                    )}
                    <div className="absolute right-3 top-3">
                      <WishlistButton
                        productId={product.id}
                        variant="icon"
                        size="md"
                        className="border border-stone-200/70 bg-white/95 shadow-sm backdrop-blur transition hover:bg-white"
                      />
                    </div>
                  </div>

                  <div className="p-4 sm:p-5">
                    <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-stone-600">
                      {product.category?.name || "Collection"}
                    </p>
                    <h3 className="mt-1.5 line-clamp-2 min-h-11 text-base font-semibold leading-6 text-stone-900">
                      {product.name}
                    </h3>

                    <div className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <span className="text-xl font-semibold tracking-tight text-stone-950">
                        {stockOverview.isZeroStock
                          ? formatMaskedPrice(sellingPrice)
                          : `₹${inr(sellingPrice)}`}
                      </span>
                      {!stockOverview.isZeroStock && discount > 0 && (
                        <span className="text-sm text-stone-600 line-through">
                          ₹{inr(basePrice)}
                        </span>
                      )}
                      {stockLabel && (
                        <span className="text-xs font-medium text-stone-600" aria-live="polite">
                          {stockLabel}
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      disabled={!inStock}
                      onClick={() =>
                        product.hasVariants
                          ? handleViewDetails(product)
                          : handleAddToCart(product)
                      }
                      className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-[#653A3A] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#4f2c2c] active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-stone-300"
                    >
                      <ShoppingCart size={16} />
                      {!inStock
                        ? stockOverview.isZeroStock
                          ? "Sold out"
                          : "Unavailable"
                        : product.hasVariants
                          ? "Choose options"
                          : "Add to bag"}
                    </button>
                  </div>
                </article>
              </SwiperSlide>
            );
          })}
        </Swiper>

        {products.length > 1 && (
          <div
            className="mt-1 flex min-h-11 items-center justify-center gap-1"
            aria-label="Product carousel pagination"
          >
            {products.map((product, productIndex) => (
              <button
                key={product.id}
                type="button"
                aria-label={`Go to product ${productIndex + 1}: ${product.name}`}
                aria-current={productIndex === safeIndex ? "true" : undefined}
                onClick={() => {
                  const swiper = swiperRef.current;
                  if (swiper) {
                    if (swiper.params.loop) swiper.slideToLoop(productIndex);
                    else swiper.slideTo(productIndex);
                  }
                  setIndex(productIndex);
                }}
                className="flex h-11 min-w-11 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#653A3A] focus-visible:ring-offset-2"
              >
                <span
                  aria-hidden="true"
                  className={`block rounded-full transition-all duration-200 ${
                    productIndex === safeIndex
                      ? "h-[3px] w-7 bg-[#653A3A]"
                      : "h-2 w-2 bg-stone-400"
                  }`}
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* TABLET + DESKTOP: image and details, grouped and centered */}
      <div className="hidden w-full lg:block">
        <div className="mx-auto grid w-full max-w-[1440px] items-center gap-8 px-5 sm:px-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-10 xl:gap-14 xl:px-12">
          {/* Image */}
          <div className="group relative aspect-[0.9] max-h-[min(72vh,760px)] w-full overflow-hidden rounded-2xl bg-[#f7f7f5] shadow-sm">
            {currentProduct.media?.[0]?.url ? (
              <SmartImage
                key={currentProduct.id}
                src={currentProduct.media[0].url}
                alt=""
                fill
                sizes="(min-width: 1536px) 680px, (min-width: 1024px) 52vw, 100vw"
                className="object-cover object-top transition duration-500 ease-out group-hover:scale-[1.02]"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm text-gray-400">
                No image available
              </div>
            )}

            {products.length > 1 && (
              <>
                <button
                  type="button"
                  aria-label="Previous product"
                  onClick={() =>
                    setIndex((i) => (i <= 0 ? products.length - 1 : i - 1))
                  }
                  className={`${arrowClass} left-3`}
                >
                  ‹
                </button>
                <button
                  type="button"
                  aria-label="Next product"
                  onClick={() =>
                    setIndex((i) => (i >= products.length - 1 ? 0 : i + 1))
                  }
                  className={`${arrowClass} right-3`}
                >
                  ›
                </button>
              </>
            )}

            <div className="absolute right-3 top-3 z-10">
              <WishlistButton
                productId={currentProduct.id}
                variant="icon"
                size="md"
                className="border border-black/5 bg-white/95 shadow-sm backdrop-blur-sm transition hover:bg-white"
              />
            </div>

            {products.length > 1 && (
              <div className="absolute bottom-3 left-3 z-10 rounded-full bg-white/90 px-3 py-1.5 text-[11px] font-medium tracking-wide text-gray-700 shadow-sm backdrop-blur-sm">
                {safeIndex + 1} / {products.length}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex min-w-0 flex-col justify-center">
            <p className="mb-3 text-[11px] uppercase tracking-[0.22em] opacity-70">
              {currentProduct.category?.name || "Collection"}
            </p>

            <h3 className="max-w-xl text-2xl font-semibold leading-tight tracking-tight lg:text-3xl xl:text-4xl">
              {currentProduct.name}
            </h3>

            {currentProduct.description && (
              <p className="mt-4 line-clamp-3 max-w-2xl text-sm leading-7 opacity-75 xl:text-base">
                {stripHtml(currentProduct.description)}
              </p>
            )}

            <div className="mt-6 flex flex-wrap items-baseline gap-3">
              <span className="text-3xl font-medium tracking-tight xl:text-4xl">
                {currentStockOverview.isZeroStock
                  ? formatMaskedPrice(Number(currentProduct.sellingPrice))
                  : `₹${inr(currentProduct.sellingPrice)}`}
              </span>
              {currentDiscount && (
                <span className="text-sm text-stone-600 line-through lg:text-base">
                  ₹{inr(currentProduct.basePrice)}
                </span>
              )}
            </div>

            {currentStockLabel && (
              <p className="mt-2 text-sm font-medium text-stone-600" aria-live="polite">
                {currentStockLabel}
              </p>
            )}

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => handleViewDetails(currentProduct)}
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#653A3A] px-8 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#4f2c2c] active:scale-[0.98]"
              >
                View Product
              </button>

              <button
                type="button"
                disabled={!currentInStock}
                onClick={() =>
                  currentProduct.hasVariants
                    ? handleViewDetails(currentProduct)
                    : handleAddToCart(currentProduct)
                }
                className="inline-flex min-h-12 items-center gap-2 rounded-full border border-stone-300 bg-white px-6 py-3 text-sm font-semibold text-stone-800 transition hover:border-stone-500 hover:bg-stone-50 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ShoppingCart size={17} strokeWidth={1.8} />
                {!currentInStock
                  ? currentStockOverview.isZeroStock
                    ? "Sold out"
                    : "Unavailable"
                  : currentProduct.hasVariants
                    ? "Choose options"
                    : "Add to cart"}
              </button>
            </div>

            {products.length > 1 && (
              <div className="mt-8 flex max-w-2xl items-center justify-between gap-4 border-t border-stone-200 pt-5">
                <div className="flex shrink-0 items-center gap-3">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-600">
                    Explore
                  </span>
                  <span className="text-xs font-semibold tabular-nums text-stone-700">
                    {String(safeIndex + 1).padStart(2, "0")} / {String(products.length).padStart(2, "0")}
                  </span>
                </div>
                <div className="flex max-w-[65%] items-center justify-end gap-1.5 overflow-x-auto py-1">
                  {products.map((p, i) => (
                    <button
                      key={p.id}
                      type="button"
                      aria-label={`View ${p.name}`}
                      aria-current={i === safeIndex ? "true" : undefined}
                      onClick={() => setIndex(i)}
                      className="flex h-11 min-w-11 shrink-0 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#653A3A] focus-visible:ring-offset-2"
                    >
                      <span
                        aria-hidden="true"
                        className={`block rounded-full transition-all duration-300 ${
                          i === safeIndex
                            ? "h-[3px] w-8 bg-[#653A3A]"
                            : "h-2 w-2 bg-stone-400 hover:bg-stone-600"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
