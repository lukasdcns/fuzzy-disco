import { useState, useEffect, useCallback } from "react";
import type { CachedItem } from "../types/cache.types";
import { searchService } from "../services/api/search.service";

interface UseSearchOptions {
  type?: "vod" | "series";
  page?: number;
  limit?: number;
  debounceMs?: number;
}

interface PaginationState {
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface UseSearchReturn {
  query: string;
  setQuery: (query: string) => void;
  items: CachedItem[];
  isLoading: boolean;
  error: string | null;
  pagination: PaginationState | null;
  totalCount: number;
  searchType: "vod" | "series" | "all";
  performSearch: (searchQuery: string) => Promise<void>;
  clearSearch: () => void;
}

/**
 * Hook for searching items in the database
 * Provides search functionality with debouncing and pagination
 *
 * @param options - Search configuration options
 * @param options.type - Optional type filter ("vod" | "series")
 * @param options.page - Page number for pagination (default: 1)
 * @param options.limit - Number of items per page (default: 50)
 * @param options.debounceMs - Debounce delay in milliseconds (default: 300)
 * @returns Search state and methods
 * @example
 * ```ts
 * const { query, setQuery, items, isLoading, pagination } = useSearch({ type: "vod" });
 * ```
 */
export function useSearch(options: UseSearchOptions = {}): UseSearchReturn {
  const [query, setQuery] = useState<string>("");
  const [items, setItems] = useState<CachedItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationState | null>(null);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [searchType, setSearchType] = useState<"vod" | "series" | "all">(
    options.type || "all"
  );

  const performSearch = useCallback(
    async (searchQuery: string): Promise<void> => {
      if (!searchQuery || searchQuery.trim().length === 0) {
        setItems([]);
        setPagination(null);
        setTotalCount(0);
        setError(null);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const result = await searchService.searchItems(searchQuery, {
          type: options.type,
          page: options.page || 1,
          limit: options.limit || 50,
        });

        setItems(result.items);
        setPagination(result.pagination);
        setTotalCount(result.totalCount);
        setSearchType(result.type);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to perform search");
        setItems([]);
        setPagination(null);
        setTotalCount(0);
      } finally {
        setIsLoading(false);
      }
    },
    [options.type, options.page, options.limit]
  );

  // Debounced search effect
  useEffect(() => {
    const debounceMs = options.debounceMs || 300;
    const timeoutId = setTimeout(() => {
      performSearch(query);
    }, debounceMs);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [query, performSearch, options.debounceMs]);

  const clearSearch = useCallback((): void => {
    setQuery("");
    setItems([]);
    setPagination(null);
    setTotalCount(0);
    setError(null);
  }, []);

  return {
    query,
    setQuery,
    items,
    isLoading,
    error,
    pagination,
    totalCount,
    searchType,
    performSearch,
    clearSearch,
  };
}
