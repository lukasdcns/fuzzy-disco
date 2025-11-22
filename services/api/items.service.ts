/**
 * Items API Service - Database items communication
 * Handles fetching cached items from the local database via API routes
 */
import type { CachedItem } from "../../types/cache.types";

interface ItemsResponse {
  items: CachedItem[];
  count: number;
  totalCount: number;
  type: "vod" | "series";
  categoryId: string | null;
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

interface GetItemsOptions {
  categoryId?: string;
  page?: number;
  limit?: number;
}

/**
 * Service object for fetching cached items from the database
 */
export const itemsService = {
  /**
   * Fetches cached items from the database with optional filtering and pagination
   *
   * @param type - Type of items to retrieve ("vod" or "series")
   * @param options - Optional filtering and pagination options
   * @returns Paginated items response with metadata
   * @throws Error if the API request fails
   */
  async getItems(type: "vod" | "series", options?: GetItemsOptions): Promise<ItemsResponse> {
    const url = new URL("/api/items", typeof window !== "undefined" ? window.location.origin : "http://localhost");
    url.searchParams.set("type", type);
    
    if (options?.categoryId) {
      url.searchParams.set("categoryId", options.categoryId);
    }
    if (options?.page) {
      url.searchParams.set("page", options.page.toString());
    }
    if (options?.limit) {
      url.searchParams.set("limit", options.limit.toString());
    }

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`Failed to fetch items: ${response.statusText}`);
    }
    return response.json();
  },
};
