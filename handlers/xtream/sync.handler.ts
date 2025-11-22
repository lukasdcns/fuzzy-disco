// Sync Handler - Business logic for content synchronization

import type { XtreamConfig } from "../../../types/xtream.types";
import type { CachedItem } from "../../../types/cache.types";
import { xtreamService } from "../../../services/api/xtream.service";
import { storeItems, clearItems } from "../../../app/lib/cache";

export async function syncAllContentHandler(config: XtreamConfig): Promise<{
  success: boolean;
  message: string;
  results: {
    vod: { fetched: number; stored: number; errors: string[] };
    series: { fetched: number; stored: number; errors: string[] };
  };
}> {
  const results = {
    vod: { fetched: 0, stored: 0, errors: [] as string[] },
    series: { fetched: 0, stored: 0, errors: [] as string[] },
  };

  // Fetch all VOD streams
  try {
    const vodStreams = await xtreamService.getVODStreams(config);
    results.vod.fetched = vodStreams.length;

    if (vodStreams.length > 0) {
      const items: CachedItem[] = vodStreams
        .filter((stream) => stream.stream_id && stream.name)
        .map((stream) => ({
          id: String(stream.stream_id),
          type: "vod" as const,
          name: stream.name,
          poster_url: stream.stream_icon || null,
          category_id: stream.category_id ? String(stream.category_id) : null,
        }));

      if (items.length > 0) {
        // Clear existing VOD items before storing new ones
        clearItems("vod");
        storeItems(items);
        results.vod.stored = items.length;
      }
    }
  } catch (error) {
    results.vod.errors.push(
      error instanceof Error ? error.message : "Unknown error fetching VOD streams"
    );
  }

  // Fetch all Series
  try {
    const series = await xtreamService.getSeries(config);
    results.series.fetched = series.length;

    if (series.length > 0) {
      const items: CachedItem[] = series
        .filter((series) => series.series_id && series.name)
        .map((series) => ({
          id: String(series.series_id),
          type: "series" as const,
          name: series.name,
          poster_url: series.cover || null,
          category_id: series.category_id ? String(series.category_id) : null,
        }));

      if (items.length > 0) {
        // Clear existing Series items before storing new ones
        clearItems("series");
        storeItems(items);
        results.series.stored = items.length;
      }
    }
  } catch (error) {
    results.series.errors.push(
      error instanceof Error ? error.message : "Unknown error fetching Series"
    );
  }

  const success = results.vod.stored > 0 || results.series.stored > 0;

  return {
    success,
    message: success
      ? `Synced ${results.vod.stored} VOD streams and ${results.series.stored} series to database`
      : "No content was synced",
    results,
  };
}
