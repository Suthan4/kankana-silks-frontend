import type { Address } from "@/lib/api/addresses.api";
import type { Category } from "@/lib/api/category.api";

export interface HeaderLocation {
  city: string;
  pincode: string;
  isServiceable?: boolean;
}

export type HeaderAddress = Address;
export type HeaderCategory = Category;

export type HeaderNavIcon = typeof import("lucide-react").Home;
