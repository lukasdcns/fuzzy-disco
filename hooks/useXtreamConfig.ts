// Hook for Xtream configuration

import { useState, useEffect } from "react";
import type { XtreamConfig } from "../types/xtream.types";
import { getConfigHandler, testConnectionHandler } from "../handlers/xtream/config.handler";

export function useXtreamConfig() {
  const [config, setConfig] = useState<XtreamConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedConfig = getConfigHandler();
    setConfig(savedConfig);
    setIsLoading(false);
  }, []);

  const testConnection = async (configToTest: XtreamConfig) => {
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
