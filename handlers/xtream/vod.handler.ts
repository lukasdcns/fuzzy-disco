/**
 * VOD Handler - Business logic for VOD operations
 * Handles VOD category retrieval with configuration validation
 */
import type { XtreamVODCategory } from "../../types/xtream.types";
import { xtreamService } from "../../services/api/xtream.service";
import { getConfigHandler } from "./config.handler";

/**
 * Retrieves all VOD categories from the Xtream API
 *
 * @returns Array of VOD categories
 * @throws Error if configuration is missing or API call fails
 */
export async function getVODCategoriesHandler(): Promise<XtreamVODCategory[]> {
  const config = getConfigHandler();
  if (!config) {
    throw new Error("Please configure your Xtream API connection first.");
  }
  return xtreamService.getVODCategories(config);
}
