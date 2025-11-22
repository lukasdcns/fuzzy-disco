import { useState, useEffect } from "react";
import type { XtreamVODCategory } from "../types/xtream.types";
import type { CachedItem } from "../types/cache.types";
import { getVODCategoriesHandler } from "../handlers/xtream/vod.handler";
import { getItemsHandler } from "../handlers/xtream/items.handler";

/**
 * Hook for VOD (Video on Demand) data access
 * Provides categories, items, pagination, and loading states
 *
 * @param options - Configuration options for VOD data fetching
 * @param options.categoryId - Optional category ID to filter items
 * @param options.page - Page number for pagination (default: 1)
 * @param options.limit - Number of items per page (default: 50)
 * @returns VOD data, loading state, error, and pagination info
 * @example
 * ```ts
 * const { categories, items, isLoading, error, pagination } = useVOD({ page: 1, limit: 50 });
 * ```
 */

interface UseVODOptions {
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

interface UseVODReturn {
  categories: XtreamVODCategory[];
  items: CachedItem[];
  isLoading: boolean;
  error: string | null;
  pagination: PaginationState | null;
  reload: () => Promise<void>;
}

export function useVOD(options: UseVODOptions = {}): UseVODReturn {
  const [categories, setCategories] = useState<XtreamVODCategory[]>([]);
  const [items, setItems] = useState<CachedItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationState | null>(null);

  const loadCategories = async (): Promise<void> => {
    try {
      const categoriesData = await getVODCategoriesHandler();
      setCategories(categoriesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load VOD categories");
    }
  };

  const loadItems = async (categoryId?: string, page: number = options.page || 1): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await getItemsHandler("vod", {
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

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadItems(options.categoryId, options.page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options.categoryId, options.page]);

  const reload = async (): Promise<void> => {
    await loadItems(options.categoryId, options.page);
  };

  return {
    categories,
    items,
    isLoading,
    error,
    pagination,
    reload,
  };
}
