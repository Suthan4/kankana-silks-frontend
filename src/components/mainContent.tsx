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
      id="main-content"
      tabIndex={-1}
      className={`overflow-x-hidden ${isHomePage ? "pt-0 md:pt-0" : "md:pt-[120px]"}`}
    >
      {children}
    </main>
  );
}
