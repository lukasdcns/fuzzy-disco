import { useState, useEffect } from "react";
import type { XtreamConfig } from "../types/xtream.types";
import { getConfigHandler, testConnectionHandler } from "../handlers/xtream/config.handler";

/**
 * Hook for managing Xtream API configuration
 * Provides configuration state and connection testing functionality
 *
 * @returns Configuration state and methods
 * @example
 * ```ts
 * const { config, isLoading, testConnection, isConfigured } = useXtreamConfig();
 * ```
 */

interface UseXtreamConfigReturn {
  config: XtreamConfig | null;
  isLoading: boolean;
  testConnection: (configToTest: XtreamConfig) => Promise<{ success: boolean; message: string }>;
  isConfigured: boolean;
}

export function useXtreamConfig(): UseXtreamConfigReturn {
  const [config, setConfig] = useState<XtreamConfig | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const savedConfig = getConfigHandler();
    setConfig(savedConfig);
    setIsLoading(false);
  }, []);

  const testConnection = async (
    configToTest: XtreamConfig
  ): Promise<{ success: boolean; message: string }> => {
    setIsLoading(true);
    try {
      const result = await testConnectionHandler(configToTest);
      if (result.success) {
        setConfig(configToTest);
      }
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    config,
    isLoading,
    testConnection,
    isConfigured: config !== null,
  };
}
