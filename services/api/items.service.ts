// Items API Service - Database items communication

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

export const itemsService = {
  async getItems(
    type: "vod" | "series",
    options?: {
      categoryId?: string;
      page?: number;
      limit?: number;
    }
  ): Promise<ItemsResponse> {
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
