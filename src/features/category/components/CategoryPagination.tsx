"use client";

interface CategoryPaginationProps {
  currentPage: number;
  totalPages: number;
  isLoading: boolean;
  onPageChange: (page: number) => void;
}

export function CategoryPagination({
  currentPage,
  totalPages,
  isLoading,
  onPageChange,
}: CategoryPaginationProps) {
  if (isLoading || totalPages <= 1) return null;

  const pages = Array.from({ length: Math.min(totalPages, 5) }, (_, index) => {
    if (totalPages <= 5) return index + 1;
    if (currentPage <= 3) return index + 1;
    if (currentPage >= totalPages - 2) return totalPages - 4 + index;
    return currentPage - 2 + index;
  });

  return (
    <nav aria-label="Product pages" className="mt-20 flex items-center justify-center gap-1">
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="border border-gray-200 px-5 py-2.5 text-xs uppercase tracking-widest transition-colors hover:border-black disabled:opacity-30"
      >
        Prev
      </button>
      {pages.map((page) => (
        <button
          type="button"
          key={page}
          onClick={() => onPageChange(page)}
          aria-current={currentPage === page ? "page" : undefined}
          className={`h-10 w-10 text-xs tracking-widest transition-colors ${
            currentPage === page ? "bg-black text-white" : "border border-gray-200 hover:border-black"
          }`}
        >
          {page}
        </button>
      ))}
      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="border border-gray-200 px-5 py-2.5 text-xs uppercase tracking-widest transition-colors hover:border-black disabled:opacity-30"
      >
        Next
      </button>
    </nav>
  );
}
