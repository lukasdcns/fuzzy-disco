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

  // Validate type parameter
  if (!type || (type !== "vod" && type !== "series")) {
    return data(
      { error: "Invalid or missing 'type' parameter. Must be 'vod' or 'series'" },
      { status: 400 }
    );
  }

  try {
    const items = getItems(type as "vod" | "series", categoryId);
    const count = getItemCount(type as "vod" | "series");

    return data({
      items,
      count: items.length,
      totalCount: count,
      type,
      categoryId: categoryId || null,
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
