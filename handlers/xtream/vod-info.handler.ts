/**
 * VOD Info Handler - Business logic for VOD stream details
 * Retrieves complete VOD stream information including stream_id and extension
 */
import type { XtreamVODStream } from "../../types/xtream.types";
import { xtreamService } from "../../services/api/xtream.service";
import { getConfigHandler } from "./config.handler";

/**
 * Retrieves detailed information for a specific VOD stream
 *
 * @param streamId - The stream ID of the VOD content
 * @returns VOD stream information including stream_id and container_extension
 * @throws Error if configuration is missing or API call fails
 */
export async function getVODInfoHandler(streamId: number): Promise<XtreamVODStream | null> {
  const config = getConfigHandler();
  if (!config) {
    throw new Error("Please configure your Xtream API connection first.");
  }
  
  // Fetch all VOD streams and find the one matching streamId
  // Note: Xtream API doesn't have a direct endpoint for single stream info
  // So we fetch all streams and filter
  const streams = await xtreamService.getVODStreams(config);
  const stream = streams.find((s) => s.stream_id === streamId);
  
  return stream || null;
}
