// Sync API Service

import type { XtreamConfig } from "../../types/xtream.types";

interface SyncResponse {
  success: boolean;
  message: string;
  results?: {
    vod: { fetched: number; stored: number; errors: string[] };
    series: { fetched: number; stored: number; errors: string[] };
  };
}

export const syncService = {
  async syncAllContent(config: XtreamConfig): Promise<SyncResponse> {
    const response = await fetch("/api/sync", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ config }),
    });

    if (!response.ok && response.status !== 207) {
      // 207 = Multi-Status (partial success)
      throw new Error(`Failed to sync content: ${response.statusText}`);
    }

    return response.json();
  },
};
