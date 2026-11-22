"use client";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ChevronDown, MapPin, Menu, Search, X } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
import type { HeaderLocation } from "../types";
interface Props { mobileMenuOpen: boolean; setMobileMenuOpen: Dispatch<SetStateAction<boolean>>; isProductDetailPage: boolean; isCategoryPage: boolean; location: HeaderLocation | null; onOpenLocation: () => void; onOpenSearch: () => void; }
export function MobileHeaderBar({ mobileMenuOpen, setMobileMenuOpen, isProductDetailPage, isCategoryPage, location, onOpenLocation, onOpenSearch }: Props) {
 return <motion.header initial={false} className="fixed left-0 right-0 top-0 z-40 bg-white shadow-md md:hidden">
  <div className="flex items-center justify-between px-4 pt-3">
   <motion.button whileTap={{scale:0.9}} onClick={()=>setMobileMenuOpen(v=>!v)} aria-label={mobileMenuOpen?"Close menu":"Open menu"} aria-expanded={mobileMenuOpen} className="p-2">{mobileMenuOpen?<X className="h-6 w-6 text-black"/>:<Menu className="h-6 w-6 text-black"/>}</motion.button>
   <Link href="/" aria-label="Kankana Silks home" className="relative block h-9 w-[120px]"><Image src="/removed-bg-logo.png" alt="Kankana Silks" fill priority sizes="180px" className="object-contain"/></Link><div className="w-10"/>
  </div>
  <div className={`px-4 pb-3 pt-2.5 transition-opacity duration-300 ${isProductDetailPage||isCategoryPage?"hidden":""}`}>
   <motion.div initial={false} className="flex items-stretch overflow-hidden rounded-full border border-gray-200 bg-gray-50 shadow-sm">
    <button onClick={onOpenLocation} className="relative flex max-w-[42%] shrink-0 items-center gap-1.5 py-2.5 pl-3.5 pr-3 active:bg-gray-100"><span className="relative flex-shrink-0"><MapPin className="h-4 w-4 text-gray-600"/>{location?.isServiceable!==undefined&&<span className={`absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border border-white ${location.isServiceable?"bg-green-500":"bg-red-500"}`}/>}</span><span className="truncate text-xs font-semibold text-gray-900">{location?location.pincode:"Set location"}</span><ChevronDown className="h-3 w-3 flex-shrink-0 text-gray-400"/></button>
    <div className="my-2 w-px bg-gray-200"/><button onClick={onOpenSearch} className="flex flex-1 items-center gap-2 px-3 py-2.5 text-left active:bg-gray-100"><Search className="h-4 w-4 flex-shrink-0 text-gray-400"/><span className="truncate text-sm text-gray-600">Search sarees, silks…</span></button>
   </motion.div>
  </div>
 </motion.header>;
}