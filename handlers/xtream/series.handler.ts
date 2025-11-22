// Series Handler - Business logic for Series operations

import type { XtreamSeriesCategory, XtreamSeriesInfo } from "../../../types/xtream.types";
import { xtreamService } from "../../../services/api/xtream.service";
import { getConfigHandler } from "./config.handler";

export async function getSeriesCategoriesHandler(): Promise<XtreamSeriesCategory[]> {
  const config = getConfigHandler();
  if (!config) {
    throw new Error("Please configure your Xtream API connection first.");
  }
  return xtreamService.getSeriesCategories(config);
}

export async function getSeriesInfoHandler(seriesId: number): Promise<XtreamSeriesInfo> {
  const config = getConfigHandler();
  if (!config) {
    throw new Error("Please configure your Xtream API connection first.");
  }
  return xtreamService.getSeriesInfo(config, seriesId);
}
