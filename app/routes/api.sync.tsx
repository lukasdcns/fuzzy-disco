import { data } from "react-router";
import type { Route } from "./+types/api.sync";
import type { XtreamConfig } from "../../types/xtream.types";
import { syncAllContentHandler } from "../../handlers/xtream/sync.handler";

/**
 * API route to sync all content from Xtream API to database
 * POST /api/sync - Fetch all VOD streams and Series and store in database
 * 
 * This endpoint:
 * 1. Fetches all VOD streams (without category filter = all streams)
 * 2. Fetches all Series (without category filter = all series)
 * 3. Stores them in the items table
 *
 * @param args - Route action arguments containing the request
 * @returns Response with sync results or error
 */
export async function action({ request }: Route.ActionArgs): Promise<Response> {
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

    const response = await syncAllContentHandler(config);
    const hasErrors = response.results.vod.errors.length > 0 || response.results.series.errors.length > 0;

    return data(
      response,
      { status: response.success ? 200 : hasErrors ? 207 : 200 } // 207 = Multi-Status (partial success)
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
