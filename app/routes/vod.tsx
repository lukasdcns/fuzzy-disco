import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import type { Route } from "./+types/vod";
import { useVOD } from "../../hooks/useVOD";
import { useSearch } from "../../hooks/useSearch";

/**
 * Meta function for the VOD page route
 * @param _args - Route meta arguments
 * @returns Meta tags for SEO
 */
export function meta(_args: Route.MetaArgs) {
  return [
    { title: "VOD Content" },
    { name: "description", content: "Browse VOD content from Xtream API" },
  ];
}

/**
 * VOD page component
 * Displays VOD content with category filtering and pagination
 */
export default function VOD(): JSX.Element {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;
  
  const { categories, items, isLoading, error, pagination } = useVOD({
    categoryId: selectedCategory || undefined,
    page: currentPage,
    limit: itemsPerPage,
  });

  const {
    query: searchQuery,
    setQuery: setSearchQuery,
    items: searchItems,
    isLoading: isSearching,
    pagination: searchPagination,
    totalCount: searchTotalCount,
    clearSearch,
  } = useSearch({
    type: "vod",
    page: currentPage,
    limit: itemsPerPage,
  });

  const isSearchMode = searchQuery.trim().length > 0;
  const displayItems = isSearchMode ? searchItems : items;
  const displayPagination = isSearchMode ? searchPagination : pagination;
  const displayLoading = isSearchMode ? isSearching : isLoading;

  useEffect(() => {
    setCurrentPage(1); // Reset to first page when category changes
  }, [selectedCategory]);

  useEffect(() => {
    if (isSearchMode) {
      setCurrentPage(1); // Reset to first page when search starts
    }
  }, [searchQuery, isSearchMode]);

  const handlePageChange = (newPage: number): void => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">VOD Content</h1>
          <button
            onClick={(): void => navigate("/")}
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            ← Back to Home
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search VOD content..."
              value={searchQuery}
              onChange={(e): void => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 pl-10 pr-10 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            {searchQuery && (
              <button
                onClick={(): void => {
                  clearSearch();
                  setCurrentPage(1);
                }}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <svg
                  className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
          {isSearchMode && searchTotalCount > 0 && (
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Found {searchTotalCount} result{searchTotalCount !== 1 ? "s" : ""} for "{searchQuery}"
            </p>
          )}
        </div>

        {categories.length > 0 && !isSearchMode && (
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
        {displayPagination && displayPagination.totalPages > 1 && !displayLoading && displayItems.length > 0 && (
          <div className="mb-6 flex items-center justify-center gap-2 flex-wrap">
            <button
              onClick={(): void => handlePageChange(currentPage - 1)}
              disabled={!displayPagination.hasPreviousPage || displayLoading}
              className={`px-4 py-2 rounded-md transition-colors ${
                displayPagination.hasPreviousPage && !displayLoading
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
              Page {currentPage} of {displayPagination.totalPages} ({displayPagination.limit} items per page)
            </span>
          </div>
        )}

        {displayLoading && (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">Loading...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <p className="text-red-600 dark:text-red-300">{error}</p>
          </div>
        )}

        {!displayLoading && displayItems.length === 0 && !error && !isSearchMode && (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">No VOD content found.</p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
              Try browsing VOD content first to populate the database.
            </p>
          </div>
        )}

        {!displayLoading && displayItems.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {displayItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => navigate(`/vod/${item.id}`)}
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
            {displayPagination && displayPagination.totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <button
                  onClick={(): void => handlePageChange(currentPage - 1)}
                  disabled={!displayPagination.hasPreviousPage || displayLoading}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    displayPagination.hasPreviousPage && !displayLoading
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                  }`}
                >
                  Previous
                </button>

                <div className="flex items-center gap-2">
                  {Array.from({ length: Math.min(5, displayPagination.totalPages) }, (_, i) => {
                    let pageNum: number;
                    if (displayPagination.totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= displayPagination.totalPages - 2) {
                      pageNum = displayPagination.totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={(): void => handlePageChange(pageNum)}
                        disabled={displayLoading}
                        className={`px-4 py-2 rounded-md transition-colors ${
                          currentPage === pageNum
                            ? "bg-blue-600 text-white"
                            : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                        } ${displayLoading ? "cursor-not-allowed opacity-50" : ""}`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={(): void => handlePageChange(currentPage + 1)}
                  disabled={!displayPagination.hasNextPage || displayLoading}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    displayPagination.hasNextPage && !displayLoading
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                  }`}
                >
                  Next
                </button>

                <span className="ml-4 text-sm text-gray-600 dark:text-gray-400">
                  Page {currentPage} of {displayPagination.totalPages} ({displayPagination.limit} items per page)
                </span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
