"use client";

import { Product } from "@/lib/api/home-section.api";
import { useEffect, useId, useRef, useState } from "react";
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

const stripHtml = (html?: string) => (html ? html.replace(/<[^>]+>/g, "") : "");
const inr = (value: number | string) => Number(value).toLocaleString("en-IN");
const isInStock = (p: Product) => p.stock?.some((s) => s.quantity > 0);

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
  const paginationClass = `carousel-pagination-${useId().replace(/:/g, "")}`;

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
  const currentInStock = isInStock(currentProduct);
  const currentDiscount =
    Number(currentProduct.basePrice) > Number(currentProduct.sellingPrice);

  const handleAddToCart = async (product: Product) => {
    const availableStock = product.stock?.[0]?.quantity ?? 0;
    if (availableStock === 0) {
      toast.error("Out of stock");
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
          stock: product.stock || [],
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
      className="pb-10 pt-10 md:pb-14 md:pt-14"
      style={{ backgroundColor, color: textColor }}
    >
      {(showTitle || (showSubtitle && subtitle)) && (
        <div className="mb-6 px-4 text-center md:mb-10">
          {showTitle && (
            <h2 className="text-2xl font-semibold tracking-tight md:text-4xl">
              {title || "Best of One"}
            </h2>
          )}
          {showSubtitle && subtitle && (
            <p className="mx-auto mt-2 max-w-2xl text-sm opacity-70 md:text-base">
              {subtitle}
            </p>
          )}
        </div>
      )}

      {/* MOBILE: horizontal card swiper */}
      <div className="md:hidden">
        <Swiper
          modules={[Autoplay, Pagination]}
          onSwiper={(s) => (swiperRef.current = s)}
          onSlideChange={(s) => setIndex(s.realIndex)}
          loop={products.length > 2}
          autoplay={{ delay: 6000, disableOnInteraction: false }}
          pagination={{ clickable: true, el: `.${paginationClass}` }}
          slidesPerView={1.08}
          centeredSlides
          spaceBetween={12}
        >
          {products.map((product) => {
            const inStock = isInStock(product);
            const hasDiscount =
              Number(product.basePrice) > Number(product.sellingPrice);

            return (
              <SwiperSlide key={product.id}>
                <div
                  onClick={() => handleViewDetails(product)}
                  className="group flex h-64 cursor-pointer overflow-hidden border border-gray-200 bg-white text-gray-900 shadow-sm transition active:scale-[0.99]"
                >
                  {/* Image */}
                  <div className="relative w-[46%] shrink-0 overflow-hidden bg-gray-50">
                    {product.media?.[0]?.url ? (
                      <img
                        src={product.media[0].url}
                        alt={product.name}
                        loading="lazy"
                        className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                        No image
                      </div>
                    )}
                    <div
                      className="absolute left-2.5 top-2.5 z-10"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <WishlistButton
                        productId={product.id}
                        variant="icon"
                        size="sm"
                        className="rounded-none bg-white/80 p-1.5 shadow-sm backdrop-blur-md transition hover:bg-white"
                      />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex min-w-0 flex-1 flex-col justify-between p-4">
                    <div>
                      <h3 className="line-clamp-2 text-sm font-semibold leading-snug">
                        {product.name}
                      </h3>
                      {product.description && (
                        <p className="mt-1.5 line-clamp-3 text-xs leading-relaxed text-gray-500">
                          {stripHtml(product.description)}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col gap-2.5 border-t border-gray-100 pt-2.5">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-base font-bold">
                          ₹{inr(product.sellingPrice)}
                        </span>
                        {hasDiscount && (
                          <span className="text-xs text-gray-400 line-through">
                            ₹{inr(product.basePrice)}
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        disabled={!inStock}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(product);
                        }}
                        className="w-full bg-black py-2 text-xs font-medium text-white transition active:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300"
                      >
                        {inStock ? "Add to cart" : "Sold out"}
                      </button>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>

        <div
          className={`${paginationClass} mt-4 flex justify-center gap-1.5`}
        />
      </div>

      {/* TABLET + DESKTOP: image and details, grouped and centered */}
      <div className="hidden w-full md:block">
        <div className="mx-auto grid w-full max-w-5xl items-center gap-8 px-6 md:grid-cols-[minmax(0,380px)_minmax(0,1fr)] lg:grid-cols-[minmax(0,460px)_minmax(0,1fr)] lg:gap-14 lg:px-10">
          {/* Image */}
          <div className="group relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-[#f7f7f5]">
            {currentProduct.media?.[0]?.url ? (
              <img
                key={currentProduct.id}
                src={currentProduct.media[0].url}
                alt={currentProduct.name}
                className="h-full w-full object-cover object-top transition duration-500 ease-out group-hover:scale-[1.02]"
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
            <p className="mb-3 text-[11px] uppercase tracking-[0.22em] opacity-50">
              {currentProduct.category?.name || "Collection"}
            </p>

            <h3 className="max-w-xl text-2xl font-semibold leading-tight tracking-tight lg:text-3xl xl:text-4xl">
              {currentProduct.name}
            </h3>

            {currentProduct.description && (
              <p className="mt-4 line-clamp-3 max-w-xl text-sm leading-7 opacity-60 lg:text-[15px]">
                {stripHtml(currentProduct.description)}
              </p>
            )}

            <div className="mt-5 flex items-baseline gap-3">
              <span className="text-2xl font-medium tracking-tight lg:text-3xl">
                ₹{inr(currentProduct.sellingPrice)}
              </span>
              {currentDiscount && (
                <span className="text-sm text-gray-400 line-through lg:text-base">
                  ₹{inr(currentProduct.basePrice)}
                </span>
              )}
            </div>

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
                onClick={() => handleAddToCart(currentProduct)}
                className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-5 py-3 text-sm font-medium text-gray-700 transition hover:border-gray-400 hover:bg-gray-50 hover:text-black active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ShoppingCart size={17} strokeWidth={1.8} />
                {currentInStock ? "Add to cart" : "Sold out"}
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
