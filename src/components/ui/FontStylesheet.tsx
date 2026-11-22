"use client";

import { useEffect } from "react";

const TYPEKIT_STYLESHEET_ID = "kankana-typekit-stylesheet";
const TYPEKIT_STYLESHEET_URL = "https://use.typekit.net/gmp5qfk.css";

/** Load the existing licensed font stylesheet after first paint. */
export function FontStylesheet() {
  useEffect(() => {
    if (document.getElementById(TYPEKIT_STYLESHEET_ID)) return;

    const stylesheet = document.createElement("link");
    stylesheet.id = TYPEKIT_STYLESHEET_ID;
    stylesheet.rel = "stylesheet";
    stylesheet.href = TYPEKIT_STYLESHEET_URL;
    document.head.appendChild(stylesheet);
  }, []);

  return null;
}
