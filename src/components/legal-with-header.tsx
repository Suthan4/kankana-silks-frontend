"use client";

import Image from "next/image";
import Link from "next/link";
import { Search, Menu } from "lucide-react";

const PolicyHeader = () => {
  return (
    <header className="w-full border-b border-gray-200 bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between gap-4">
          {/* LEFT — Logo */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/image-removebg-preview.png" // change to your logo path
                alt="Kankana Silks"
                width={120}
                height={120}
                className="object-contain"
              />
            </Link>
          </div>

          {/* CENTER — Search (Desktop Only) */}
          {/* <div className="hidden md:flex flex-1 max-w-xl">
            <div className="w-full relative">
              <input
                placeholder="Search products, categories..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900/20 text-sm"
              />
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
            </div>
          </div> */}

          {/* RIGHT — Actions */}
          <div className="flex items-center gap-3">
            {/* Policy Shortcut (Optional) */}
            <Link
              href="/shipping-policy"
              className="hidden sm:block text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              Policies
            </Link>

            {/* Mobile Menu Icon */}
            <button className="md:hidden p-2 rounded-lg hover:bg-gray-100">
              <Menu size={20} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default PolicyHeader;
