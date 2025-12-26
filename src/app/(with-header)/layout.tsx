import Footer from "@/components/footer";
import Header from "@/components/header";
import { ReactNode } from "react";

export default function WithHeader({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      <main className="overflow-x-hidden">{children}</main>
      <Footer />
    </>
  );
}
