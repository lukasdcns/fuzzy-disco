// Configuration utilities

import type { XtreamConfig } from "../types/xtream.types";

const CONFIG_STORAGE_KEY = "xtream_config";

export function saveConfig(config: XtreamConfig): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
  }
}

export function getConfig(): XtreamConfig | null {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem(CONFIG_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  }
  return null;
}
