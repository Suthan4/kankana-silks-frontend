import ScrollToTop from "@/components/common/ScrollToTop";
import Footer from "@/components/footer";
import PolicyHeader from "@/components/legal-with-header";
import { ReactNode } from "react";

export default function LegalWithHeader({ children }: { children: ReactNode }) {
  return (
    <>
      <PolicyHeader />
      <main className="overflow-x-hidden">
        <ScrollToTop/>
        {children}
        </main>
      <Footer />
    </>
  );
}
