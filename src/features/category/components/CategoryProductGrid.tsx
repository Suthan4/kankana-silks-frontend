"use client";

import type { Product, ProductVariant } from "@/lib/api/product.api";
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

  if (isLoading && products.length === 0) {
    return <ProductGridSkeleton count={6} className="grid grid-cols-2 gap-px bg-gray-100 md:grid-cols-3" />;
  }

  if (!isFetching && products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-40">
        <p className="mb-6 text-xs uppercase tracking-widest text-gray-400">No products found</p>
        <button
          type="button"
          onClick={onClearFilters}
          className="border border-black px-6 py-2 text-xs uppercase tracking-widest transition-colors hover:bg-black hover:text-white"
        >
          Clear Filters
        </button>
      </div>
    );
  }

  if (isFetching) return <ProductGridSkeleton count={6} className={gridClass} />;

  return (
    <div className={gridClass}>
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
            onToggleWishlist={() => onToggleWishlist(product.id)}
            onViewOptions={() => onViewOptions(product)}
            onRequestProduct={() => onRequestProduct(product, selectedVariant)}
            onAddToCart={() => onAddToCart(product, selectedVariant)}
            onIncrease={() => onIncrease(product, selectedVariant, cartItem)}
            onDecrease={() => onDecrease(cartItem)}
          />
        );
      })}
    </div>
  );
}
