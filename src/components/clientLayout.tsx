"use client";

import { usePathname } from "next/navigation";
import Header from "./header";

// Routes that render their own header (or none at all).
const HIDE_HEADER_ROUTES = new Set([
  "/login",
  "/checkout",
  "/cart",
  "/wishlist",
  "/about-us",
  "/contact-us",
  "/faq",
  "/return-policy",
  "/cancellation-policy",
  "/product-details-appearance",
  "/shipping-policy",
  "/privacy-policy",
  "/terms-and-conditions",
]);
export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <>
      {!HIDE_HEADER_ROUTES.has(pathname) && <Header />}
      {children}
    </>
  );
}
