"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { MotionConfig } from "framer-motion";

type PortalProps = {
  children: React.ReactNode;
};

export function Portal({ children }: PortalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const portalRoot = document.getElementById("portal-root");
  if (!portalRoot) return null;

  return createPortal(
    <MotionConfig reducedMotion="user">{children}</MotionConfig>,
    portalRoot,
  );
}
