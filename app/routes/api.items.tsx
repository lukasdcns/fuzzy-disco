import { data } from "react-router";
import type { Route } from "./+types/api.items";
import { getItems, getItemCount, getItem } from "../lib/cache.server";

/**
 * API route to serve cached items from the database
 * GET /api/items?type=vod&id=123 - Get a single item by ID
 * GET /api/items?type=vod&categoryId=123 - Get items by category (optional categoryId)
 * GET /api/items?type=series&categoryId=456 - Get series by category (optional categoryId)
 * Supports pagination: ?limit=X&page=Y
 *
 * @param args - Route loader arguments containing the request
 * @returns Response with paginated items or a single item or error
 */
export async function loader({ request }: Route.LoaderArgs): Promise<Response> {
  const url = new URL(request.url);
  const type = url.searchParams.get("type");
  const id = url.searchParams.get("id");
  const categoryId = url.searchParams.get("categoryId") || undefined;

  // Pagination parameters
  const limitParam = url.searchParams.get("limit");
  const pageParam = url.searchParams.get("page");
  const limit = limitParam ? parseInt(limitParam, 10) : undefined;
  const page = pageParam ? parseInt(pageParam, 10) : 1;
  const offset = limit && page > 1 ? (page - 1) * limit : undefined;

  // Validate type parameter
  if (!type || (type !== "vod" && type !== "series")) {
    return data(
      { error: "Invalid or missing 'type' parameter. Must be 'vod' or 'series'" },
      { status: 400 }
    );
  }

  // If ID is provided, fetch single item
  if (id) {
    try {
      const item = getItem(id, type as "vod" | "series");

      if (!item) {
        return data({ error: "Item not found" }, { status: 404 });
      }

      return data({ item });
    } catch (error) {
      return data(
        {
          error: "Failed to retrieve item",
          message: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 }
      );
    }
  }

  // Validate pagination parameters
  if (limit !== undefined && (isNaN(limit) || limit < 1)) {
    return data({ error: "Invalid 'limit' parameter. Must be a positive number." }, { status: 400 });
  }
  if (page !== undefined && (isNaN(page) || page < 1)) {
    return data({ error: "Invalid 'page' parameter. Must be a positive number." }, { status: 400 });
  }

  try {
    const totalCount = getItemCount(type as "vod" | "series");
    const items = getItems(type as "vod" | "series", categoryId, limit, offset);

    const totalPages = limit ? Math.ceil(totalCount / limit) : 1;

    return data({
      items,
      count: items.length,
      totalCount,
      type,
      categoryId: categoryId || null,
      pagination: {
        page: page || 1,
        limit: limit || totalCount,
        totalPages,
        hasNextPage: limit ? page < totalPages : false,
        hasPreviousPage: limit ? page > 1 : false,
      },
    });
  } catch (error) {
    return data(
      {
        error: "Failed to retrieve items",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
