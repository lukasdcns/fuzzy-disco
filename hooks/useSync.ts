import { useState } from "react";
import type { XtreamConfig } from "../types/xtream.types";

/**
 * Hook for content synchronization
 * Manages syncing all VOD and Series content from Xtream API to local database
 *
 * @returns Sync state and sync function
 * @example
 * ```ts
 * const { isSyncing, result, syncAllContent } = useSync();
 * await syncAllContent(config);
 * ```
 */

interface SyncResult {
  success: boolean;
  message: string;
  details?: {
    vod: { fetched: number; stored: number; errors: string[] };
    series: { fetched: number; stored: number; errors: string[] };
  };
}

interface SyncResponse {
  success: boolean;
  message: string;
  results: {
    vod: { fetched: number; stored: number; errors: string[] };
    series: { fetched: number; stored: number; errors: string[] };
  };
}

interface UseSyncReturn {
  isSyncing: boolean;
  result: SyncResult | null;
  syncAllContent: (config: XtreamConfig) => Promise<SyncResponse>;
}

export function useSync(): UseSyncReturn {
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [result, setResult] = useState<SyncResult | null>(null);

  const syncAllContent = async (config: XtreamConfig): Promise<SyncResponse> => {
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
        const syncResult: SyncResult = {
          success: data.success,
          message: data.message,
          details: data.results,
        };
        setResult(syncResult);
        return {
          success: data.success,
          message: data.message,
          results: data.results,
        };
      } else {
        throw new Error(data.error || data.message || "Failed to sync content");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An error occurred while syncing content";
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
