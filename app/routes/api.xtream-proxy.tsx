import { data } from "react-router";
import type { Route } from "./+types/api.xtream-proxy";
import { getCache, setCache, generateCacheKey, clearExpiredCache, storeItems, type CachedItem } from "../lib/cache";

/**
 * Server-side proxy route for Xtream API requests
 * This bypasses browser CORS and DNS restrictions by making requests server-side
 * Includes caching to reduce bandwidth and improve performance
 * 
 * Usage: GET /api/xtream-proxy?url=<encoded-xtream-api-url>&refresh=true (optional)
 */
export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const targetUrl = url.searchParams.get("url");
  const forceRefresh = url.searchParams.get("refresh") === "true";

  if (!targetUrl) {
    return data({ error: "Missing 'url' parameter" }, { status: 400 });
  }

  try {
    // Decode the target URL
    const decodedUrl = decodeURIComponent(targetUrl);

    // Validate that it's a valid URL
    let targetUrlObj: URL;
    try {
      targetUrlObj = new URL(decodedUrl);
    } catch {
      return data({ error: "Invalid URL format" }, { status: 400 });
    }

    // Security: Only allow HTTP/HTTPS protocols
    if (!["http:", "https:"].includes(targetUrlObj.protocol)) {
      return data({ error: "Only HTTP and HTTPS protocols are allowed" }, { status: 400 });
    }

    // Generate cache key
    const cacheKey = generateCacheKey(decodedUrl);

    // Check cache first (unless force refresh)
    if (!forceRefresh) {
      const cachedData = getCache(cacheKey);
      if (cachedData !== null) {
        // Return cached data with cache header
        return data(cachedData, {
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
            "Content-Type": "application/json",
            "X-Cache": "HIT",
          },
        });
      }
    }

    // Clean up expired cache entries periodically (10% chance to avoid overhead)
    if (Math.random() < 0.1) {
      clearExpiredCache();
    }

    // Make the request server-side
    const response = await fetch(decodedUrl, {
      method: request.method,
      headers: {
        // Forward relevant headers (excluding host, connection, etc.)
        "User-Agent": request.headers.get("User-Agent") || "React-Router-Xtream-Proxy/1.0",
        "Accept": request.headers.get("Accept") || "*/*",
      },
      // Forward the request signal for cancellation
      signal: request.signal,
    });

    // Get response data
    const contentType = response.headers.get("content-type") || "application/json";
    let responseData: unknown;

    if (contentType.includes("application/json")) {
      responseData = await response.json();
    } else if (contentType.includes("text/")) {
      responseData = await response.text();
    } else {
      // For binary or other types, return as array buffer
      const buffer = await response.arrayBuffer();
      responseData = Array.from(new Uint8Array(buffer));
    }

    // Cache the response (only cache successful responses)
    if (response.ok && contentType.includes("application/json")) {
      setCache(cacheKey, responseData);
      
      // Extract and store items from the response
      extractAndStoreItems(responseData, decodedUrl);
    }

    // Return the proxied response with CORS headers
    return data(responseData, {
      status: response.status,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Type": contentType,
        "X-Cache": "MISS",
      },
    });
  } catch (error) {
    // Handle fetch errors (network issues, timeouts, etc.)
    if (error instanceof Error) {
      if (error.name === "AbortError") {
        return data({ error: "Request was aborted" }, { status: 499 });
      }
      return data(
        { error: "Proxy request failed", message: error.message },
        { status: 502 }
      );
    }
    return data({ error: "Unknown error occurred" }, { status: 500 });
  }
}

// Handle OPTIONS requests for CORS preflight
export async function action({ request }: Route.ActionArgs) {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }
  // For POST requests, forward to loader logic
  return loader({ request } as Route.LoaderArgs);
}

/**
 * Extract items (VOD streams or Series) from API response and store them in the database
 */
function extractAndStoreItems(responseData: unknown, url: string): void {
  try {
    // Check if this is a VOD streams response
    if (url.includes("action=get_vod_streams")) {
      if (Array.isArray(responseData)) {
        const items: CachedItem[] = responseData
          .filter((item: unknown): item is { stream_id: number; name: string; stream_icon?: string; category_id?: string } => {
            return (
              typeof item === "object" &&
              item !== null &&
              "stream_id" in item &&
              "name" in item &&
              typeof (item as { stream_id: unknown }).stream_id === "number" &&
              typeof (item as { name: unknown }).name === "string"
            );
          })
          .map((item) => ({
            id: String(item.stream_id),
            type: "vod" as const,
            name: item.name,
            poster_url: item.stream_icon || null,
            category_id: item.category_id ? String(item.category_id) : null,
          }));

        if (items.length > 0) {
          storeItems(items);
        }
      }
    }
    // Check if this is a Series response
    else if (url.includes("action=get_series")) {
      if (Array.isArray(responseData)) {
        const items: CachedItem[] = responseData
          .filter((item: unknown): item is { series_id: number; name: string; cover?: string; category_id?: string } => {
            return (
              typeof item === "object" &&
              item !== null &&
              "series_id" in item &&
              "name" in item &&
              typeof (item as { series_id: unknown }).series_id === "number" &&
              typeof (item as { name: unknown }).name === "string"
            );
          })
          .map((item) => ({
            id: String(item.series_id),
            type: "series" as const,
            name: item.name,
            poster_url: item.cover || null,
            category_id: item.category_id ? String(item.category_id) : null,
          }));

        if (items.length > 0) {
          storeItems(items);
        }
      }
    }
  } catch (error) {
    // Silently fail - item extraction is not critical
    console.error("Failed to extract items from response:", error);
  }
}
