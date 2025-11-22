/**
 * Configuration Handler - Business logic for config operations
 * Handles configuration validation, testing, and persistence
 */
import type { XtreamConfig } from "../../types/xtream.types";
import { xtreamService } from "../../services/api/xtream.service";
import { saveConfig, getConfig } from "../../utils/config";

interface ConnectionTestResult {
  success: boolean;
  message: string;
}

/**
 * Tests the connection to Xtream API and saves configuration if successful
 *
 * @param config - Xtream API configuration to test
 * @returns Connection test result with success status and message
 * @throws Never throws, always returns a result object
 */
export async function testConnectionHandler(
  config: XtreamConfig
): Promise<ConnectionTestResult> {
  const isValid = await xtreamService.testConnection(config);
  
  if (isValid) {
    saveConfig(config);
    return {
      success: true,
      message: "Connection successful! Configuration saved.",
    };
  } else {
    return {
      success: false,
      message: "Connection failed. Please check your credentials.",
    };
  }
}

/**
 * Retrieves the saved Xtream API configuration from local storage
 *
 * @returns Saved configuration or null if not configured
 */
export function getConfigHandler(): XtreamConfig | null {
  return getConfig();
}

/**
 * Saves Xtream API configuration to local storage
 *
 * @param config - Configuration to save
 */
export function saveConfigHandler(config: XtreamConfig): void {
  saveConfig(config);
}
