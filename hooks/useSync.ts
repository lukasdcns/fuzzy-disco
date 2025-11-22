// Hook for content synchronization

import { useState } from "react";
import type { XtreamConfig } from "../types/xtream.types";
import { syncAllContentHandler } from "../handlers/xtream/sync.handler";

export function useSync() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    details?: {
      vod: { fetched: number; stored: number; errors: string[] };
      series: { fetched: number; stored: number; errors: string[] };
    };
  } | null>(null);

  const syncAllContent = async (config: XtreamConfig) => {
    setIsSyncing(true);
    setResult(null);

    try {
      const response = await syncAllContentHandler(config);
      setResult({
        success: response.success,
        message: response.message,
        details: response.results,
      });
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred while syncing content";
      setResult({
        success: false,
        message: errorMessage,
      });
      throw error;
    } finally {
      setIsSyncing(false);
    }
  };

  return {
    isSyncing,
    result,
    syncAllContent,
  };
}
