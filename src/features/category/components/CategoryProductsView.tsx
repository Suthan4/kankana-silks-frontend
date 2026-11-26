"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Product, ProductVariant } from "@/lib/api/product.api";
import { useWishlist } from "@/hooks/useWishlist";
import ProductRequestModal from "@/components/productRequestModal";
import { CategoryFilterSidebar } from "./CategoryFilterSidebar";
import { CategoryMobileHeader } from "./CategoryMobileHeader";
import { CategoryDesktopToolbar } from "./CategoryDesktopToolbar";
import { CategoryMobileFilters } from "./CategoryMobileFilters";
import { CategoryProductGrid } from "./CategoryProductGrid";
import { CategoryPagination } from "./CategoryPagination";
import { CategoryErrorState } from "./CategoryErrorState";
import { useCategoryFilters } from "../hooks/useCategoryFilters";
import { useCategoryProductQuery } from "../hooks/useCategoryProductQuery";
import { useCategoryCart } from "../hooks/useCategoryCart";
import { useCategoryPageUI } from "../hooks/useCategoryPageUI";
import { useCategorySubcategoryScroller } from "../hooks/useCategorySubcategoryScroller";
import { isProductOutOfStock, isProductUnavailable } from "../utils/inventory";
import type { CategoryProductsClientProps } from "../types";

export function CategoryProductsView({
  category,
  initialProducts,
}: CategoryProductsClientProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const filters = useCategoryFilters(category);
  const productsQuery = useCategoryProductQuery({
    categorySlug: category.slug,
    queryParams: filters.queryParams,
    isDefaultQuery: filters.isDefaultQuery,
    initialProducts,
  });
  const cart = useCategoryCart();
  const wishlist = useWishlist();
  const ui = useCategoryPageUI(cart.user);
  const [hasOpenedRequestModal, setHasOpenedRequestModal] = useState(false);
  const [lastRequestProduct, setLastRequestProduct] = useState<Product | null>(null);
  const [lastRequestVariant, setLastRequestVariant] = useState<ProductVariant | null>(null);

  useEffect(() => {
    if (!ui.requestProduct) return;
    setLastRequestProduct(ui.requestProduct);
    setLastRequestVariant(ui.requestVariant);
    setHasOpenedRequestModal(true);
  }, [ui.requestProduct, ui.requestVariant]);
  const scroller = useCategorySubcategoryScroller(category.children);
  const canAddProductToCart = useCallback(
    (product: Product) => !isProductUnavailable(product),
    [],
  );
  const handleViewOptions = useCallback((product: Product) => {
    router.push(`/${product.category?.slug}/${product.slug}`);
    toast.info("Please select product options");
  }, [router]);
  const handleRequestProduct = useCallback((
    product: Product,
    variant: ProductVariant | null,
  ) => ui.openRequestModal(product, variant), [ui.openRequestModal]);

  if (productsQuery.isError) {
    return (
      <CategoryErrorState
        message={productsQuery.error instanceof Error ? productsQuery.error.message : "Unknown error occurred"}
        onRetry={() => queryClient.invalidateQueries({ queryKey: ["products"] })}
      />
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <CategoryMobileHeader
        categoryName={category.name}
        total={productsQuery.total}
        grid={ui.mobileGrid}
        wishlistCount={ui.isMounted ? wishlist.wishlistCount : 0}
        sortBy={filters.sortBy}
        onGridChange={ui.setMobileGrid}
        onSortChange={filters.handleSortChange}
      />

      <div className="mx-auto max-w-[1450px]">
        <CategoryDesktopToolbar
          category={category}
          total={productsQuery.total}
          selectedSubCategory={filters.selectedSubCategory}
          showLeftArrow={scroller.showLeftArrow}
          showRightArrow={scroller.showRightArrow}
          scrollRef={scroller.scrollRef}
          gridCols={ui.gridCols}
          filterOpen={ui.desktopFilterOpen}
          sortBy={filters.sortBy}
          onSubCategoryChange={filters.handleSubCategoryChange}
          onScrollCategories={scroller.scrollCategories}
          onGridChange={ui.setGridCols}
          onFilterToggle={() => ui.setDesktopFilterOpen((open) => !open)}
          onSortChange={filters.handleSortChange}
        />

        <div className="flex">
          <AnimatePresence>
            {ui.desktopFilterOpen && (
              <motion.aside
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 260 }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="hidden flex-shrink-0 overflow-hidden border-r border-gray-100 xl:block"
              >
                <div className="w-[260px] p-6 pt-8">
                  <CategoryFilterSidebar
                    category={category}
                    selectedSubCategory={filters.selectedSubCategory}
                    onSubCategoryChange={filters.handleSubCategoryChange}
                    onClearFilters={filters.clearAllFilters}
                    priceRange={filters.priceRange}
                    onPriceRangeChange={filters.handlePriceRangeChange}
                    materials={filters.materials}
                    selectedFabric={filters.selectedFabric}
                    onFabricChange={filters.handleFabricChange}
                  />
                </div>
              </motion.aside>
            )}
          </AnimatePresence>

          <div className="min-w-0 flex-1 px-4 pb-16 pt-5 md:px-8 md:pt-8 xl:px-10">
            <CategoryProductGrid
              products={productsQuery.products}
              isLoading={productsQuery.isLoading}
              isFetching={productsQuery.isFetching}
              mobileGrid={ui.mobileGrid}
              gridCols={ui.gridCols}
              getCartItem={cart.getCartItem}
              isOutOfStock={isProductOutOfStock}
              canAddToCart={canAddProductToCart}
              isWishlisted={wishlist.isProductWishlisted}
              isAddingToCart={cart.isAddingToCart}
              hasActiveFilters={filters.hasActiveFilters}
              onClearFilters={filters.clearAllFilters}
              onAddToCart={cart.addProduct}
              onIncrease={cart.increaseQuantity}
              onDecrease={cart.decreaseQuantity}
              onToggleWishlist={wishlist.toggleWishlist}
              onViewOptions={handleViewOptions}
              onRequestProduct={handleRequestProduct}
            />
            <CategoryPagination
              currentPage={productsQuery.currentPage}
              totalPages={productsQuery.totalPages}
              isLoading={productsQuery.isLoading}
              onPageChange={filters.handlePageChange}
            />
          </div>
        </div>
      </div>

      <CategoryMobileFilters
        open={ui.mobileFilterOpen}
        total={productsQuery.total}
        category={category}
        selectedSubCategory={filters.selectedSubCategory}
        priceRange={filters.priceRange}
        selectedFabric={filters.selectedFabric}
        materials={filters.materials}
        onOpen={() => ui.setMobileFilterOpen(true)}
        onClose={() => ui.setMobileFilterOpen(false)}
        onSubCategoryChange={filters.handleSubCategoryChange}
        onClearFilters={filters.clearAllFilters}
        onPriceRangeChange={filters.handlePriceRangeChange}
        onFabricChange={filters.handleFabricChange}
      />

      {hasOpenedRequestModal && lastRequestProduct && (
        <ProductRequestModal
          isOpen={ui.isRequestModalOpen}
          onClose={ui.closeRequestModal}
          product={ui.requestProduct ?? lastRequestProduct}
          selectedVariant={ui.requestVariant ?? lastRequestVariant ?? undefined}
        />
      )}
    </div>
  );
}
