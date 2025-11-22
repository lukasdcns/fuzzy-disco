import { useState, useEffect } from "react";
import type { XtreamSeriesCategory, XtreamSeriesInfo } from "../types/xtream.types";
import type { CachedItem } from "../types/cache.types";
import { getSeriesCategoriesHandler, getSeriesInfoHandler } from "../handlers/xtream/series.handler";
import { getItemsHandler } from "../handlers/xtream/items.handler";

/**
 * Hook for Series data access
 * Provides categories, items, series info, pagination, and loading states
 *
 * @param options - Configuration options for Series data fetching
 * @param options.categoryId - Optional category ID to filter items
 * @param options.page - Page number for pagination (default: 1)
 * @param options.limit - Number of items per page (default: 50)
 * @returns Series data, loading state, error, pagination info, and series details loader
 * @example
 * ```ts
 * const { categories, items, isLoading, loadSeriesInfo } = useSeries({ page: 1 });
 * ```
 */

interface UseSeriesOptions {
  categoryId?: string;
  page?: number;
  limit?: number;
}

interface PaginationState {
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface UseSeriesReturn {
  categories: XtreamSeriesCategory[];
  items: CachedItem[];
  selectedSeries: XtreamSeriesInfo | null;
  isLoading: boolean;
  error: string | null;
  pagination: PaginationState | null;
  loadSeriesInfo: (seriesId: number) => Promise<void>;
  reload: () => Promise<void>;
}

export function useSeries(options: UseSeriesOptions = {}): UseSeriesReturn {
  const [categories, setCategories] = useState<XtreamSeriesCategory[]>([]);
  const [items, setItems] = useState<CachedItem[]>([]);
  const [selectedSeries, setSelectedSeries] = useState<XtreamSeriesInfo | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationState | null>(null);

  const loadCategories = async (): Promise<void> => {
    try {
      const categoriesData = await getSeriesCategoriesHandler();
      setCategories(categoriesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load series categories");
    }
  };

  const loadItems = async (categoryId?: string, page: number = options.page || 1): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await getItemsHandler("series", {
        categoryId,
        page,
        limit: options.limit || 50,
      });
      setItems(data.items);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load items");
    } finally {
      setIsLoading(false);
    }
  };

  const loadSeriesInfo = async (seriesId: number): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const seriesInfo = await getSeriesInfoHandler(seriesId);
      setSelectedSeries(seriesInfo);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load series details");
    } finally {
      setIsLoading(false);
    }
  };

  const reload = async (): Promise<void> => {
    await loadItems(options.categoryId, options.page);
  };

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadItems(options.categoryId, options.page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options.categoryId, options.page]);

  return {
    categories,
    items,
    selectedSeries,
    isLoading,
    error,
    pagination,
    loadSeriesInfo,
    reload,
  };
}
