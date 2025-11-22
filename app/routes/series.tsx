import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import type { Route } from "./+types/series";
import { useSeries } from "../../hooks/useSeries";

/**
 * Meta function for the series page route
 * @param _args - Route meta arguments
 * @returns Meta tags for SEO
 */
export function meta(_args: Route.MetaArgs) {
  return [
    { title: "Series Content" },
    { name: "description", content: "Browse series content from Xtream API" },
  ];
}

/**
 * Series page component
 * Displays series content with category filtering, pagination, and series details
 */
export default function Series(): JSX.Element {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;
  
  const { categories, items, selectedSeries, isLoading, error, pagination, loadSeriesInfo } = useSeries({
    categoryId: selectedCategory || undefined,
    page: currentPage,
    limit: itemsPerPage,
  });

  useEffect(() => {
    setCurrentPage(1); // Reset to first page when category changes
  }, [selectedCategory]);

  const handlePageChange = (newPage: number): void => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSeriesClick = async (seriesId: string): Promise<void> => {
    await loadSeriesInfo(parseInt(seriesId, 10));
  };

  if (error && categories.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-red-800 dark:text-red-200 mb-2">Error</h2>
            <p className="text-red-600 dark:text-red-300">{error}</p>
            <button
              onClick={() => navigate("/config")}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
            >
              Go to Configuration
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (selectedSeries) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => setSelectedSeries(null)}
            className="mb-6 text-blue-600 dark:text-blue-400 hover:underline"
          >
            ← Back to Series List
          </button>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            {selectedSeries.info.cover && (
              <div className="mb-6">
                <img
                  src={selectedSeries.info.cover}
                  alt={selectedSeries.info.name}
                  className="max-w-md mx-auto rounded-lg"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
            )}

            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {selectedSeries.info.name}
            </h1>

            {selectedSeries.info.plot && (
              <p className="text-gray-700 dark:text-gray-300 mb-4">{selectedSeries.info.plot}</p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {selectedSeries.info.genre && (
                <div>
                  <span className="font-semibold text-gray-900 dark:text-white">Genre: </span>
                  <span className="text-gray-700 dark:text-gray-300">{selectedSeries.info.genre}</span>
                </div>
              )}
              {selectedSeries.info.rating && (
                <div>
                  <span className="font-semibold text-gray-900 dark:text-white">Rating: </span>
                  <span className="text-gray-700 dark:text-gray-300">{selectedSeries.info.rating}</span>
                </div>
              )}
              {selectedSeries.info.releaseDate && (
                <div>
                  <span className="font-semibold text-gray-900 dark:text-white">Release Date: </span>
                  <span className="text-gray-700 dark:text-gray-300">{selectedSeries.info.releaseDate}</span>
                </div>
              )}
              {selectedSeries.info.director && (
                <div>
                  <span className="font-semibold text-gray-900 dark:text-white">Director: </span>
                  <span className="text-gray-700 dark:text-gray-300">{selectedSeries.info.director}</span>
                </div>
              )}
            </div>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Episodes</h2>
            <div className="space-y-2">
              {selectedSeries.episodes.map((episode) => (
                <div
                  key={episode.id}
                  className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <h3 className="font-semibold text-gray-900 dark:text-white">{episode.title}</h3>
                  {episode.info.plot && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{episode.info.plot}</p>
                  )}
                  {episode.info.duration && (
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      Duration: {episode.info.duration}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Series Content</h1>
          <button
            onClick={() => navigate("/")}
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            ← Back to Home
          </button>
        </div>

        {categories.length > 0 && (
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-4 py-2 rounded-md transition-colors ${
                  selectedCategory === null
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                }`}
              >
                All
              </button>
              {categories.map((category) => (
                <button
                  key={category.category_id}
                  onClick={() => setSelectedCategory(category.category_id)}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    selectedCategory === category.category_id
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                  }`}
                >
                  {category.category_name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Pagination Controls at Top */}
        {pagination && pagination.totalPages > 1 && !isLoading && items.length > 0 && (
          <div className="mb-6 flex items-center justify-center gap-2 flex-wrap">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={!pagination.hasPreviousPage || isLoading}
              className={`px-4 py-2 rounded-md transition-colors ${
                pagination.hasPreviousPage && !isLoading
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
              }`}
            >
              Previous
            </button>

            <div className="flex items-center gap-2">
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                let pageNum: number;
                if (pagination.totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= pagination.totalPages - 2) {
                  pageNum = pagination.totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    disabled={isLoading}
                    className={`px-4 py-2 rounded-md transition-colors ${
                      currentPage === pageNum
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                    } ${isLoading ? "cursor-not-allowed opacity-50" : ""}`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={!pagination.hasNextPage || isLoading}
              className={`px-4 py-2 rounded-md transition-colors ${
                pagination.hasNextPage && !isLoading
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
              }`}
            >
              Next
            </button>

            <span className="ml-4 text-sm text-gray-600 dark:text-gray-400">
              Page {currentPage} of {pagination.totalPages} ({pagination.limit} items per page)
            </span>
          </div>
        )}

        {isLoading && (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">Loading...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <p className="text-red-600 dark:text-red-300">{error}</p>
          </div>
        )}

        {!isLoading && items.length === 0 && !error && (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">No series found.</p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
              Try browsing series content first to populate the database.
            </p>
          </div>
        )}

        {!isLoading && items.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {items.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleSeriesClick(item.id)}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                >
                  {item.poster_url && (
                    <img
                      src={item.poster_url}
                      alt={item.name}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23ddd' width='100' height='100'/%3E%3Ctext fill='%23999' font-family='sans-serif' font-size='14' dy='10.5' x='50%25' y='50%25' text-anchor='middle'%3ENo Image%3C/text%3E%3C/svg%3E";
                      }}
                    />
                  )}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                      {item.name}
                    </h3>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {pagination && pagination.totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={!pagination.hasPreviousPage || isLoading}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    pagination.hasPreviousPage && !isLoading
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                  }`}
                >
                  Previous
                </button>

                <div className="flex items-center gap-2">
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    let pageNum: number;
                    if (pagination.totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= pagination.totalPages - 2) {
                      pageNum = pagination.totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        disabled={isLoading}
                        className={`px-4 py-2 rounded-md transition-colors ${
                          currentPage === pageNum
                            ? "bg-blue-600 text-white"
                            : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                        } ${isLoading ? "cursor-not-allowed opacity-50" : ""}`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!pagination.hasNextPage || isLoading}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    pagination.hasNextPage && !isLoading
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                  }`}
                >
                  Next
                </button>

                <span className="ml-4 text-sm text-gray-600 dark:text-gray-400">
                  Page {currentPage} of {pagination.totalPages} ({pagination.limit} items per page)
                </span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
