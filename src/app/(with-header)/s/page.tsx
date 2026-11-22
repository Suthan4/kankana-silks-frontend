"use client";

import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Suspense } from "react";

interface SearchResult {
  type: "product" | "category";
  id: string;
  name: string;
  slug: string;
  description?: string;
  sellingPrice?: number;
  basePrice?: number;
  image?: string;
  categoryName?: string;
  categorySlug?: string;
  inStock?: boolean;
  relevanceScore: number;
}

interface SearchResponse {
  success: boolean;
  data: {
    results: SearchResult[];
    summary: {
      total: number;
      products: number;
      categories: number;
      query: string;
    };
    pagination: {
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const query = searchParams.get("k") || searchParams.get("q") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const type = searchParams.get("type") || "all";

  useEffect(() => {
    if (!query) {
      setResults(null);
      setError(null);
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    const fetchResults = async () => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          q: query,
          page: page.toString(),
          limit: "20",
          type: type,
          includeInactive: "false",
        });

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/search?${params}`,
          { signal: controller.signal },
        );

        if (!response.ok) {
          throw new Error("Search failed");
        }

        const data: SearchResponse = await response.json();
        setResults(data);
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(err instanceof Error ? err.message : "An error occurred");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    void fetchResults();

    return () => controller.abort();
  }, [query, page, type]);

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`/s?${params.toString()}`);
  };

  const handleTypeFilter = (newType: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("type", newType);
    params.set("page", "1");
    router.push(`/s?${params.toString()}`);
  };

  if (!query) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Search</h1>
        <p className="text-gray-600">
          Enter a search query to find products and categories.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Search results for &quot;{query}&quot;
        </h1>
        {results && (
          <p className="text-sm text-gray-600">
            {results.data.summary.total} results (
            {results.data.summary.products} products,{" "}
            {results.data.summary.categories} categories)
          </p>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 pb-4">
        <button
          onClick={() => handleTypeFilter("all")}
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            type === "all"
              ? "bg-amber-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          All
        </button>
        <button
          onClick={() => handleTypeFilter("products")}
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            type === "products"
              ? "bg-amber-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Products {results && `(${results.data.summary.products})`}
        </button>
        <button
          onClick={() => handleTypeFilter("categories")}
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            type === "categories"
              ? "bg-amber-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Categories {results && `(${results.data.summary.categories})`}
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Results */}
      {!loading && results && (
        <>
          {results.data.results.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg mb-2">
                No results found for &quot;{query}&quot;
              </p>
              <p className="text-gray-500 text-sm">
                Try a different search term or browse our categories
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {results.data.results.map((result) => (
                <div
                  key={`${result.type}-${result.id}`}
                  className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => {
                    if (result.type === "product") {
                      router.push(`/product/${result.slug}`);
                    } else {
                      router.push(`/category/${result.slug}`);
                    }
                  }}
                >
                  {result.type === "product" ? (
                    <>
                      {/* Product Card */}
                      <div className="aspect-square bg-gray-100 relative">
                        {result.image ? (
                          <Image
                            src={result.image}
                            alt={result.name}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            No Image
                          </div>
                        )}
                        {!result.inStock && (
                          <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                            Out of Stock
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                          {result.name}
                        </h3>
                        {result.categoryName && (
                          <p className="text-xs text-gray-500 mb-2">
                            {result.categoryName}
                          </p>
                        )}
                        <div className="flex items-baseline gap-2">
                          <span className="text-lg font-bold text-gray-900">
                            ₹{result.sellingPrice?.toLocaleString("en-IN")}
                          </span>
                          {result.basePrice &&
                            result.basePrice > result.sellingPrice! && (
                              <span className="text-sm text-gray-500 line-through">
                                ₹{result.basePrice.toLocaleString("en-IN")}
                              </span>
                            )}
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Category Card */}
                      <div className="aspect-video bg-gradient-to-br from-amber-50 to-amber-100 relative">
                        {result.image ? (
                          <Image
                            src={result.image}
                            alt={result.name}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <svg
                              className="w-16 h-16 text-amber-300"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                            Category
                          </span>
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {result.name}
                        </h3>
                        {result.description && (
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                            {result.description}
                          </p>
                        )}
                        <p className="text-xs text-gray-500">
                          {results?.data?.results?.length || 0} products
                        </p>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {results.data.pagination.totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              <div className="flex gap-1">
                {Array.from(
                  { length: results.data.pagination.totalPages },
                  (_, i) => i + 1,
                )
                  .filter((p) => {
                    // Show first, last, current, and adjacent pages
                    return (
                      p === 1 ||
                      p === results.data.pagination.totalPages ||
                      (p >= page - 1 && p <= page + 1)
                    );
                  })
                  .map((p, idx, arr) => (
                    <div key={p} className="flex items-center">
                      {idx > 0 && arr[idx - 1] !== p - 1 && (
                        <span className="px-2 text-gray-400">...</span>
                      )}
                      <button
                        onClick={() => handlePageChange(p)}
                        className={`px-4 py-2 rounded-md text-sm font-medium ${
                          p === page
                            ? "bg-amber-600 text-white"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        {p}
                      </button>
                    </div>
                  ))}
              </div>

              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === results.data.pagination.totalPages}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
