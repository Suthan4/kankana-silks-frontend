"use client";

interface CategoryErrorStateProps {
  message: string;
  onRetry: () => void;
}

export function CategoryErrorState({ message, onRetry }: CategoryErrorStateProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="max-w-md text-center">
        <p className="mb-4 font-semibold text-red-600">Failed to load products</p>
        <p className="mb-4 text-sm text-gray-600">{message}</p>
        <button
          type="button"
          onClick={onRetry}
          className="bg-black px-6 py-3 text-sm uppercase tracking-widest text-white transition-colors hover:bg-gray-800"
        >
          Retry
        </button>
      </div>
    </div>
  );
}
