// Cache Types

export interface CachedItem {
  id: string;
  type: "vod" | "series";
  name: string;
  poster_url: string | null;
  category_id: string | null;
}
