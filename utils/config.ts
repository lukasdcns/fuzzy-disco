/**
 * Configuration utilities for managing Xtream API configuration in localStorage
 */
import type { XtreamConfig } from "../types/xtream.types";

const CONFIG_STORAGE_KEY = "xtream_config";

/**
 * Saves Xtream API configuration to localStorage
 *
 * @param config - Configuration object to save
 */
export function saveConfig(config: XtreamConfig): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
  }
}

/**
 * Retrieves saved Xtream API configuration from localStorage
 *
 * @returns Saved configuration or null if not found
 */
export function getConfig(): XtreamConfig | null {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem(CONFIG_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  }
  return null;
}
