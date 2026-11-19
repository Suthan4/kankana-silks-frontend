"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { useAuthModal } from "@/store/useAuthModalStore";

// The sign-in/register modal (and its form-validation code) is only needed
// once someone opens it, so it is not part of every page's initial JavaScript.
const AuthModal = dynamic(() => import("./authModal"), { ssr: false });

export default function AuthModalProvider() {
  const isOpen = useAuthModal((state) => state.isOpen);
  const [hasOpened, setHasOpened] = useState(false);

  // Load on first open, then keep it mounted so closing animations still run.
  if (isOpen && !hasOpened) setHasOpened(true);

  return hasOpened ? <AuthModal /> : null;
}
