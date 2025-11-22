// Items Handler - Business logic for items operations

import type { CachedItem } from "../../../types/cache.types";
import { itemsService } from "../../../services/api/items.service";

interface GetItemsOptions {
  categoryId?: string;
  page?: number;
  limit?: number;
}

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

export async function getItemsHandler(
  type: "vod" | "series",
  options?: GetItemsOptions
): Promise<ItemsResponse> {
  return itemsService.getItems(type, options);
}
