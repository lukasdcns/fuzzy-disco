import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import type { Route } from "./+types/settings";
import { getConfig, type XtreamConfig } from "../lib/xtream-api";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Settings" },
    { name: "description", content: "Account settings and content sync" },
  ];
}

export default function Settings() {
  const navigate = useNavigate();
  const [config, setConfig] = useState<XtreamConfig | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{
    success: boolean;
    message: string;
    details?: {
      vod: { fetched: number; stored: number; errors: string[] };
      series: { fetched: number; stored: number; errors: string[] };
    };
  } | null>(null);

  useEffect(() => {
    const savedConfig = getConfig();
    setConfig(savedConfig);
  }, []);

  const handleSync = async () => {
    if (!config) {
      setSyncResult({
        success: false,
        message: "Please configure your Xtream API connection first.",
      });
      return;
    }

    setIsSyncing(true);
    setSyncResult(null);

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
        setSyncResult({
          success: data.success,
          message: data.message,
          details: data.results,
        });
      } else {
        setSyncResult({
          success: false,
          message: data.error || data.message || "Failed to sync content",
        });
      }
    } catch (error) {
      setSyncResult({
        success: false,
        message: error instanceof Error ? error.message : "An error occurred while syncing content",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  if (!config) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
              Configuration Required
            </h2>
            <p className="text-yellow-700 dark:text-yellow-300 mb-4">
              Please configure your Xtream API connection first.
            </p>
            <button
              onClick={() => navigate("/config")}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition-colors"
            >
              Go to Configuration
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <button
            onClick={() => navigate("/")}
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            ← Back to Home
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8 space-y-6">
          {/* Account Info Section */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Account Information
            </h2>
            <div className="space-y-2">
              <div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Server URL:
                </span>
                <span className="ml-2 text-gray-900 dark:text-white">
                  {config.serverUrl}
                  {config.port && config.port !== 80 && `:${config.port}`}
                </span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Username:
                </span>
                <span className="ml-2 text-gray-900 dark:text-white">{config.username}</span>
              </div>
            </div>
            <button
              onClick={() => navigate("/config")}
              className="mt-4 text-blue-600 dark:text-blue-400 hover:underline text-sm"
            >
              Edit Configuration →
            </button>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Content Sync
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Fetch all VOD streams and Series from your Xtream API and store them in the database
              for faster access. This may take a few minutes depending on the amount of content.
            </p>

            <button
              onClick={handleSync}
              disabled={isSyncing}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200 flex items-center gap-2"
            >
              {isSyncing ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Syncing...
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Sync All Content
                </>
              )}
            </button>

            {syncResult && (
              <div
                className={`mt-4 p-4 rounded-md ${
                  syncResult.success
                    ? "bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200"
                    : "bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200"
                }`}
              >
                <p className="font-semibold mb-2">{syncResult.message}</p>
                {syncResult.details && (
                  <div className="mt-2 text-sm space-y-1">
                    <div>
                      VOD: {syncResult.details.vod.stored} items stored (from{" "}
                      {syncResult.details.vod.fetched} fetched)
                    </div>
                    <div>
                      Series: {syncResult.details.series.stored} items stored (from{" "}
                      {syncResult.details.series.fetched} fetched)
                    </div>
                    {syncResult.details.vod.errors.length > 0 && (
                      <div className="text-red-600 dark:text-red-400 mt-2">
                        VOD Errors: {syncResult.details.vod.errors.join(", ")}
                      </div>
                    )}
                    {syncResult.details.series.errors.length > 0 && (
                      <div className="text-red-600 dark:text-red-400 mt-2">
                        Series Errors: {syncResult.details.series.errors.join(", ")}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
