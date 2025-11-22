// Hook for content synchronization

import { useState } from "react";
import type { XtreamConfig } from "../types/xtream.types";

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
      const response = await fetch("/api/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ config }),
      });

      const data = await response.json();

      if (response.ok || response.status === 207) {
        // 207 = Multi-Status (partial success)
        const result = {
          success: data.success,
          message: data.message,
          details: data.results,
        };
        setResult(result);
        return {
          success: data.success,
          message: data.message,
          results: data.results,
        };
      } else {
        throw new Error(data.error || data.message || "Failed to sync content");
      }
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
