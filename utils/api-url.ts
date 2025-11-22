// API URL building utilities

import type { XtreamConfig } from "../types/xtream.types";

export function buildApiUrl(config: XtreamConfig, action: string, params?: Record<string, string>): string {
  let baseUrl = config.serverUrl.trim().replace(/\/$/, "");
  
  // Ensure the URL has a protocol
  if (!baseUrl.match(/^https?:\/\//)) {
    baseUrl = `http://${baseUrl}`;
  }
  
  const url = new URL(`/player_api.php`, baseUrl);
  
  // Set port if specified and different from default
  if (config.port && config.port !== 80 && config.port !== 443) {
    url.port = config.port.toString();
  }
  
  url.searchParams.set("username", config.username);
  url.searchParams.set("password", config.password);
  url.searchParams.set("action", action);
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }
  
  const targetUrl = url.toString();
  
  // Default useProxy to true if not explicitly set to false
  // This ensures proxy is used by default to avoid CORS/DNS issues
  const useProxy = config.useProxy !== false;
  
  // If proxy is enabled, route through server-side proxy
  if (useProxy && typeof window !== "undefined") {
    const proxyUrl = new URL("/api/xtream-proxy", window.location.origin);
    proxyUrl.searchParams.set("url", targetUrl);
    return proxyUrl.toString();
  }
  
  return targetUrl;
}
