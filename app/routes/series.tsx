import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import type { Route } from "./+types/series";
import {
  getConfig,
  getSeriesCategories,
  getSeriesInfo,
  type XtreamSeriesCategory,
  type XtreamSeriesInfo,
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
    { title: "Series Content" },
    { name: "description", content: "Browse series content from Xtream API" },
  ];
}

export default function Series() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<XtreamSeriesCategory[]>([]);
  const [items, setItems] = useState<CachedItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSeries, setSelectedSeries] = useState<XtreamSeriesInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedCategory !== null) {
      loadSeries(selectedCategory);
    } else {
      loadSeries();
    }
  }, [selectedCategory]);

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
      const categoriesData = await getSeriesCategories(config);
      setCategories(categoriesData);

      // Load items from database
      await loadItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load series content");
    } finally {
      setIsLoading(false);
    }
  };

  const loadItems = async (categoryId?: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const url = new URL("/api/items", window.location.origin);
      url.searchParams.set("type", "series");
      if (categoryId) {
        url.searchParams.set("categoryId", categoryId);
      }

      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error("Failed to load items from database");
      }

      const data = await response.json();
      setItems(data.items || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load items");
    } finally {
      setIsLoading(false);
    }
  };

  const loadSeries = async (categoryId?: string) => {
    await loadItems(categoryId);
  };

  const handleSeriesClick = async (seriesId: string) => {
    const config = getConfig();
    if (!config) return;

    setIsLoading(true);
    setError(null);

    try {
      const seriesInfo = await getSeriesInfo(config, parseInt(seriesId));
      setSelectedSeries(seriesInfo);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load series details");
    } finally {
      setIsLoading(false);
    }
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
        )}
      </div>
    </div>
  );
}
