import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Product Details and Appearance",
  description: "Understand product descriptions, colours, images and the possible appearance variations of sarees purchased from Kankana Silks.",
  alternates: { canonical: "/product-details-appearance" },
  robots: { index: true, follow: true },
};

import ProductDetailsAppearance from "@/components/legal/productAndAppearance";

export default function productAndAppearancepage() {
  return <ProductDetailsAppearance />;
}
