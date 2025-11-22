// Configuration Handler - Business logic for config operations

import type { XtreamConfig } from "../../../types/xtream.types";
import { xtreamService } from "../../../services/api/xtream.service";
import { saveConfig, getConfig } from "../../../utils/config";

export async function testConnectionHandler(config: XtreamConfig): Promise<{ success: boolean; message: string }> {
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

export function getConfigHandler(): XtreamConfig | null {
  return getConfig();
}

export function saveConfigHandler(config: XtreamConfig): void {
  saveConfig(config);
}
