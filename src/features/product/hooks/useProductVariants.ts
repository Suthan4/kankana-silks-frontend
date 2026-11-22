"use client";

import { useMemo, useState } from "react";
import type { Product, ProductVariant } from "@/lib/api/product.api";

type VariantAttributeRow = {
  key?: unknown;
  value?: unknown;
};

function getAttributeValue(
  variant: ProductVariant | null,
  key: string,
): string | null {
  const attributes = variant?.attributes as unknown;
  if (!attributes) return null;

  if (Array.isArray(attributes)) {
    const row = (attributes as VariantAttributeRow[]).find(
      (item) => item?.key === key,
    );
    return row?.value == null ? null : String(row.value);
  }

  if (typeof attributes === "object") {
    const value = (attributes as Record<string, unknown>)[key];
    return value == null ? null : String(value);
  }

  return null;
}

function normalizeAttributes(attributes: unknown): Record<string, string> {
  const normalized: Record<string, string> = {};
  if (!attributes) return normalized;

  if (Array.isArray(attributes)) {
    for (const row of attributes as VariantAttributeRow[]) {
      const key = String(row?.key ?? "").trim();
      const value = String(row?.value ?? "").trim();
      if (key && value) normalized[key] = value;
    }
    return normalized;
  }

  if (typeof attributes === "object") {
    for (const [rawKey, rawValue] of Object.entries(
      attributes as Record<string, unknown>,
    )) {
      const key = rawKey.trim();
      const value = String(rawValue ?? "").trim();
      if (key && value) normalized[key] = value;
    }
  }

  return normalized;
}

export function useProductVariants(product: Product) {
  const variants = product.variants ?? [];
  const hasVariants = Boolean(product.hasVariants && variants.length > 0);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    variants[0] ?? null,
  );

  const images = useMemo(() => {
    const variantImages =
      selectedVariant?.media?.filter((media) => media.type === "IMAGE") ?? [];
    const productImages =
      product.media?.filter((media) => media.type === "IMAGE") ?? [];

    return variantImages.length > 0 ? variantImages : productImages;
  }, [product.media, selectedVariant?.media]);

  const options = useMemo(() => {
    if (!hasVariants) return [];

    const optionsMap = new Map<string, Set<string>>();

    for (const variant of variants) {
      for (const [key, value] of Object.entries(
        normalizeAttributes(variant.attributes),
      )) {
        if (!optionsMap.has(key)) optionsMap.set(key, new Set());
        optionsMap.get(key)!.add(value);
      }

      for (const key of ["Size", "Color", "Fabric"] as const) {
        const value =
          variant[key.toLowerCase() as "size" | "color" | "fabric"];

        if (value) {
          if (!optionsMap.has(key)) optionsMap.set(key, new Set());
          optionsMap.get(key)!.add(value);
        }
      }
    }

    return Array.from(optionsMap.entries()).map(([key, values]) => ({
      key,
      values: Array.from(values),
    }));
  }, [hasVariants, variants]);

  const getSelectedAttributeValue = (key: string): string | null => {
    if (!selectedVariant) return null;
    if (key === "Size") return selectedVariant.size || null;
    if (key === "Color") return selectedVariant.color || null;
    if (key === "Fabric") return selectedVariant.fabric || null;
    return getAttributeValue(selectedVariant, key);
  };

  const findVariant = (key: string, value: string) =>
    variants.find((variant) => {
      if (key === "Size" && variant.size === value) return true;
      if (key === "Color" && variant.color === value) return true;
      if (key === "Fabric" && variant.fabric === value) return true;
      return String(getAttributeValue(variant, key)) === String(value);
    }) ?? null;

  const getSwatchImage = (key: string, value: string): string =>
    findVariant(key, value)?.media?.find((media) => media.type === "IMAGE")
      ?.url ??
    product.media?.find((media) => media.type === "IMAGE")?.url ??
    "/placeholder.jpg";

  const selectAttribute = (key: string, value: string): boolean => {
    const variant = findVariant(key, value);
    if (variant) setSelectedVariant(variant);
    return Boolean(variant);
  };

  return {
    hasVariants,
    selectedVariant,
    images,
    options,
    getSelectedAttributeValue,
    getSwatchImage,
    selectAttribute,
  };
}
