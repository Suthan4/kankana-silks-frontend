import type { Metadata } from "next";
import SearchClient from "./SearchClient";

export const metadata: Metadata = {
  title: "Search | Kankana Silks",
  description: "Search Kankana Silks saree collections.",
  robots: {
    index: false,
    follow: true,
    googleBot: {
      index: false,
      follow: true,
    },
  },
};

export default function SearchPage() {
  return <SearchClient />;
}
