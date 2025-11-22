// Hook for Series data access

import { useState, useEffect } from "react";
import type { XtreamSeriesCategory, XtreamSeriesInfo } from "../types/xtream.types";
import type { CachedItem } from "../types/cache.types";
import { xtreamService } from "../services/api/xtream.service";
import { itemsService } from "../services/api/items.service";
import { getConfigHandler } from "../handlers/xtream/config.handler";

interface UseSeriesOptions {
  categoryId?: string;
  page?: number;
  limit?: number;
}

export function useSeries(options: UseSeriesOptions = {}) {
  const [categories, setCategories] = useState<XtreamSeriesCategory[]>([]);
  const [items, setItems] = useState<CachedItem[]>([]);
  const [selectedSeries, setSelectedSeries] = useState<XtreamSeriesInfo | null>(null);
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
    const config = getConfigHandler();
    if (!config) {
      setError("Please configure your Xtream API connection first.");
      return;
    }

    try {
      const categoriesData = await xtreamService.getSeriesCategories(config);
      setCategories(categoriesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load series categories");
    }
  };

  const loadItems = async (categoryId?: string, page: number = options.page || 1) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await itemsService.getItems("series", {
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

  const loadSeriesInfo = async (seriesId: number) => {
    const config = getConfigHandler();
    if (!config) return;

    setIsLoading(true);
    setError(null);

    try {
      const seriesInfo = await xtreamService.getSeriesInfo(config, seriesId);
      setSelectedSeries(seriesInfo);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load series details");
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
    selectedSeries,
    isLoading,
    error,
    pagination,
    loadSeriesInfo,
    reload: () => loadItems(options.categoryId, options.page),
  };
}
