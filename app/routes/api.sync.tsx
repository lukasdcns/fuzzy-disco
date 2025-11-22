import { data } from "react-router";
import type { Route } from "./+types/api.sync";
import {
  getVODStreams,
  getSeries,
  type XtreamConfig,
} from "../lib/xtream-api";
import { storeItems, type CachedItem, clearItems } from "../lib/cache";

/**
 * API route to sync all content from Xtream API to database
 * POST /api/sync - Fetch all VOD streams and Series and store in database
 * 
 * This endpoint:
 * 1. Fetches all VOD streams (without category filter = all streams)
 * 2. Fetches all Series (without category filter = all series)
 * 3. Stores them in the items table
 */
export async function action({ request }: Route.ActionArgs) {
  if (request.method !== "POST") {
    return data({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    // Get config from request body (must be provided by client)
    const body = await request.json().catch(() => ({}));
    const config: XtreamConfig | undefined = body.config;

    if (!config) {
      return data(
        { error: "Configuration required. Please provide config in request body." },
        { status: 400 }
      );
    }

    const results = {
      vod: { fetched: 0, stored: 0, errors: [] as string[] },
      series: { fetched: 0, stored: 0, errors: [] as string[] },
    };

    // Fetch all VOD streams
    try {
      const vodStreams = await getVODStreams(config);
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
      const series = await getSeries(config);
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

    const success =
      results.vod.stored > 0 || results.series.stored > 0;
    const hasErrors = results.vod.errors.length > 0 || results.series.errors.length > 0;

    return data(
      {
        success,
        message: success
          ? `Synced ${results.vod.stored} VOD streams and ${results.series.stored} series to database`
          : "No content was synced",
        results,
      },
      { status: success ? 200 : hasErrors ? 207 : 200 } // 207 = Multi-Status (partial success)
    );
  } catch (error) {
    return data(
      {
        error: "Sync failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
