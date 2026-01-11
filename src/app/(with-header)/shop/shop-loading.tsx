export default function ShopLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Skeleton */}
      <div className="bg-gradient-to-br from-yellow-50 via-white to-orange-50 border-b border-gray-200">
        <div className="container mx-auto px-4 md:px-6 py-12 md:py-20">
          <div className="max-w-3xl mx-auto text-center">
            <div className="h-12 bg-gray-200 rounded-lg w-2/3 mx-auto mb-4 animate-pulse" />
            <div className="h-6 bg-gray-200 rounded-lg w-1/2 mx-auto mb-8 animate-pulse" />
            <div className="flex justify-center gap-8">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-8 w-32 bg-gray-200 rounded-full animate-pulse"
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Categories Grid Skeleton */}
      <div className="container mx-auto px-4 md:px-6 py-12">
        <div className="mb-8">
          <div className="h-8 bg-gray-200 rounded-lg w-48 mb-2 animate-pulse" />
          <div className="h-5 bg-gray-200 rounded-lg w-64 animate-pulse" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl overflow-hidden shadow-sm"
            >
              <div className="aspect-[4/3] bg-gray-200 animate-pulse" />
              <div className="p-6">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2 animate-pulse" />
                <div className="h-4 bg-gray-200 rounded w-full mb-4 animate-pulse" />
                <div className="flex gap-2">
                  <div className="h-6 bg-gray-200 rounded-full w-16 animate-pulse" />
                  <div className="h-6 bg-gray-200 rounded-full w-20 animate-pulse" />
                  <div className="h-6 bg-gray-200 rounded-full w-16 animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
