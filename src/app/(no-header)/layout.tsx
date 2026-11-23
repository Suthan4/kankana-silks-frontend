import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: true,
    googleBot: {
      index: false,
      follow: true,
    },
  },
};

export default function PrivatePageLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <main id="main-content" tabIndex={-1}>
      {children}
    </main>
  );
}
