import Footer from "@/components/footer";
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
