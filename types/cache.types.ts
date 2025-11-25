// Cache Types

export interface CachedItem {
  id: string;
  stream_id: string; // The actual stream_id or series_id from Xtream API
  type: "vod" | "series";
  name: string;
  poster_url: string | null;
  category_id: string | null;
}
