// Xtream API Types

export interface XtreamConfig {
  serverUrl: string;
  username: string;
  password: string;
  port?: number;
  useProxy?: boolean; // Use server-side proxy to bypass CORS/DNS restrictions
}

export interface XtreamVODCategory {
  category_id: string;
  category_name: string;
  parent_id: number;
}

export interface XtreamVODStream {
  stream_id: number;
  num: number;
  name: string;
  stream_type: string;
  stream_icon: string;
  rating: string;
  rating_5based: number;
  added: string;
  category_id: string;
  container_extension: string;
  custom_sid: string;
  direct_source: string;
}

export interface XtreamSeriesCategory {
  category_id: string;
  category_name: string;
  parent_id: number;
}

export interface XtreamSeries {
  series_id: number;
  name: string;
  cover: string;
  plot: string;
  cast: string;
  director: string;
  genre: string;
  releaseDate: string;
  rating: string;
  rating_5based: number;
  backdrop_path: string[];
  youtube_trailer: string;
  episode_run_time: string;
  category_id: string;
}

export interface XtreamSeriesInfo {
  info: {
    name: string;
    cover: string;
    plot: string;
    cast: string;
    director: string;
    genre: string;
    releaseDate: string;
    rating: string;
    rating_5based: number;
    backdrop_path: string[];
    youtube_trailer: string;
    episode_run_time: string;
    category_id: string;
  };
  episodes: Array<{
    id: number;
    title: string;
    container_extension: string;
    info: {
      plot: string;
      cast: string;
      director: string;
      genre: string;
      releaseDate: string;
      rating: string;
      rating_5based: number;
      duration: string;
      duration_secs: number;
    };
  }>;
}
