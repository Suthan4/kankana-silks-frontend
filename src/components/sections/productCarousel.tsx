"use client";

import { Product } from "@/lib/api/home-section.api";
import { useState, useEffect } from "react";
import { ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";
import WishlistButton from "../ui/WishlistButton";
import { toast } from "sonner";
import { useCartStore } from "@/store/useCartStore";
import { cartApi } from "@/lib/api/cart.api";
import { useAuthModal } from "@/store/useAuthModalStore";

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

  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const router = useRouter();
  const { addItem: addToLocalCart } = useCartStore();
  const { user } = useAuthModal();

  if (!products?.length) return null;

  const currentProduct = products[index];

  const next = () => setIndex((i) => (i + 1) % products.length);
  const prev = () =>
    setIndex((i) => (i - 1 + products.length) % products.length);

  // 🔥 YOUR LOGIC ADDED
  const handleAddToCart = async () => {
    const product = currentProduct;
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

  const handleViewDetails = () => {
    router.push(`/${currentProduct.category.slug}/${currentProduct.slug}`);
  };

  // autoplay
  useEffect(() => {
    const interval = setInterval(next, 6000);
    return () => clearInterval(interval);
  }, [index]);

  // swipe
  const minSwipe = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const dist = touchStart - touchEnd;

    if (dist > minSwipe) next();
    if (dist < -minSwipe) prev();
  };

  return (
    <section className="bg-white text-black py-16 md:py-24">
      <h2 className="text-center text-3xl md:text-5xl font-semibold tracking-tight mb-12">
        Best of One
      </h2>

      <div
        className="max-w-7xl mx-auto px-4"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* IMAGE */}
          <div className="relative group">
            <img
              src={currentProduct.media?.[0]?.url}
              alt={currentProduct.name}
              className="w-full h-[60vh] md:h-[75vh] object-cover rounded-2xl transition-transform duration-700 group-hover:scale-[1.03]"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent rounded-2xl" />

            {/* arrows */}
            <button
              onClick={prev}
              className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 bg-white/70 px-3 py-2 rounded-full opacity-0 group-hover:opacity-100 transition"
            >
              ‹
            </button>

            <button
              onClick={next}
              className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 bg-white/70 px-3 py-2 rounded-full opacity-0 group-hover:opacity-100 transition"
            >
              ›
            </button>

            {/* wishlist */}
            <div className="absolute top-4 right-4">
              <WishlistButton
                productId={currentProduct.id}
                variant="icon"
                size="md"
                className="bg-white shadow"
              />
            </div>
          </div>

          {/* TEXT */}
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

            {/* ACTIONS */}
            <div className="flex items-center gap-4 pt-4">
              <button
                onClick={handleViewDetails}
                className="bg-black text-white px-6 py-3 rounded-full text-sm hover:opacity-80 transition"
              >
                View Product
              </button>

              <button
                onClick={handleAddToCart}
                className="flex items-center gap-2 text-sm text-gray-700 hover:text-black transition"
              >
                <ShoppingCart size={18} />
                Add
              </button>
            </div>
          </div>
        </div>

        {/* dots */}
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
