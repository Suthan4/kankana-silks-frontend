"use client";

import { Product } from "@/lib/api/home-section.api";
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
} from "lucide-react";
import { useRouter } from "next/navigation";
import WishlistButton from "../ui/WishlistButton";
import { toast } from "sonner";
import { useCartStore } from "@/store/useCartStore";
import { useCartDrawer } from "@/store/useCartDrawer";
import { cartApi } from "@/lib/api/cart.api";
import { useAuthModal } from "@/store/useAuthModalStore";
import { useQueryClient } from "@tanstack/react-query";
import { Rozha_One } from "next/font/google";

import SmartImage from "../common/smartImage";
import HomeSectionHeading from "../common/homeSectionHeading";
import {
  getCartItemStockMessage,
  getProductStockLabel,
  getProductStockOverview,
} from "@/lib/utils/cartStock";
import { formatMaskedPrice } from "@/lib/utils/priceMasked";
import styles from "./ProductCarousel.module.css";

const display = Rozha_One({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const stripHtml = (html?: string) => (html ? html.replace(/<[^>]+>/g, "") : "");
const inr = (value: number | string) => Number(value).toLocaleString("en-IN");
const letters = (s: string) => s.replace(/[^\p{L}]/gu, "");

/** Longest 4–10 letter word among the first three words of the name, else the category. Kept for existing imports. */
export const defaultWordFor = (p: Product): string => {
  const fromName = ((p.name ?? "") as string)
    .split(/\s+/)
    .slice(0, 3)
    .map(letters)
    .filter((w: string) => w.length >= 4 && w.length <= 10)
    .sort((a: string, b: string) => b.length - a.length)[0];
  const word =
    fromName ||
    letters(p.category?.name?.split(/\s+/)[0] ?? "") ||
    letters(p.name ?? "");
  const out = word.slice(0, 10) || "Saree";
  return out.charAt(0).toUpperCase() + out.slice(1);
};

function Photo({
  product,
  alt,
  sizes,
}: {
  product: Product;
  alt: string;
  sizes: string;
}) {
  const url = product.media?.[0]?.url;
  if (!url) {
    return (
      <span className="flex h-full items-center justify-center text-sm text-gray-400">
        No image available
      </span>
    );
  }
  return (
    <SmartImage
      src={url}
      alt={alt}
      fill
      sizes={sizes}
      className="object-cover object-top"
    />
  );
}

export default function ProductCarousel({
  title,
  subtitle,
  products,
  backgroundColor = "#ffffff",
  textColor = "#000000",
  accentColor = "#653A3A",
  showTitle = true,
  showSubtitle = true,
}: {
  title: string;
  subtitle?: string;
  products: Product[];
  backgroundColor?: string;
  textColor?: string;
  /** Colour of the buttons, active thumbnail ring and focus rings. */
  accentColor?: string;
  showTitle?: boolean;
  showSubtitle?: boolean;
  /** @deprecated No longer used. Kept so existing callers still compile. */
  wordFor?: (product: Product) => string;
}) {
  const [index, setIndex] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  const [dir, setDir] = useState<1 | -1>(1);
  const touchX = useRef<number | null>(null);
  const zoomRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { addItem: addToLocalCart } = useCartStore();
  const { open: openCartDrawer } = useCartDrawer();
  const { user } = useAuthModal();
  const queryClient = useQueryClient();

  // Keep index inside range when the product list changes
  useEffect(() => {
    setIndex((i) => (products?.length ? Math.min(i, products.length - 1) : 0));
  }, [products]);

  // The outgoing photo is removed once the wipe has finished
  useEffect(() => {
    if (prev == null) return;
    const t = setTimeout(() => setPrev(null), 950);
    return () => clearTimeout(t);
  }, [prev, index]);

  if (!products?.length) return null;

  const n = products.length;
  const safeIndex = Math.min(Math.max(index, 0), n - 1);
  const current = products[safeIndex];
  const prevProduct =
    prev != null && prev !== safeIndex && prev < n ? products[prev] : null;
  const stock = getProductStockOverview(current);
  const inStock = !stock.isOutOfStock;
  const stockLabel = inStock ? getProductStockLabel(stock) : null;
  const hasDiscount =
    !stock.isZeroStock &&
    Number(current.basePrice) > Number(current.sellingPrice);
  const discount = hasDiscount
    ? Math.round(
        ((Number(current.basePrice) - Number(current.sellingPrice)) /
          Number(current.basePrice)) *
          100,
      )
    : 0;

  const goTo = (target: number, direction: 1 | -1) => {
    if (target === safeIndex) return;
    setDir(direction);
    setPrev(safeIndex);
    setIndex(target);
  };
  const go = (delta: number) =>
    goTo((safeIndex + delta + n) % n, delta > 0 ? 1 : -1);
  const jump = (i: number) => goTo(i, i > safeIndex ? 1 : -1);

  const onKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (n < 2) return;
    if (e.key === "ArrowRight") go(1);
    else if (e.key === "ArrowLeft") go(-1);
  };

  // Desktop hover: the photo zooms slightly and pans with the cursor (no re-render)
  const onFrameMove = (e: PointerEvent<HTMLDivElement>) => {
    const z = zoomRef.current;
    if (!z || e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    z.style.transform = `scale(1.12) translate3d(${(-px * 5).toFixed(2)}%, ${(-py * 5).toFixed(2)}%, 0)`;
  };
  const onFrameLeave = () => {
    if (zoomRef.current) zoomRef.current.style.transform = "";
  };

  const handleViewDetails = (product: Product) => {
    router.push(`/${product.category.slug}/${product.slug}`);
  };

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
          stock:
            product.stock?.map((stock: any) => ({
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

  const photoSizes = "(max-width: 860px) 92vw, 40vw";

  return (
    <section
      className={`${styles.root} ${display.variable}`}
      style={
        {
          "--bg": backgroundColor,
          "--fg": textColor,
          "--accent": accentColor,
        } as CSSProperties
      }
      aria-roledescription="carousel"
      onKeyDown={onKeyDown}
    >
      <HomeSectionHeading
        title={title || "Best of One"}
        subtitle={subtitle}
        showTitle={showTitle}
        showSubtitle={showSubtitle}
        textColor={textColor}
      />

      <div className={`${styles.scene} mt-6 lg:mt-8`}>
        {/* Details */}
        <div key={`d-${current.id}`} className={styles.details}>
          <p className={styles.eyebrow}>
            {current.category?.name || "Collection"}
          </p>
          <h3 className={styles.name}>{current.name}</h3>

          {current.description && (
            <p className="mt-4 line-clamp-3 max-w-md text-sm leading-7 opacity-70 max-[860px]:line-clamp-2 xl:text-base">
              {stripHtml(current.description)}
            </p>
          )}

          <div className="mt-7 flex flex-wrap items-baseline gap-3">
            <span className="text-3xl font-medium tracking-tight">
              {stock.isZeroStock
                ? formatMaskedPrice(Number(current.sellingPrice))
                : `₹${inr(current.sellingPrice)}`}
            </span>
            {hasDiscount && (
              <span className="text-sm font-medium text-gray-600 line-through">
                ₹{inr(current.basePrice)}
              </span>
            )}
          </div>
          {stockLabel && (
            <p
              className="mt-2 text-sm font-medium opacity-70"
              aria-live="polite"
            >
              {stockLabel}
            </p>
          )}

          <div className={`${styles.actions} mt-7`}>
            <button
              type="button"
              onClick={() => handleViewDetails(current)}
              className={styles.primary}
            >
              View Product
              <ArrowUpRight size={17} strokeWidth={1.8} />
            </button>
            <button
              type="button"
              disabled={!inStock}
              onClick={() =>
                current.hasVariants
                  ? handleViewDetails(current)
                  : handleAddToCart(current)
              }
              className={styles.secondary}
            >
              <ShoppingCart size={17} strokeWidth={1.8} />
              {!inStock
                ? stock.isZeroStock
                  ? "Sold out"
                  : "Unavailable"
                : current.hasVariants
                  ? "Choose options"
                  : "Add to cart"}
            </button>
          </div>
        </div>

        {/* Photo */}
        <div className={styles.frameWrap}>
          <div
            className={styles.frame}
            onPointerMove={onFrameMove}
            onPointerLeave={onFrameLeave}
            onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
            onTouchEnd={(e) => {
              if (touchX.current == null) return;
              const dx = e.changedTouches[0].clientX - touchX.current;
              touchX.current = null;
              if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
            }}
          >
            <div ref={zoomRef} className={styles.zoomer}>
              {prevProduct && (
                <div
                  key={`p-${prevProduct.id}`}
                  className={`${styles.layer} ${styles.leave}`}
                  data-dir={dir}
                  aria-hidden="true"
                >
                  <div className={styles.inner}>
                    <Photo product={prevProduct} alt="" sizes={photoSizes} />
                  </div>
                </div>
              )}
              <div
                key={`c-${current.id}`}
                className={`${styles.layer} ${prevProduct ? styles.enter : ""}`}
                data-dir={dir}
              >
                <div className={styles.inner}>
                  <Photo
                    product={current}
                    alt={current.name}
                    sizes={photoSizes}
                  />
                </div>
              </div>
            </div>

            <button
              type="button"
              aria-label={`View ${current.name}`}
              onClick={() => handleViewDetails(current)}
              className={styles.photoBtn}
            />

            {discount > 0 && (
              <span
                className={`${styles.badge} rounded-full bg-white/95 px-3 py-1.5 text-[10px] font-semibold tracking-wide shadow-sm backdrop-blur`}
                style={{ color: accentColor }}
              >
                {discount}% OFF
              </span>
            )}
            <div className={styles.wish}>
              <WishlistButton
                productId={current.id}
                variant="icon"
                size="md"
                className="border border-stone-200/70 bg-white/95 shadow-sm backdrop-blur transition hover:bg-white"
              />
            </div>

            {n > 1 && (
              <div className={styles.bar}>
                <span className={styles.counter} aria-live="polite">
                  {String(safeIndex + 1).padStart(2, "0")} /{" "}
                  {String(n).padStart(2, "0")}
                </span>
                <div className={styles.arrows}>
                  <button
                    type="button"
                    className={styles.arrow}
                    aria-label="Previous product"
                    onClick={() => go(-1)}
                  >
                    <ChevronLeft size={18} strokeWidth={2} />
                  </button>
                  <button
                    type="button"
                    className={styles.arrow}
                    aria-label="Next product"
                    onClick={() => go(1)}
                  >
                    <ChevronRight size={18} strokeWidth={2} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {n > 1 && n <= 6 && (
            <div className={styles.thumbs}>
              {products.map((p, i) => (
                <button
                  key={p.id}
                  type="button"
                  className={styles.thumb}
                  data-active={i === safeIndex}
                  aria-label={`Show ${p.name}`}
                  aria-current={i === safeIndex}
                  onClick={() => jump(i)}
                >
                  <Photo product={p} alt="" sizes="64px" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
