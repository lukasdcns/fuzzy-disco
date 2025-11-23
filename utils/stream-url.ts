/**
 * Streaming URL building utilities
 * Constructs Xtream streaming URLs for VOD and Series episodes
 */
import type { XtreamConfig } from "../types/xtream.types";

/**
 * Builds a streaming URL for a VOD movie
 * Format: http://urlxtream:port/movies/user/pass/id
 *
 * @param config - Xtream API configuration
 * @param streamId - The stream ID of the VOD content
 * @returns Complete streaming URL (direct, no proxy)
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
  
  // Format: http://urlxtream:port/movies/user/pass/id
  const path = `/movies/${config.username}/${config.password}/${streamId}`;
  
  const url = new URL(path, baseUrl);
  
  // Set port if specified and different from default
  if (config.port && config.port !== 80 && config.port !== 443) {
    url.port = config.port.toString();
  }
  
  // Use proxy for streaming URLs to bypass CORS restrictions
  // Format: /api/stream?serverUrl=...&username=...&password=...&contentId=...&type=vod
  if (typeof window !== "undefined") {
    const proxyUrl = new URL("/api/stream", window.location.origin);
    proxyUrl.searchParams.set("serverUrl", config.serverUrl);
    proxyUrl.searchParams.set("username", config.username);
    proxyUrl.searchParams.set("password", config.password);
    proxyUrl.searchParams.set("contentId", streamId.toString());
    proxyUrl.searchParams.set("type", "vod");
    if (config.port) {
      proxyUrl.searchParams.set("port", config.port.toString());
    }
    return proxyUrl.toString();
  }
  
  return url.toString();
}

/**
 * Builds a streaming URL for a Series episode
 * Format: http://urlxtream:port/series/user/pass/id
 *
 * @param config - Xtream API configuration
 * @param episodeId - The episode ID
 * @returns Complete streaming URL (proxied through /api/stream to bypass CORS)
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
  
  // Format: http://urlxtream:port/series/user/pass/id
  const path = `/series/${config.username}/${config.password}/${episodeId}`;
  
  const url = new URL(path, baseUrl);
  
  // Set port if specified and different from default
  if (config.port && config.port !== 80 && config.port !== 443) {
    url.port = config.port.toString();
  }
  
  // Use proxy for streaming URLs to bypass CORS restrictions
  // Format: /api/stream?serverUrl=...&username=...&password=...&contentId=...&type=series
  if (typeof window !== "undefined") {
    const proxyUrl = new URL("/api/stream", window.location.origin);
    proxyUrl.searchParams.set("serverUrl", config.serverUrl);
    proxyUrl.searchParams.set("username", config.username);
    proxyUrl.searchParams.set("password", config.password);
    proxyUrl.searchParams.set("contentId", episodeId.toString());
    proxyUrl.searchParams.set("type", "series");
    if (config.port) {
      proxyUrl.searchParams.set("port", config.port.toString());
    }
    return proxyUrl.toString();
  }
  
  return url.toString();
}
