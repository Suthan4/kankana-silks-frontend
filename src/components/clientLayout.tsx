"use client";

import { useEffect, useState } from "react";
import SplashScreen from "./splashScreen";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const onLoad = () => {
      setShowSplash(false);
      document.body.classList.add("loaded");
    };

    if (document.readyState === "complete") {
      onLoad();
    } else {
      window.addEventListener("load", onLoad);
    }

    return () => window.removeEventListener("load", onLoad);
  }, []);

  return (
    <>
      <SplashScreen show={showSplash} />
      {!showSplash && children}
    </>
  );
}
