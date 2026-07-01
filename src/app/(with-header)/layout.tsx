export const dynamic = "force-dynamic";

import Footer from "@/components/footer";
import Header from "@/components/header";
import MainContent from "@/components/mainContent";
import { ReactNode } from "react";

export default function WithHeader({ children }: { children: ReactNode }) {
  return (
    <>
      <MainContent>{children}</MainContent>
      <Footer />
    </>
  );
}
