"use client";

import { useEffect } from "react";

/**
 * Last-resort boundary: it replaces the ROOT layout, so it must render its
 * own <html>/<body>. globals.css is not loaded here, hence inline styles.
 * A plain <a> (full reload) is intentional: after a root-level crash we want
 * a clean slate, not a client-side navigation.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  const button = {
    flex: 1,
    padding: "12px 24px",
    borderRadius: 9999,
    border: "2px solid #111827",
    font: "inherit",
    fontWeight: 500,
    textAlign: "center",
    textDecoration: "none",
    cursor: "pointer",
  } as const;

  return (
    <html lang="en-IN">
      <body
        style={{
          margin: 0,
          fontFamily: "Arial, Helvetica, sans-serif",
          background: "#f9fafb",
          color: "#111827",
        }}
      >
        <main
          id="main-content"
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
        >
          <div
            style={{
              maxWidth: 448,
              width: "100%",
              background: "#fff",
              borderRadius: 16,
              padding: 32,
              textAlign: "center",
              boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
            }}
          >
            <h1 style={{ fontSize: 24, margin: "0 0 8px" }}>
              Something went wrong
            </h1>
            <p style={{ color: "#4b5563", margin: "0 0 24px" }}>
              We’re having trouble loading Kankana Silks. Please try again.
            </p>
            <div style={{ display: "flex", gap: 12 }}>
              <button
                type="button"
                onClick={reset}
                style={{ ...button, background: "#111827", color: "#fff" }}
              >
                Try again
              </button>
              {/* Full reload on purpose: start from a clean slate after a root crash. */}
              {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
              <a
                href="/"
                style={{ ...button, background: "#fff", color: "#111827" }}
              >
                Go home
              </a>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
