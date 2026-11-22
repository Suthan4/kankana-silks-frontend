import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="flex min-h-[70vh] items-center justify-center bg-gray-50 px-4 py-16 md:pt-[120px]"
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-lg">
        <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
          404
        </p>
        <h1 className="mb-2 text-2xl font-semibold text-gray-900">
          Page not found
        </h1>
        <p className="mb-6 text-gray-600">
          The page you’re looking for doesn’t exist or may have moved.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/shop"
            className="flex-1 rounded-full bg-gray-900 px-6 py-3 font-medium text-white transition-colors hover:bg-gray-800"
          >
            Browse sarees
          </Link>
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
