/**
 * Items Handler - Business logic for items operations
 * Handles retrieval of cached items with pagination support
 */
import type { CachedItem } from "../../types/cache.types";
import { itemsService } from "../../services/api/items.service";

interface GetItemsOptions {
  categoryId?: string;
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

interface ItemsResponse {
  items: CachedItem[];
  count: number;
  totalCount: number;
  type: "vod" | "series";
  categoryId: string | null;
  pagination: PaginationInfo;
}

/**
 * Retrieves cached items from the database with optional filtering and pagination
 *
 * @param type - Type of items to retrieve ("vod" or "series")
 * @param options - Optional filtering and pagination options
 * @param options.categoryId - Optional category ID to filter items
 * @param options.page - Page number for pagination (default: 1)
 * @param options.limit - Number of items per page
 * @returns Paginated items response with metadata
 * @throws Error if API call fails
 */
export async function getItemsHandler(
  type: "vod" | "series",
  options?: GetItemsOptions
): Promise<ItemsResponse> {
  return itemsService.getItems(type, options);
}
