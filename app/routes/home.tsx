import { Link } from "react-router";
import type { Route } from "./+types/home";
import { getConfig } from "../lib/xtream-api";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Xtream API Client" },
    { name: "description", content: "Connect to Xtream API and browse VOD/Series content" },
  ];
}

export default function Home() {
  const config = getConfig();
  const isConfigured = config !== null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Xtream API Client
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Connect to your Xtream API and browse VOD and Series content
          </p>
        </div>

        {!isConfigured && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 mb-8">
            <h2 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
              Configuration Required
            </h2>
            <p className="text-yellow-700 dark:text-yellow-300 mb-4">
              Please configure your Xtream API connection to get started.
            </p>
            <Link
              to="/config"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition-colors"
            >
              Go to Configuration
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link
            to="/config"
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="text-center">
              <div className="mb-4">
                <svg
                  className="w-16 h-16 mx-auto text-blue-600 dark:text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Configuration
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Configure your Xtream API connection settings
              </p>
            </div>
          </Link>

          <Link
            to="/vod"
            className={`rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow ${
              isConfigured
                ? "bg-white dark:bg-gray-800 cursor-pointer"
                : "bg-gray-100 dark:bg-gray-700 opacity-50 cursor-not-allowed"
            }`}
            onClick={(e) => {
              if (!isConfigured) {
                e.preventDefault();
              }
            }}
          >
            <div className="text-center">
              <div className="mb-4">
                <svg
                  className="w-16 h-16 mx-auto text-green-600 dark:text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">VOD</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Browse Video on Demand content
              </p>
            </div>
          </Link>

          <Link
            to="/series"
            className={`rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow ${
              isConfigured
                ? "bg-white dark:bg-gray-800 cursor-pointer"
                : "bg-gray-100 dark:bg-gray-700 opacity-50 cursor-not-allowed"
            }`}
            onClick={(e) => {
              if (!isConfigured) {
                e.preventDefault();
              }
            }}
          >
            <div className="text-center">
              <div className="mb-4">
                <svg
                  className="w-16 h-16 mx-auto text-purple-600 dark:text-purple-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Series</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Browse TV series and episodes
              </p>
            </div>
          </Link>

          {isConfigured && (
            <Link
              to="/settings"
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="text-center">
                <div className="mb-4">
                  <svg
                    className="w-16 h-16 mx-auto text-orange-600 dark:text-orange-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                    />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Settings
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Account settings and content sync
                </p>
              </div>
            </Link>
          )}
        </div>

        {isConfigured && (
          <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Connected to:</strong> {config.serverUrl}
              {config.port && config.port !== 80 && `:${config.port}`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
