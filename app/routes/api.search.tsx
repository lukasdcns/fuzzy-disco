import { data } from "react-router";
import type { Route } from "./+types/api.search";
import { searchItemsHandler } from "../../handlers/xtream/search.handler";

/**
 * API route for searching items in the database
 * GET /api/search?q=query&type=vod&page=1&limit=50
 *
 * @param args - Route loader arguments containing the request
 * @returns Response with search results or error
 */
export async function loader({ request }: Route.LoaderArgs): Promise<Response> {
  const url = new URL(request.url);
  const query = url.searchParams.get("q") || "";
  const type = url.searchParams.get("type") as "vod" | "series" | undefined;
  const pageParam = url.searchParams.get("page");
  const limitParam = url.searchParams.get("limit");

  const page = pageParam ? parseInt(pageParam, 10) : 1;
  const limit = limitParam ? parseInt(limitParam, 10) : 50;

  // Validate pagination parameters
  if (isNaN(page) || page < 1) {
    return data({ error: "Invalid 'page' parameter. Must be a positive number." }, { status: 400 });
  }
  if (isNaN(limit) || limit < 1) {
    return data({ error: "Invalid 'limit' parameter. Must be a positive number." }, { status: 400 });
  }

  // Validate type parameter if provided
  if (type && type !== "vod" && type !== "series") {
    return data(
      { error: "Invalid 'type' parameter. Must be 'vod' or 'series'." },
      { status: 400 }
    );
  }

  try {
    const result = searchItemsHandler(query, { type, page, limit });
    return data(result);
  } catch (error) {
    return data(
      {
        error: "Search failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
