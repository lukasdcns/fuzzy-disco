// Xtream API Service - Direct API communication layer

import type {
  XtreamConfig,
  XtreamVODCategory,
  XtreamVODStream,
  XtreamSeriesCategory,
  XtreamSeries,
  XtreamSeriesInfo,
} from "../../types/xtream.types";
import { buildApiUrl } from "../../utils/api-url";

export const xtreamService = {
  async testConnection(config: XtreamConfig): Promise<boolean> {
    try {
      const url = buildApiUrl(config, "get_user_info");
      const response = await fetch(url);
      return response.ok;
    } catch {
      return false;
    }
  },

  async getVODCategories(config: XtreamConfig): Promise<XtreamVODCategory[]> {
    const url = buildApiUrl(config, "get_vod_categories");
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch VOD categories: ${response.statusText}`);
    }
    return response.json();
  },

  async getVODStreams(config: XtreamConfig, categoryId?: string): Promise<XtreamVODStream[]> {
    const params = categoryId ? { category_id: categoryId } : undefined;
    const url = buildApiUrl(config, "get_vod_streams", params);
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch VOD streams: ${response.statusText}`);
    }
    return response.json();
  },

  async getSeriesCategories(config: XtreamConfig): Promise<XtreamSeriesCategory[]> {
    const url = buildApiUrl(config, "get_series_categories");
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch series categories: ${response.statusText}`);
    }
    return response.json();
  },

  async getSeries(config: XtreamConfig, categoryId?: string): Promise<XtreamSeries[]> {
    const params = categoryId ? { category_id: categoryId } : undefined;
    const url = buildApiUrl(config, "get_series", params);
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch series: ${response.statusText}`);
    }
    return response.json();
  },

  async getSeriesInfo(config: XtreamConfig, seriesId: number): Promise<XtreamSeriesInfo> {
    const url = buildApiUrl(config, "get_series_info", { series_id: seriesId.toString() });
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch series info: ${response.statusText}`);
    }
    return response.json();
  },
};
