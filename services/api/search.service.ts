/**
 * Search API Service - Database search communication
 * Handles fetching search results from the local database via API routes
 */
import type { CachedItem } from "../../types/cache.types";

interface SearchResponse {
  items: CachedItem[];
  count: number;
  totalCount: number;
  query: string;
  type: "vod" | "series" | "all";
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

interface SearchOptions {
  type?: "vod" | "series";
  page?: number;
  limit?: number;
}

/**
 * Service object for searching items in the database
 */
export const searchService = {
  /**
   * Searches items in the database with optional filtering and pagination
   *
   * @param query - Search query string
   * @param options - Optional filtering and pagination options
   * @returns Search response with items and pagination info
   * @throws Error if the API request fails
   */
  async searchItems(query: string, options?: SearchOptions): Promise<SearchResponse> {
    const url = new URL("/api/search", typeof window !== "undefined" ? window.location.origin : "http://localhost");
    url.searchParams.set("q", query);

    if (options?.type) {
      url.searchParams.set("type", options.type);
    }
    if (options?.page) {
      url.searchParams.set("page", options.page.toString());
    }
    if (options?.limit) {
      url.searchParams.set("limit", options.limit.toString());
    }

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`Failed to search items: ${response.statusText}`);
    }
    return response.json();
  },
};
