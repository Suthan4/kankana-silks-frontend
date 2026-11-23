"use client";

import type { Product, ProductVariant } from "@/lib/api/product.api";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import type { CartLineLike } from "@/lib/utils/cartItems";
import { CategoryProductCard } from "./CategoryProductCard";
import { ProductGridSkeleton } from "./CategoryProductsSkeleton";

interface CategoryProductGridProps {
  products: Product[];
  isLoading: boolean;
  isFetching: boolean;
  mobileGrid: 1 | 2;
  gridCols: 2 | 3 | 4;
  getCartItem: (productId: string, variantId: string | null) => CartLineLike | null;
  isOutOfStock: (product: Product) => boolean;
  canAddToCart: (product: Product) => boolean;
  isWishlisted: (productId: string) => boolean;
  isAddingToCart: boolean;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  onAddToCart: (product: Product, variant: ProductVariant | null) => void;
  onIncrease: (product: Product, variant: ProductVariant | null, item: CartLineLike | null) => void;
  onDecrease: (item: CartLineLike | null) => void;
  onToggleWishlist: (productId: string) => void;
  onViewOptions: (product: Product) => void;
  onRequestProduct: (product: Product, variant: ProductVariant | null) => void;
}

export function CategoryProductGrid({
  products,
  isLoading,
  isFetching,
  mobileGrid,
  gridCols,
  getCartItem,
  isOutOfStock,
  canAddToCart,
  isWishlisted,
  isAddingToCart,
  hasActiveFilters,
  onClearFilters,
  onAddToCart,
  onIncrease,
  onDecrease,
  onToggleWishlist,
  onViewOptions,
  onRequestProduct,
}: CategoryProductGridProps) {
  const gridClass = `grid ${mobileGrid === 1 ? "grid-cols-1" : "grid-cols-2"} ${
    gridCols === 2
      ? "md:grid-cols-3 xl:grid-cols-3"
      : gridCols === 3
        ? "md:grid-cols-4 xl:grid-cols-4"
        : "md:grid-cols-5 xl:grid-cols-5"
  } gap-x-3 md:gap-x-6 gap-y-8 md:gap-y-12`;

  if ((isLoading || isFetching) && products.length === 0) {
    return <ProductGridSkeleton count={6} className="grid grid-cols-2 gap-px bg-gray-100 md:grid-cols-3" />;
  }

  if (!isFetching && products.length === 0) {
    return (
      <section
        role="status"
        aria-live="polite"
        className="mx-auto w-full max-w-3xl px-4 py-10 sm:py-14"
      >
        <div className="brand-soft-surface relative overflow-hidden rounded-2xl px-5 py-9 text-center shadow-[0_12px_40px_rgba(91,54,67,0.06)] sm:px-10 sm:py-12">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full bg-brand-primary-muted/60 blur-2xl"
          />
          <div className="relative mx-auto flex max-w-xl flex-col items-center">
            <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-brand-border bg-white/85 text-brand-primary">
              <Sparkles className="h-5 w-5" aria-hidden="true" />
            </span>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-brand-primary">
              {hasActiveFilters ? "A little adjustment" : "Coming soon"}
            </p>
            <h2 className="mt-2 text-xl font-semibold tracking-tight text-brand-primary-deep sm:text-2xl">
              {hasActiveFilters
                ? "No sarees match these filters"
                : "We're preparing something beautiful"}
            </h2>
            <p className="mt-3 max-w-lg text-sm leading-6 text-stone-700 sm:text-base">
              {hasActiveFilters
                ? "Try changing the fabric, price range or subcategory to see more styles."
                : "We're adding new saree designs to this collection. Please check back soon, or explore our other collections in the meantime."}
            </p>
            {hasActiveFilters ? (
              <button
                type="button"
                onClick={onClearFilters}
                className="brand-button mt-6 rounded-full px-6"
              >
                Clear filters
              </button>
            ) : (
              <Link
                href="/shop"
                className="brand-button mt-6 rounded-full px-6"
              >
                Explore all collections
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            )}
          </div>
        </div>
      </section>
    );
  }

  return (
    <div className={gridClass} aria-busy={isFetching}>
      {products.map((product, index) => {
        const variants = product.variants ?? [];
        const hasVariants = product.hasVariants && variants.length > 0;
        const selectedVariant = hasVariants && variants.length === 1
          ? variants[0] ?? null
          : null;
        const cartItem = getCartItem(product.id, selectedVariant?.id ?? null);

        return (
          <CategoryProductCard
            key={product.id}
            product={product}
            index={index}
            isOutOfStock={isOutOfStock(product)}
            showAddToCart={canAddToCart(product)}
            selectedVariant={selectedVariant}
            cartItem={cartItem}
            isWishlisted={isWishlisted(product.id)}
            isAddingToCart={isAddingToCart}
            onToggleWishlist={onToggleWishlist}
            onViewOptions={onViewOptions}
            onRequestProduct={onRequestProduct}
            onAddToCart={onAddToCart}
            onIncrease={onIncrease}
            onDecrease={onDecrease}
          />
        );
      })}
    </div>
  );
}
