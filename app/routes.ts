import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("config", "routes/config.tsx"),
  route("vod", "routes/vod.tsx"),
  route("series", "routes/series.tsx"),
  route("api/xtream-proxy", "routes/api.xtream-proxy.tsx"),
  route("api/cache/*", "routes/api.cache.tsx"),
  route("api/items", "routes/api.items.tsx"),
] satisfies RouteConfig;
