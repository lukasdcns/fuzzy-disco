import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("config", "routes/config.tsx"),
  route("settings", "routes/settings.tsx"),
  route("vod", "routes/vod.tsx"),
  route("vod/:id", "routes/vod.$id.tsx"),
  route("series", "routes/series.tsx"),
  route("api/xtream-proxy", "routes/api.xtream-proxy.tsx"),
  route("api/cache/*", "routes/api.cache.tsx"),
  route("api/items", "routes/api.items.tsx"),
  route("api/search", "routes/api.search.tsx"), // Added for search API
  route("api/sync", "routes/api.sync.tsx"),
] satisfies RouteConfig;
