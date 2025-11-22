/**
 * Xtream API Service - Direct API communication layer
 * Handles all HTTP requests to the Xtream API
 */
import type {
  XtreamConfig,
  XtreamVODCategory,
  XtreamVODStream,
  XtreamSeriesCategory,
  XtreamSeries,
  XtreamSeriesInfo,
} from "../../types/xtream.types";
import { buildApiUrl } from "../../utils/api-url";

/**
 * Service object containing methods for interacting with the Xtream API
 */
export const xtreamService = {
  /**
   * Tests the connection to Xtream API
   *
   * @param config - Xtream API configuration
   * @returns True if connection is successful, false otherwise
   */
  async testConnection(config: XtreamConfig): Promise<boolean> {
    try {
      const url = buildApiUrl(config, "get_user_info");
      const response = await fetch(url);
      return response.ok;
    } catch {
      return false;
    }
  },

  /**
   * Fetches all VOD categories from Xtream API
   *
   * @param config - Xtream API configuration
   * @returns Array of VOD categories
   * @throws Error if the API request fails
   */
  async getVODCategories(config: XtreamConfig): Promise<XtreamVODCategory[]> {
    const url = buildApiUrl(config, "get_vod_categories");
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch VOD categories: ${response.statusText}`);
    }
    return response.json();
  },

  /**
   * Fetches VOD streams from Xtream API, optionally filtered by category
   *
   * @param config - Xtream API configuration
   * @param categoryId - Optional category ID to filter streams
   * @returns Array of VOD streams
   * @throws Error if the API request fails
   */
  async getVODStreams(config: XtreamConfig, categoryId?: string): Promise<XtreamVODStream[]> {
    const params = categoryId ? { category_id: categoryId } : undefined;
    const url = buildApiUrl(config, "get_vod_streams", params);
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch VOD streams: ${response.statusText}`);
    }
    return response.json();
  },

  /**
   * Fetches all Series categories from Xtream API
   *
   * @param config - Xtream API configuration
   * @returns Array of Series categories
   * @throws Error if the API request fails
   */
  async getSeriesCategories(config: XtreamConfig): Promise<XtreamSeriesCategory[]> {
    const url = buildApiUrl(config, "get_series_categories");
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch series categories: ${response.statusText}`);
    }
    return response.json();
  },

  /**
   * Fetches Series from Xtream API, optionally filtered by category
   *
   * @param config - Xtream API configuration
   * @param categoryId - Optional category ID to filter series
   * @returns Array of Series
   * @throws Error if the API request fails
   */
  async getSeries(config: XtreamConfig, categoryId?: string): Promise<XtreamSeries[]> {
    const params = categoryId ? { category_id: categoryId } : undefined;
    const url = buildApiUrl(config, "get_series", params);
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch series: ${response.statusText}`);
    }
    return response.json();
  },

  /**
   * Fetches detailed information for a specific series including episodes
   *
   * @param config - Xtream API configuration
   * @param seriesId - The unique identifier of the series
   * @returns Series information including episodes
   * @throws Error if the API request fails
   */
  async getSeriesInfo(config: XtreamConfig, seriesId: number): Promise<XtreamSeriesInfo> {
    const url = buildApiUrl(config, "get_series_info", { series_id: seriesId.toString() });
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch series info: ${response.statusText}`);
    }
    return response.json();
  },
};
