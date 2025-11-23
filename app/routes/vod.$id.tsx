import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import type { Route } from "./+types/vod.$id";
import { VideoPlayer } from "../../views/VideoPlayer";
import { buildVODStreamUrl } from "../../utils/stream-url";
import { getConfig } from "../../utils/config";
import type { XtreamVODStream } from "../../types/xtream.types";
import { buildApiUrl } from "../../utils/api-url";

/**
 * Meta function for the VOD detail page route
 * @param _args - Route meta arguments
 * @returns Meta tags for SEO
 */
export function meta(_args: Route.MetaArgs) {
  return [
    { title: "VOD Player" },
    { name: "description", content: "Watch VOD content" },
  ];
}

/**
 * VOD detail page component
 * Displays VOD content with video player
 */
export default function VODDetail(): JSX.Element {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vodInfo, setVodInfo] = useState<XtreamVODStream | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [streamUrl, setStreamUrl] = useState<string | null>(null);

  useEffect(() => {
    const loadVODInfo = async (): Promise<void> => {
      if (!id) {
        setError("Invalid VOD ID");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const config = getConfig();
        if (!config) {
          throw new Error("Please configure your Xtream API connection first.");
        }

        // Fetch VOD streams and find the matching one
        const url = buildApiUrl(config, "get_vod_streams");
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch VOD streams: ${response.statusText}`);
        }

        const streams: XtreamVODStream[] = await response.json();
        const stream = streams.find((s) => String(s.stream_id) === id);

        if (!stream) {
          throw new Error("VOD stream not found");
        }

        setVodInfo(stream);

        // Build streaming URL
        const extension = stream.container_extension || "mp4";
        const streamUrlValue = buildVODStreamUrl(config, stream.stream_id, extension);
        setStreamUrl(streamUrlValue);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load VOD information");
      } finally {
        setIsLoading(false);
      }
    };

    loadVODInfo();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !vodInfo || !streamUrl) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-red-800 dark:text-red-200 mb-2">Error</h2>
            <p className="text-red-600 dark:text-red-300">{error || "VOD stream not found"}</p>
            <button
              onClick={() => navigate("/vod")}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
            >
              ← Back to VOD List
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <button
          onClick={() => navigate("/vod")}
          className="mb-6 text-blue-600 dark:text-blue-400 hover:underline"
        >
          ← Back to VOD List
        </button>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            {vodInfo.name}
          </h1>

          <div className="mb-6">
            <VideoPlayer
              streamUrl={streamUrl}
              title={vodInfo.name}
              poster={vodInfo.stream_icon || undefined}
            />
          </div>

          {vodInfo.rating && (
            <div className="mt-4">
              <span className="font-semibold text-gray-900 dark:text-white">Rating: </span>
              <span className="text-gray-700 dark:text-gray-300">{vodInfo.rating}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
