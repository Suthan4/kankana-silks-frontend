"use client";

import { Product } from "@/lib/api/home-section.api";
import { useState, useRef } from "react";
import { ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";
import WishlistButton from "../ui/WishlistButton";
import { toast } from "sonner";
import { useCartStore } from "@/store/useCartStore";
import { cartApi } from "@/lib/api/cart.api";
import { useAuthModal } from "@/store/useAuthModalStore";

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

  const router = useRouter();
  const { addItem: addToLocalCart } = useCartStore();
  const { user } = useAuthModal();

  if (!products?.length) return null;

  const currentProduct = products[index];

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

      toast.success("Added to cart");

      if (user) {
        await cartApi.addToCart({
          productId: product.id,
          quantity: 1,
        });
      }
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
          className="px-3"
        >
          {products.map((product) => (
            <SwiperSlide key={product.id}>
              <div
                onClick={() => handleViewDetails(product)}
                className="group relative bg-white border border-gray-200 shadow-sm overflow-hidden cursor-pointer transition-all active:scale-[0.99] flex h-64 rounded-none"
              >
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
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Pagination Dots */}
        <div className="carousel-pagination flex justify-center gap-1.5 mt-3" />
      </div>

      {/* DESKTOP: split layout with arrows */}
      <div className="hidden md:block max-w-7xl mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="relative group">
            <div className="aspect-[2/3] rounded-2xl overflow-hidden bg-gray-100">
              <img
                src={currentProduct.media?.[0]?.url}
                alt={currentProduct.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
              />
            </div>

            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent rounded-2xl" />

            <button
              onClick={() =>
                setIndex((i) => (i - 1 + products.length) % products.length)
              }
              className="flex absolute left-4 top-1/2 -translate-y-1/2 bg-white/70 px-3 py-2 rounded-full opacity-0 group-hover:opacity-100 transition"
            >
              ‹
            </button>
            <button
              onClick={() => setIndex((i) => (i + 1) % products.length)}
              className="flex absolute right-4 top-1/2 -translate-y-1/2 bg-white/70 px-3 py-2 rounded-full opacity-0 group-hover:opacity-100 transition"
            >
              ›
            </button>

            <div className="absolute top-4 right-4">
              <WishlistButton
                productId={currentProduct.id}
                variant="icon"
                size="md"
                className="bg-white shadow"
              />
            </div>
          </div>

          <div className="space-y-6">
            <p className="text-xs uppercase tracking-widest text-gray-400">
              {currentProduct.category?.name}
            </p>
            <h3 className="text-2xl md:text-5xl font-semibold leading-tight">
              {currentProduct.name}
            </h3>
            <p className="text-sm md:text-base text-gray-600 line-clamp-2">
              {currentProduct.description?.replace(/<[^>]+>/g, "")}
            </p>
            <div className="flex items-center gap-3">
              <span className="text-2xl md:text-3xl font-medium">
                ₹{currentProduct.sellingPrice}
              </span>
              {currentProduct.basePrice !== currentProduct.sellingPrice && (
                <span className="text-gray-400 line-through">
                  ₹{currentProduct.basePrice}
                </span>
              )}
            </div>
            <div className="flex items-center gap-4 pt-4">
              <button
                onClick={() => handleViewDetails(currentProduct)}
                className="bg-black text-white px-6 py-3 rounded-full text-sm hover:opacity-80 transition"
              >
                View Product
              </button>
              <button
                onClick={() => handleAddToCart(currentProduct)}
                className="flex items-center gap-2 text-sm text-gray-700 hover:text-black transition"
              >
                <ShoppingCart size={18} />
                Add
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-2 mt-10">
          {products.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? "w-6 bg-black" : "w-2 bg-gray-300"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
