import { data } from "react-router";
import type { Route } from "./+types/api.items";
import { getItems, getItemCount } from "../lib/cache";

/**
 * API route to serve cached items from the database
 * GET /api/items?type=vod&categoryId=123 (optional categoryId)
 * GET /api/items?type=series&categoryId=456 (optional categoryId)
 */
export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const type = url.searchParams.get("type");
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
