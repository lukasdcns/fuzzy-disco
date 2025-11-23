/**
 * Streaming URL building utilities
 * Constructs Xtream streaming URLs for VOD and Series episodes
 */
import type { XtreamConfig } from "../types/xtream.types";

/**
 * Builds a streaming URL for a VOD movie
 * Format: http://urlxtream/user/pass/id
 *
 * @param config - Xtream API configuration
 * @param streamId - The stream ID of the VOD content
 * @returns Complete streaming URL, potentially proxied through server
 */
export function buildVODStreamUrl(
  config: XtreamConfig,
  streamId: number
): string {
  let baseUrl = config.serverUrl.trim().replace(/\/$/, "");
  
  // Ensure the URL has a protocol
  if (!baseUrl.match(/^https?:\/\//)) {
    baseUrl = `http://${baseUrl}`;
  }
  
  // Format: http://urlxtream/user/pass/id
  const path = `/${config.username}/${config.password}/${streamId}`;
  
  const url = new URL(path, baseUrl);
  
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
 * Format: http://urlxtream/user/pass/id
 *
 * @param config - Xtream API configuration
 * @param episodeId - The episode ID
 * @returns Complete streaming URL, potentially proxied through server
 */
export function buildSeriesStreamUrl(
  config: XtreamConfig,
  episodeId: number
): string {
  let baseUrl = config.serverUrl.trim().replace(/\/$/, "");
  
  // Ensure the URL has a protocol
  if (!baseUrl.match(/^https?:\/\//)) {
    baseUrl = `http://${baseUrl}`;
  }
  
  // Format: http://urlxtream/user/pass/id
  const path = `/${config.username}/${config.password}/${episodeId}`;
  
  const url = new URL(path, baseUrl);
  
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
