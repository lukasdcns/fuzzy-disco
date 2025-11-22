import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import type { Route } from "./+types/config";
import { getConfig, saveConfig, testConnection, type XtreamConfig } from "../lib/xtream-api";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Xtream API Configuration" },
    { name: "description", content: "Configure your Xtream API connection" },
  ];
}

export default function Config() {
  const navigate = useNavigate();
  const [config, setConfig] = useState<XtreamConfig>({
    serverUrl: "",
    username: "",
    password: "",
    port: 80,
    useProxy: true, // Default to using proxy to bypass CORS/DNS issues
  });
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const savedConfig = getConfig();
    if (savedConfig) {
      // Ensure useProxy defaults to true if not set (for old configs)
      setConfig({
        ...savedConfig,
        useProxy: savedConfig.useProxy !== false, // Default to true if undefined
      });
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTestResult(null);
    setSaved(false);

    try {
      const isValid = await testConnection(config);
      if (isValid) {
        saveConfig(config);
        setSaved(true);
        setTestResult({ success: true, message: "Connection successful! Configuration saved." });
        setTimeout(() => {
          navigate("/");
        }, 1500);
      } else {
        setTestResult({ success: false, message: "Connection failed. Please check your credentials." });
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: error instanceof Error ? error.message : "An error occurred while testing the connection.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Xtream API Configuration
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="serverUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Server URL
              </label>
              <input
                id="serverUrl"
                type="text"
                required
                value={config.serverUrl}
                onChange={(e) => setConfig({ ...config, serverUrl: e.target.value })}
                placeholder="http://example.com"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Username
              </label>
              <input
                id="username"
                type="text"
                required
                value={config.username}
                onChange={(e) => setConfig({ ...config, username: e.target.value })}
                placeholder="Your username"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={config.password}
                onChange={(e) => setConfig({ ...config, password: e.target.value })}
                placeholder="Your password"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label htmlFor="port" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Port (optional)
              </label>
              <input
                id="port"
                type="number"
                value={config.port || ""}
                onChange={(e) => setConfig({ ...config, port: e.target.value ? parseInt(e.target.value) : 80 })}
                placeholder="80"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div className="flex items-center">
              <input
                id="useProxy"
                type="checkbox"
                checked={config.useProxy !== false}
                onChange={(e) => setConfig({ ...config, useProxy: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="useProxy" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                Use server-side proxy (recommended - bypasses CORS/DNS restrictions)
              </label>
            </div>

            {testResult && (
              <div
                className={`p-4 rounded-md ${
                  testResult.success
                    ? "bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200"
                    : "bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200"
                }`}
              >
                {testResult.message}
              </div>
            )}

            {saved && (
              <div className="p-4 rounded-md bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200">
                Configuration saved successfully!
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200"
            >
              {isLoading ? "Testing Connection..." : "Save & Test Connection"}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => navigate("/")}
              className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
