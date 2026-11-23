import type { Metadata } from "next";
import WishlistClient from "./WishlistClient";

export const metadata: Metadata = {
  title: "My Wishlist | Kankana Silks",
  robots: {
    index: false,
    follow: true,
    googleBot: { index: false, follow: true },
  },
  alternates: { canonical: "/wishlist" },
};

export default function WishlistPage() {
  return <WishlistClient />;
}
