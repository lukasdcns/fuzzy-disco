import { data } from "react-router";
import type { Route } from "./+types/api.cache";
import {
  clearCache,
  getCacheStats,
  clearExpiredCache,
  invalidateCachePattern,
} from "../../app/lib/cache";

/**
 * Cache management API route
 * GET /api/cache/stats - Get cache statistics
 * POST /api/cache/clear - Clear all cache
 * POST /api/cache/clear-expired - Clear expired entries
 * POST /api/cache/invalidate?pattern=... - Invalidate entries matching pattern
 */
export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const path = url.pathname;

  if (path.endsWith("/stats")) {
    const stats = getCacheStats();
    return data(stats);
  }

  return data({ error: "Invalid endpoint" }, { status: 404 });
}

export async function action({ request }: Route.ActionArgs) {
  const url = new URL(request.url);
  const path = url.pathname;
  const formData = await request.formData();
  const actionType = formData.get("action") || url.searchParams.get("action");

  try {
    if (path.endsWith("/clear") || actionType === "clear") {
      clearCache();
      return data({ success: true, message: "Cache cleared" });
    }

    if (path.endsWith("/clear-expired") || actionType === "clear-expired") {
      clearExpiredCache();
      return data({ success: true, message: "Expired cache entries cleared" });
    }

    if (path.endsWith("/invalidate") || actionType === "invalidate") {
      const pattern = url.searchParams.get("pattern") || formData.get("pattern");
      if (!pattern) {
        return data({ error: "Pattern parameter required" }, { status: 400 });
      }
      invalidateCachePattern(pattern as string);
      return data({ success: true, message: `Cache entries matching "${pattern}" invalidated` });
    }

    return data({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    return data(
      {
        error: "Cache operation failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
