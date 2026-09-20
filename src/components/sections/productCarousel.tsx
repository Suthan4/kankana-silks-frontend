"use client";

import { Product } from "@/lib/api/home-section.api";
import { useState, useRef, useEffect } from "react";
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
  useEffect(() => {
    setIndex((currentIndex) => {
      if (!products.length) return 0;

      return Math.min(currentIndex, products.length - 1);
    });
  }, [products]);
  // Always keep index inside products range
  const safeIndex =
    products.length > 0 ? Math.min(Math.max(index, 0), products.length - 1) : 0;

  const currentProduct = products[safeIndex];

  const router = useRouter();
  const { addItem: addToLocalCart } = useCartStore();
  const { open: openCartDrawer } = useCartDrawer();
  const { user } = useAuthModal();
  const queryClient = useQueryClient();

  if (!products?.length) return null;

  console.log("currentProduct", currentProduct);
  console.log("products", products);

  const next = () => swiperRef.current?.slideNext();
  const prev = () => swiperRef.current?.slidePrev();
  const goTo = (i: number) => swiperRef.current?.slideToLoop(i);

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
        await cartApi.addToCart({
          productId: product.id,
          quantity: 1,
        });
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
    <section className="bg-white text-black pb-6 pt-4 md:pt-0">
      <h2 className="text-center text-3xl md:text-5xl font-semibold tracking-tight mb-4 md:mb-10">
        {title || "Best of One"}
      </h2>

      {/* MOBILE: Edge-to-Edge Large Horizontal Card Carousel */}
      <div className="md:hidden pb-4 pt-1">
        <Swiper
          modules={[Autoplay, Pagination]}
          onSwiper={(s) => (swiperRef.current = s)}
          onSlideChange={(s) => setIndex(s.realIndex)}
          loop={products.length > 1}
          autoplay={{ delay: 6000, disableOnInteraction: false }}
          pagination={{ clickable: true, el: ".carousel-pagination" }}
          slidesPerView={1.05}
          centeredSlides={true}
          spaceBetween={12}
          dir="rtl"
          className="px-3"
        >
          {products.map((product) => (
            <SwiperSlide key={product.id}>
              <div
                onClick={() => handleViewDetails(product)}
                className="group relative bg-white border border-gray-200 shadow-sm overflow-hidden cursor-pointer transition-all active:scale-[0.99] flex h-64 rounded-none"
              >
                {/* Right: Detailed Content Area (Sharp Corners) */}
                <div className="w-[52%] p-4 flex flex-col justify-between bg-white">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2">
                      {product.name}
                    </h3>

                    {product.description && (
                      <p className="text-xs text-gray-500 line-clamp-3 mt-1.5 leading-relaxed">
                        {product.description.replace(/<[^>]+>/g, "")}
                      </p>
                    )}
                  </div>

                  {/* Price & CTA Action Area */}
                  <div className="pt-2.5 border-t border-gray-100 flex flex-col gap-2.5">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-base font-bold text-gray-900">
                        ₹{product.sellingPrice}
                      </span>
                      {product.basePrice !== product.sellingPrice && (
                        <span className="text-xs text-gray-400 line-through">
                          ₹{product.basePrice}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToCart(product);
                      }}
                      className="w-full bg-black text-white py-2 text-xs font-medium transition-all text-center rounded-none active:bg-gray-800"
                    >
                      Add to cart
                    </button>
                  </div>
                </div>
                {/* Left: Larger Image View (Sharp Corners) */}
                <div className="relative w-[48%] shrink-0 bg-gray-50 overflow-hidden">
                  <img
                    src={product.media?.[0]?.url}
                    alt={product.name}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />

                  {/* Wishlist Icon Overlay */}
                  <div
                    className="absolute top-2.5 left-2.5 z-10"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <WishlistButton
                      productId={product.id}
                      variant="icon"
                      size="sm"
                      className="bg-white/80 backdrop-blur-md shadow-sm p-1.5 hover:bg-white transition rounded-none"
                    />
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Pagination Dots */}
        <div className="carousel-pagination flex justify-center gap-1.5 mt-3" />
      </div>

      {/* DESKTOP: Compact Premium Product Showcase */}
      <div className="hidden md:block w-full">
        <div className="max-w-6xl xl:max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] gap-10 lg:gap-14 xl:gap-20 items-center">
            {/* ================= IMAGE ================= */}
            <div className="relative group">
              <div className="relative w-full h-[min(68vh,620px)] rounded-2xl overflow-hidden bg-[#f7f7f5]">
                {currentProduct?.media?.[0]?.url ? (
                  <img
                    key={currentProduct.id}
                    src={currentProduct.media[0].url}
                    alt={currentProduct.name || "Product"}
                    className="
                w-full
                h-full
                object-contain
                transition-all
                duration-500
                ease-out
                group-hover:scale-[1.015]
              "
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-sm text-gray-400">
                    No image available
                  </div>
                )}

                {/* Soft image overlay */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/[0.04] via-transparent to-transparent" />

                {/* ================= PREVIOUS ================= */}
                <button
                  type="button"
                  aria-label="Previous product"
                  onClick={() => {
                    setIndex((i) => (i <= 0 ? products.length - 1 : i - 1));
                  }}
                  className="
              absolute
              left-4
              top-1/2
              -translate-y-1/2
              z-10

              w-10
              h-10

              flex
              items-center
              justify-center

              rounded-full
              bg-white/90
              backdrop-blur-sm

              text-gray-900
              text-xl

              shadow-sm
              border
              border-black/5

              transition-all
              duration-200

              hover:bg-white
              hover:scale-105
              active:scale-95
            "
                >
                  ‹
                </button>

                {/* ================= NEXT ================= */}
                <button
                  type="button"
                  aria-label="Next product"
                  onClick={() => {
                    setIndex((i) => (i >= products.length - 1 ? 0 : i + 1));
                  }}
                  className="
              absolute
              right-4
              top-1/2
              -translate-y-1/2
              z-10

              w-10
              h-10

              flex
              items-center
              justify-center

              rounded-full
              bg-white/90
              backdrop-blur-sm

              text-gray-900
              text-xl

              shadow-sm
              border
              border-black/5

              transition-all
              duration-200

              hover:bg-white
              hover:scale-105
              active:scale-95
            "
                >
                  ›
                </button>

                {/* ================= WISHLIST ================= */}
                <div className="absolute top-4 right-4 z-10">
                  <WishlistButton
                    productId={currentProduct?.id}
                    variant="icon"
                    size="md"
                    className="
                bg-white/95
                backdrop-blur-sm
                shadow-sm
                border
                border-black/5
                hover:bg-white
                transition
              "
                  />
                </div>

                {/* Product counter */}
                {products.length > 1 && (
                  <div
                    className="
              absolute
              bottom-4
              left-4
              z-10

              px-3
              py-1.5

              rounded-full
              bg-white/90
              backdrop-blur-sm

              text-[11px]
              font-medium
              tracking-wide
              text-gray-700

              shadow-sm
            "
                  >
                    {safeIndex + 1} / {products.length}
                  </div>
                )}
              </div>
            </div>

            {/* ================= PRODUCT DETAILS ================= */}
            <div className="flex flex-col justify-center">
              {/* Category */}
              <p
                className="
          text-[11px]
          uppercase
          tracking-[0.22em]
          text-gray-400
          mb-3
        "
              >
                {currentProduct?.category?.name || "Collection"}
              </p>

              {/* Product title */}
              <h3
                className="
          text-3xl
          lg:text-4xl
          xl:text-5xl

          font-semibold
          tracking-tight
          leading-[1.08]

          text-gray-950

          max-w-xl
        "
              >
                {currentProduct?.name}
              </h3>

              {/* Description */}
              {currentProduct?.description && (
                <p
                  className="
            mt-4
            max-w-xl

            text-sm
            lg:text-[15px]

            leading-7
            text-gray-500

            line-clamp-3
          "
                >
                  {currentProduct.description.replace(/<[^>]+>/g, "")}
                </p>
              )}

              {/* Price */}
              <div className="flex items-baseline gap-3 mt-6">
                <span
                  className="
            text-2xl
            lg:text-3xl

            font-medium
            tracking-tight
            text-gray-950
          "
                >
                  ₹{currentProduct?.sellingPrice}
                </span>

                {currentProduct?.basePrice !== currentProduct?.sellingPrice && (
                  <span
                    className="
              text-sm
              lg:text-base
              text-gray-400
              line-through
            "
                  >
                    ₹{currentProduct?.basePrice}
                  </span>
                )}
              </div>

              {/* Actions */}
              <div
                className="
          flex
          items-center
          gap-3
          mt-7
        "
              >
                <button
                  type="button"
                  onClick={() => handleViewDetails(currentProduct)}
                  className="
              inline-flex
              items-center
              justify-center

              bg-black
              text-white

              px-7
              py-3

              rounded-full

              text-sm
              font-medium

              transition-all
              duration-200

              hover:bg-gray-800
              hover:scale-[1.02]
              active:scale-[0.98]
            "
                >
                  View Product
                </button>

                <button
                  type="button"
                  onClick={() => handleAddToCart(currentProduct)}
                  className="
              inline-flex
              items-center
              gap-2

              px-5
              py-3

              rounded-full

              border
              border-gray-200

              text-sm
              font-medium
              text-gray-700

              transition-all
              duration-200

              hover:border-gray-400
              hover:text-black
              hover:bg-gray-50
              active:scale-[0.98]
            "
                >
                  <ShoppingCart size={17} strokeWidth={1.8} />
                  Add to cart
                </button>
              </div>

              {/* Divider */}
              <div className="w-full max-w-xl h-px bg-gray-100 mt-8" />

              {/* Product navigation */}
              <div className="flex items-center gap-3 mt-5">
                <span
                  className="
            text-[11px]
            uppercase
            tracking-[0.18em]
            text-gray-400
            mr-2
          "
                >
                  Explore
                </span>

                {products.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    aria-label={`View product ${i + 1}`}
                    onClick={() => setIndex(i)}
                    className={`
                h-1.5
                rounded-full
                transition-all
                duration-300

                ${
                  i === safeIndex
                    ? "w-8 bg-black"
                    : "w-2 bg-gray-300 hover:bg-gray-500"
                }
              `}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
