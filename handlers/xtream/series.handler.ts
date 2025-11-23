/**
 * Series Handler - Business logic for Series operations
 * Handles Series category and info retrieval with configuration validation
 */
import type { XtreamSeriesCategory, XtreamSeriesInfo } from "../../types/xtream.types";
import { xtreamService } from "../../services/api/xtream.service";
import { getConfigHandler } from "./config.handler";

/**
 * Normalizes episodes data to ensure it's always an array
 * Xtream API may return episodes as an object with numeric keys
 */
function normalizeEpisodes(episodes: unknown): XtreamSeriesInfo["episodes"] {
  if (Array.isArray(episodes)) {
    return episodes;
  }
  
  if (episodes && typeof episodes === "object") {
    const normalized = Object.values(episodes).filter(
      (ep): ep is XtreamSeriesInfo["episodes"][0] =>
        typeof ep === "object" &&
        ep !== null &&
        "id" in ep &&
        "title" in ep &&
        typeof (ep as { id: unknown }).id === "number" &&
        typeof (ep as { title: unknown }).title === "string"
    );
    return normalized as XtreamSeriesInfo["episodes"];
  }
  
  return [];
}

/**
 * Retrieves all Series categories from the Xtream API
 *
 * @returns Array of Series categories
 * @throws Error if configuration is missing or API call fails
 */
export async function getSeriesCategoriesHandler(): Promise<XtreamSeriesCategory[]> {
  const config = getConfigHandler();
  if (!config) {
    throw new Error("Please configure your Xtream API connection first.");
  }
  return xtreamService.getSeriesCategories(config);
}

/**
 * Retrieves detailed information for a specific series including episodes
 *
 * @param seriesId - The unique identifier of the series
 * @returns Series information including episodes
 * @throws Error if configuration is missing or API call fails
 */
export async function getSeriesInfoHandler(seriesId: number): Promise<XtreamSeriesInfo> {
  const config = getConfigHandler();
  if (!config) {
    throw new Error("Please configure your Xtream API connection first.");
  }
  const seriesInfo = await xtreamService.getSeriesInfo(config, seriesId);
  
  // Normalize episodes to always be an array
  // Xtream API sometimes returns episodes as an object with numeric keys
  return {
    ...seriesInfo,
    episodes: normalizeEpisodes(seriesInfo.episodes),
  };
}
