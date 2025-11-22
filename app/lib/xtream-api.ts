// Xtream API configuration and utilities

export interface XtreamConfig {
  serverUrl: string;
  username: string;
  password: string;
  port?: number;
  useProxy?: boolean; // Use server-side proxy to bypass CORS/DNS restrictions
}

export interface XtreamVODCategory {
  category_id: string;
  category_name: string;
  parent_id: number;
}

export interface XtreamVODStream {
  stream_id: number;
  num: number;
  name: string;
  stream_type: string;
  stream_icon: string;
  rating: string;
  rating_5based: number;
  added: string;
  category_id: string;
  container_extension: string;
  custom_sid: string;
  direct_source: string;
}

export interface XtreamSeriesCategory {
  category_id: string;
  category_name: string;
  parent_id: number;
}

export interface XtreamSeries {
  series_id: number;
  name: string;
  cover: string;
  plot: string;
  cast: string;
  director: string;
  genre: string;
  releaseDate: string;
  rating: string;
  rating_5based: number;
  backdrop_path: string[];
  youtube_trailer: string;
  episode_run_time: string;
  category_id: string;
}

export interface XtreamSeriesInfo {
  info: {
    name: string;
    cover: string;
    plot: string;
    cast: string;
    director: string;
    genre: string;
    releaseDate: string;
    rating: string;
    rating_5based: number;
    backdrop_path: string[];
    youtube_trailer: string;
    episode_run_time: string;
    category_id: string;
  };
  episodes: Array<{
    id: number;
    title: string;
    container_extension: string;
    info: {
      plot: string;
      cast: string;
      director: string;
      genre: string;
      releaseDate: string;
      rating: string;
      rating_5based: number;
      duration: string;
      duration_secs: number;
    };
  }>;
}

const CONFIG_STORAGE_KEY = "xtream_config";

export function saveConfig(config: XtreamConfig): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
  }
}

export function getConfig(): XtreamConfig | null {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem(CONFIG_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  }
  return null;
}

function buildApiUrl(config: XtreamConfig, action: string, params?: Record<string, string>): string {
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

export async function testConnection(config: XtreamConfig): Promise<boolean> {
  try {
    const url = buildApiUrl(config, "get_user_info");
    const response = await fetch(url);
    return response.ok;
  } catch {
    return false;
  }
}

export async function getVODCategories(config: XtreamConfig): Promise<XtreamVODCategory[]> {
  const url = buildApiUrl(config, "get_vod_categories");
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch VOD categories: ${response.statusText}`);
  }
  return response.json();
}

export async function getVODStreams(config: XtreamConfig, categoryId?: string): Promise<XtreamVODStream[]> {
  const params = categoryId ? { category_id: categoryId } : undefined;
  const url = buildApiUrl(config, "get_vod_streams", params);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch VOD streams: ${response.statusText}`);
  }
  return response.json();
}

export async function getSeriesCategories(config: XtreamConfig): Promise<XtreamSeriesCategory[]> {
  const url = buildApiUrl(config, "get_series_categories");
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch series categories: ${response.statusText}`);
  }
  return response.json();
}

export async function getSeries(config: XtreamConfig, categoryId?: string): Promise<XtreamSeries[]> {
  const params = categoryId ? { category_id: categoryId } : undefined;
  const url = buildApiUrl(config, "get_series", params);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch series: ${response.statusText}`);
  }
  return response.json();
}

export async function getSeriesInfo(config: XtreamConfig, seriesId: number): Promise<XtreamSeriesInfo> {
  const url = buildApiUrl(config, "get_series_info", { series_id: seriesId.toString() });
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch series info: ${response.statusText}`);
  }
  return response.json();
}
