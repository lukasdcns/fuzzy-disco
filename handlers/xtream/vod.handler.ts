// VOD Handler - Business logic for VOD operations

import type { XtreamVODCategory } from "../../../types/xtream.types";
import { xtreamService } from "../../../services/api/xtream.service";
import { getConfigHandler } from "./config.handler";

export async function getVODCategoriesHandler(): Promise<XtreamVODCategory[]> {
  const config = getConfigHandler();
  if (!config) {
    throw new Error("Please configure your Xtream API connection first.");
  }
  return xtreamService.getVODCategories(config);
}
