/**
 * Streaming URL building utilities
 * Constructs Xtream streaming URLs for VOD and Series episodes
 */
import type { XtreamConfig } from "../types/xtream.types";

/**
 * Builds a streaming URL for a VOD movie
 *
 * @param config - Xtream API configuration
 * @param streamId - The stream ID of the VOD content
 * @param extension - File extension (e.g., "mp4", "mkv")
 * @returns Complete streaming URL, potentially proxied through server
 */
export function buildVODStreamUrl(
  config: XtreamConfig,
  streamId: number,
  extension: string = "mp4"
): string {
  let baseUrl = config.serverUrl.trim().replace(/\/$/, "");
  
  // Ensure the URL has a protocol
  if (!baseUrl.match(/^https?:\/\//)) {
    baseUrl = `http://${baseUrl}`;
  }
  
  const url = new URL(`/movie/${config.username}/${config.password}/${streamId}.${extension}`, baseUrl);
  
  // Set port if specified and different from default
  if (config.port && config.port !== 80 && config.port !== 443) {
    url.port = config.port.toString();
  }
  
  const targetUrl = url.toString();
  
  // Default useProxy to true if not explicitly set to false
  const useProxy = config.useProxy !== false;
  
  // If proxy is enabled, route through server-side proxy
  if (useProxy && typeof window !== "undefined") {
    const proxyUrl = new URL("/api/xtream-proxy", window.location.origin);
    proxyUrl.searchParams.set("url", targetUrl);
    return proxyUrl.toString();
  }
  
  return targetUrl;
}

/**
 * Builds a streaming URL for a Series episode
 *
 * @param config - Xtream API configuration
 * @param episodeId - The episode ID
 * @param extension - File extension (e.g., "mp4", "mkv")
 * @returns Complete streaming URL, potentially proxied through server
 */
export function buildSeriesStreamUrl(
  config: XtreamConfig,
  episodeId: number,
  extension: string = "mp4"
): string {
  let baseUrl = config.serverUrl.trim().replace(/\/$/, "");
  
  // Ensure the URL has a protocol
  if (!baseUrl.match(/^https?:\/\//)) {
    baseUrl = `http://${baseUrl}`;
  }
  
  const url = new URL(`/series/${config.username}/${config.password}/${episodeId}.${extension}`, baseUrl);
  
  // Set port if specified and different from default
  if (config.port && config.port !== 80 && config.port !== 443) {
    url.port = config.port.toString();
  }
  
  const targetUrl = url.toString();
  
  // Default useProxy to true if not explicitly set to false
  const useProxy = config.useProxy !== false;
  
  // If proxy is enabled, route through server-side proxy
  if (useProxy && typeof window !== "undefined") {
    const proxyUrl = new URL("/api/xtream-proxy", window.location.origin);
    proxyUrl.searchParams.set("url", targetUrl);
    return proxyUrl.toString();
  }
  
  return targetUrl;
}
