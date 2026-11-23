import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ProtectedRoute } from "@/components/auth/protectedRoutes";
import { AccountNavigation } from "@/features/account/components/AccountNavigation";

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

export default function MyAccountLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="lg:container lg:mx-auto lg:px-4 lg:py-8">
          <div className="lg:flex lg:gap-6">
            <AccountNavigation />
            <main className="w-full min-w-0 pt-12 pb-20 lg:flex-1 lg:py-0">
              {children}
            </main>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
