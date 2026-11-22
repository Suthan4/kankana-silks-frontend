"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useQuery } from "@tanstack/react-query";
import type { Product } from "@/lib/api/product.api";
import { productApi } from "@/lib/api/product.api";

const RelatedProducts = dynamic(
  () => import("./RelatedProducts").then((module) => module.RelatedProducts),
  {
    ssr: false,
    loading: () => (
      <div
        aria-hidden="true"
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {Array.from({ length: 4 }, (_, index) => (
          <div
            key={index}
            className="aspect-square animate-pulse rounded-xl bg-gray-100"
          />
        ))}
      </div>
    ),
  },
);

interface RelatedProductsSectionProps {
  categoryId: string;
  productId: string;
}

export function RelatedProductsSection({
  categoryId,
  productId,
}: RelatedProductsSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [isNearViewport, setIsNearViewport] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    if (typeof IntersectionObserver === "undefined") {
      setIsNearViewport(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setIsNearViewport(true);
          observer.disconnect();
        }
      },
      { rootMargin: "600px 0px" },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  const { data: relatedProducts = [], isLoading } = useQuery<Product[]>({
    queryKey: ["relatedProducts", categoryId, productId],
    queryFn: async () => {
      const response = await productApi.getProducts({
        categoryId,
        limit: 8,
        isActive: true,
      });

      return response.data.products
        .filter((relatedProduct) => relatedProduct.id !== productId)
        .slice(0, 4);
    },
    enabled: isNearViewport && Boolean(categoryId),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  return (
    <section ref={sectionRef} aria-busy={isNearViewport && isLoading}>
      {relatedProducts.length > 0 && (
        <RelatedProducts products={relatedProducts} />
      )}
    </section>
  );
}
