"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

interface MainContentProps {
  children: ReactNode;
}

export default function MainContent({ children }: MainContentProps) {
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  return (
    <main
      className={`${isHomePage ? "overflow-x-hidden md:pt-0" : "overflow-x-hidden pt-[126px]"}`}
    >
      {children}
    </main>
  );
}
