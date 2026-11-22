export const CATEGORY_PAGE_SIZE = 12;

export const CATEGORY_MATERIALS = [
  "Pure Silk",
  "Cotton Silk",
  "Art Silk",
  "Georgette",
] as const;

export const CATEGORY_SORT_OPTIONS = [
  { label: "Featured", value: "createdAt-desc" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Most Popular", value: "popularity-desc" },
] as const;
