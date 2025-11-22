// Sync Handler - Business logic for content synchronization

import type { XtreamConfig } from "../../../types/xtream.types";
import { syncService } from "../../../services/api/sync.service";

export async function syncAllContentHandler(config: XtreamConfig): Promise<{
  success: boolean;
  message: string;
  results?: {
    vod: { fetched: number; stored: number; errors: string[] };
    series: { fetched: number; stored: number; errors: string[] };
  };
}> {
  try {
    const response = await syncService.syncAllContent(config);
    return response;
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to sync content",
    };
  }
}
