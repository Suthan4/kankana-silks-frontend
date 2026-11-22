"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle } from "lucide-react";

export default function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Route error:", error);
  }, [error]);

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="flex min-h-[70vh] items-center justify-center bg-gray-50 px-4 py-16 md:pt-[120px]"
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-lg">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <AlertCircle className="h-8 w-8 text-red-600" aria-hidden="true" />
        </div>
        <h1 className="mb-2 text-2xl font-semibold text-gray-900">
          Something went wrong
        </h1>
        <p className="mb-6 text-gray-600">
          We couldn’t load this page. Please try again.
        </p>
        {error.digest && (
          <p className="mb-6 text-xs text-gray-500">
            Reference: <span className="font-mono">{error.digest}</span>
          </p>
        )}
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={reset}
            className="flex-1 rounded-full bg-gray-900 px-6 py-3 font-medium text-white transition-colors hover:bg-gray-800"
          >
            Try again
          </button>
          <Link
            href="/"
            className="flex-1 rounded-full border-2 border-gray-900 px-6 py-3 font-medium text-gray-900 transition-colors hover:bg-gray-900 hover:text-white"
          >
            Go home
          </Link>
        </div>
      </div>
    </main>
  );
}
