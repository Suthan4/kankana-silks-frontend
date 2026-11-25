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
import { Autoplay, Pagination } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";

import "swiper/css";
import "swiper/css/pagination";
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
  const paginationRef = useRef<HTMLDivElement | null>(null);
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
      className="pb-8 pt-8 md:pb-12 md:pt-12 lg:pb-14 lg:pt-14"
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
      <div className="md:hidden">
        <Swiper
          modules={[Autoplay, Pagination]}
          onSwiper={(s) => (swiperRef.current = s)}
          onSlideChange={(s) => setIndex(s.realIndex)}
          onBeforeInit={(swiper) => {
            const pagination = swiper.params.pagination;

            if (pagination && typeof pagination !== "boolean") {
              swiper.params.pagination = {
                ...pagination,
                el: paginationRef.current,
              };
            }
          }}
          loop={products.length > 2}
          autoplay={{ delay: 6000, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          slidesPerView={1.08}
          centeredSlides
          spaceBetween={12}
        >
          {products.map((product) => {
            const stockOverview = getProductStockOverview(product);
            const stockLabel = stockOverview.isOutOfStock
              ? null
              : getProductStockLabel(stockOverview);
            const inStock = !stockOverview.isOutOfStock;

            return (
              <SwiperSlide key={product.id}>
                <article className="mx-2 overflow-hidden rounded-2xl bg-white text-black shadow-sm">
                  <button
                    type="button"
                    aria-label={`View ${product.name}`}
                    onClick={() => handleViewDetails(product)}
                    className="relative block aspect-[4/5] w-full overflow-hidden bg-[#f7f7f5]"
                  >
                    {product.media?.[0]?.url ? (
                      <SmartImage
                        src={product.media[0].url}
                        alt={product.name}
                        fill
                        sizes="(max-width: 768px) 92vw"
                        className="object-cover object-top"
                      />
                    ) : (
                      <span className="flex h-full items-center justify-center text-sm text-gray-400">
                        No image available
                      </span>
                    )}
                  </button>

                  <div className="p-4">
                    <p className="text-[11px] uppercase tracking-[0.18em] opacity-60">
                      {product.category?.name || "Collection"}
                    </p>
                    <h3 className="mt-1 line-clamp-2 text-base font-semibold">
                      {product.name}
                    </h3>
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <span className="font-medium">
                        {stockOverview.isZeroStock
                          ? formatMaskedPrice(Number(product.sellingPrice))
                          : `₹${inr(product.sellingPrice)}`}
                      </span>
                      <button
                        type="button"
                        disabled={!inStock}
                        onClick={() =>
                          product.hasVariants
                            ? handleViewDetails(product)
                            : handleAddToCart(product)
                        }
                        className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 px-3 py-2 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <ShoppingCart size={14} />
                        {!inStock
                          ? stockOverview.isZeroStock
                            ? "Sold out"
                            : "Unavailable"
                          : product.hasVariants
                            ? "Options"
                            : "Add"}
                      </button>
                    </div>
                    {stockLabel && (
                      <p
                        className="mt-2 min-h-4 text-[11px] font-medium leading-4 text-stone-500"
                        aria-live="polite"
                      >
                        {stockLabel}
                      </p>
                    )}
                  </div>
                </article>
              </SwiperSlide>
            );
          })}
        </Swiper>

        <div
          ref={paginationRef}
          className="mt-4 flex justify-center gap-1.5"
        />
      </div>

      {/* TABLET + DESKTOP: image and details, grouped and centered */}
      <div className="hidden w-full md:block">
        <div className="mx-auto grid w-full max-w-6xl items-center gap-8 px-6 md:grid-cols-[minmax(0,440px)_minmax(0,1fr)] lg:grid-cols-[minmax(0,500px)_minmax(0,1fr)] lg:gap-16 lg:px-10">
          {/* Image */}
          <div className="group relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-[#f7f7f5]">
            {currentProduct.media?.[0]?.url ? (
              <SmartImage
                key={currentProduct.id}
                src={currentProduct.media[0].url}
                alt={currentProduct.name}
                fill
                sizes="(min-width: 1024px) 500px, 440px"
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
              <p className="mt-4 line-clamp-3 max-w-xl text-sm leading-7 opacity-75 lg:text-[15px]">
                {stripHtml(currentProduct.description)}
              </p>
            )}

            <div className="mt-5 flex items-baseline gap-3">
              <span className="text-2xl font-medium tracking-tight lg:text-3xl">
                {currentStockOverview.isZeroStock
                  ? formatMaskedPrice(Number(currentProduct.sellingPrice))
                  : `₹${inr(currentProduct.sellingPrice)}`}
              </span>
              {currentDiscount && (
                <span className="text-sm text-gray-500 line-through lg:text-base">
                  ₹{inr(currentProduct.basePrice)}
                </span>
              )}
            </div>

            {currentStockLabel && (
              <p className="mt-2 text-sm font-medium text-stone-500" aria-live="polite">
                {currentStockLabel}
              </p>
            )}

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => handleViewDetails(currentProduct)}
                className="inline-flex items-center justify-center rounded-full bg-black px-7 py-3 text-sm font-medium text-white transition hover:bg-gray-800 active:scale-[0.98]"
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
                className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-5 py-3 text-sm font-medium text-gray-700 transition hover:border-gray-400 hover:bg-gray-50 hover:text-black active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
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
              <>
                <div className="mt-8 h-px w-full max-w-xl bg-gray-100" />
                <div className="mt-5 flex items-center gap-3">
                  <span className="mr-2 text-[11px] uppercase tracking-[0.18em] opacity-50">
                    Explore
                  </span>
                  {products.map((p, i) => (
                    <button
                      key={p.id}
                      type="button"
                      aria-label={`View product ${i + 1}`}
                      onClick={() => setIndex(i)}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        i === safeIndex
                          ? "w-8 bg-black"
                          : "w-2 bg-gray-300 hover:bg-gray-500"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
