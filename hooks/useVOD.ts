// Hook for VOD data access

import { useState, useEffect } from "react";
import type { XtreamVODCategory } from "../types/xtream.types";
import type { CachedItem } from "../types/cache.types";
import { getVODCategoriesHandler } from "../handlers/xtream/vod.handler";
import { getItemsHandler } from "../handlers/xtream/items.handler";

interface UseVODOptions {
  categoryId?: string;
  page?: number;
  limit?: number;
}

export function useVOD(options: UseVODOptions = {}) {
  const [categories, setCategories] = useState<XtreamVODCategory[]>([]);
  const [items, setItems] = useState<CachedItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<{
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  } | null>(null);

  const loadCategories = async () => {
    try {
      const categoriesData = await getVODCategoriesHandler();
      setCategories(categoriesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load VOD categories");
    }
  };

  const loadItems = async (categoryId?: string, page: number = options.page || 1) => {
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
  }, [options.categoryId, options.page]);

  return {
    categories,
    items,
    isLoading,
    error,
    pagination,
    reload: () => loadItems(options.categoryId, options.page),
  };
}
