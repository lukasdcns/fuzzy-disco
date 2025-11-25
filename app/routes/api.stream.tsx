/**
 * Streaming Proxy API Route
 * Proxies video streaming requests to bypass CORS restrictions
 * GET /api/stream?serverUrl=...&username=...&password=...&contentId=...&type=vod|series
 */
import { data } from "react-router";
import type { Route } from "./+types/api.stream";

/**
 * Streaming proxy loader
 * Proxies video streaming requests with proper CORS headers
 *
 * @param args - Route loader arguments containing the request
 * @returns Response with proxied video stream or error
 */
export async function loader({ request }: Route.LoaderArgs): Promise<Response> {
  try {
    const url = new URL(request.url);
    const serverUrl = url.searchParams.get("serverUrl");
    const username = url.searchParams.get("username");
    const password = url.searchParams.get("password");
    const contentId = url.searchParams.get("contentId");
    const type = url.searchParams.get("type") || "vod"; // "vod" or "series"

    if (!serverUrl || !username || !password || !contentId) {
      return data(
        { error: "Missing required parameters: serverUrl, username, password, contentId" },
        { status: 400 }
      );
    }

    // Build the streaming URL
    let baseUrl = serverUrl.trim().replace(/\/$/, "");
    if (!baseUrl.match(/^https?:\/\//)) {
      baseUrl = `http://${baseUrl}`;
    }

    const path = type === "vod" 
      ? `/movie/${username}/${password}/${contentId}`
      : `/series/${username}/${password}/${contentId}`;

    const streamUrl = new URL(path, baseUrl);
    
    // Set port if specified
    const portParam = url.searchParams.get("port");
    if (portParam) {
      streamUrl.port = portParam;
    } else {
      // Try to extract port from serverUrl
      const serverUrlObj = new URL(baseUrl);
      if (serverUrlObj.port) {
        streamUrl.port = serverUrlObj.port;
      }
    }

    // Fetch the video stream
    const response = await fetch(streamUrl.toString(), {
      method: "GET",
      headers: {
        "User-Agent": request.headers.get("User-Agent") || "React-Router-Xtream-Proxy/1.0",
      },
      signal: request.signal,
    });

    if (!response.ok) {
      return data(
        { error: `Failed to fetch stream: ${response.statusText}` },
        { status: response.status }
      );
    }

    // Get the content type from the response
    const contentType = response.headers.get("content-type") || "video/mp4";

    // Stream the video with CORS headers
    return new Response(response.body, {
      status: response.status,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Range, Content-Type",
        "Access-Control-Expose-Headers": "Content-Length, Content-Range, Accept-Ranges",
        "Content-Type": contentType,
        "Accept-Ranges": "bytes",
        "Cache-Control": "public, max-age=3600",
        // Forward content-length and content-range if present
        ...(response.headers.get("content-length") && {
          "Content-Length": response.headers.get("content-length")!,
        }),
        ...(response.headers.get("content-range") && {
          "Content-Range": response.headers.get("content-range")!,
        }),
      },
    });
  } catch (error) {
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

/**
 * Handle OPTIONS requests for CORS preflight
 */
export async function action({ request }: Route.ActionArgs): Promise<Response> {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Range, Content-Type",
        "Access-Control-Max-Age": "86400",
      },
    });
  }
  return data({ error: "Method not allowed" }, { status: 405 });
}
