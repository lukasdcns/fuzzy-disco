import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import type { Route } from "./+types/vod";
import {
  getConfig,
  getVODCategories,
  type XtreamVODCategory,
} from "../lib/xtream-api";

interface CachedItem {
  id: string;
  type: "vod" | "series";
  name: string;
  poster_url: string | null;
  category_id: string | null;
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "VOD Content" },
    { name: "description", content: "Browse VOD content from Xtream API" },
  ];
}

export default function VOD() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<XtreamVODCategory[]>([]);
  const [items, setItems] = useState<CachedItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(50); // Default: 50 items per page
  const [pagination, setPagination] = useState<{
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    setCurrentPage(1); // Reset to first page when category changes
    if (selectedCategory !== null) {
      loadStreams(selectedCategory);
    } else {
      loadStreams();
    }
  }, [selectedCategory]);

  useEffect(() => {
    // Reload items when page changes
    if (selectedCategory !== null) {
      loadStreams(selectedCategory);
    } else {
      loadStreams();
    }
  }, [currentPage]);

  const loadData = async () => {
    const config = getConfig();
    if (!config) {
      setError("Please configure your Xtream API connection first.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Load categories from API (still needed for filtering)
      const categoriesData = await getVODCategories(config);
      setCategories(categoriesData);

      // Load items from database
      await loadItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load VOD content");
    } finally {
      setIsLoading(false);
    }
  };

  const loadItems = async (categoryId?: string, page: number = currentPage) => {
    setIsLoading(true);
    setError(null);

    try {
      const url = new URL("/api/items", window.location.origin);
      url.searchParams.set("type", "vod");
      url.searchParams.set("limit", itemsPerPage.toString());
      url.searchParams.set("page", page.toString());
      if (categoryId) {
        url.searchParams.set("categoryId", categoryId);
      }

      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error("Failed to load items from database");
      }

      const data = await response.json();
      setItems(data.items || []);
      setPagination(data.pagination || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load items");
    } finally {
      setIsLoading(false);
    }
  };

  const loadStreams = async (categoryId?: string) => {
    await loadItems(categoryId, currentPage);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (error && !categories.length) {
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
            <p className="text-gray-600 dark:text-gray-400">No VOD content found.</p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
              Try browsing VOD content first to populate the database.
            </p>
          </div>
        )}

        {!isLoading && items.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
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
