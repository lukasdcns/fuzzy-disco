/**
 * Series Handler - Business logic for Series operations
 * Handles Series category and info retrieval with configuration validation
 */
import type { XtreamSeriesCategory, XtreamSeriesInfo } from "../../../types/xtream.types";
import { xtreamService } from "../../../services/api/xtream.service";
import { getConfigHandler } from "./config.handler";

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
  return xtreamService.getSeriesInfo(config, seriesId);
}
