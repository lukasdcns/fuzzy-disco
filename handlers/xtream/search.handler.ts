/**
 * Search Handler - Business logic for search operations
 * Handles searching items in the database with pagination support
 */
import type { CachedItem } from "../../types/cache.types";
import { searchItems, getSearchCount } from "../../app/lib/cache.server";

interface SearchOptions {
  type?: "vod" | "series";
  page?: number;
  limit?: number;
}

interface PaginationInfo {
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface SearchResponse {
  items: CachedItem[];
  count: number;
  totalCount: number;
  query: string;
  type: "vod" | "series" | "all";
  pagination: PaginationInfo;
}

/**
 * Searches items in the database by name
 *
 * @param query - Search query string
 * @param options - Optional search options
 * @param options.type - Optional type filter ("vod" | "series")
 * @param options.page - Page number for pagination (default: 1)
 * @param options.limit - Number of items per page
 * @returns Search response with items and pagination info
 */
export function searchItemsHandler(
  query: string,
  options?: SearchOptions
): SearchResponse {
  const searchType = options?.type;
  const page = options?.page || 1;
  const limit = options?.limit || 50;
  const offset = limit && page > 1 ? (page - 1) * limit : undefined;

  const items = searchItems(query, searchType, limit, offset);
  const totalCount = getSearchCount(query, searchType);
  const totalPages = limit ? Math.ceil(totalCount / limit) : 1;

  return {
    items,
    count: items.length,
    totalCount,
    query,
    type: searchType || "all",
    pagination: {
      page,
      limit,
      totalPages,
      hasNextPage: limit ? page < totalPages : false,
      hasPreviousPage: limit ? page > 1 : false,
    },
  };
}
