import { ReactNode } from "react";

export default function CartLayout({ children }: { children: ReactNode }) {
  return (
    <main id="main-content" tabIndex={-1}>
      {children}
    </main>
  );
}
