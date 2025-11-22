import Database from "better-sqlite3";
import { join } from "node:path";
import { mkdirSync } from "node:fs";

// Cache configuration
const CACHE_TTL = {
  CATEGORIES: 24 * 60 * 60 * 1000, // 24 hours
  STREAMS: 12 * 60 * 60 * 1000, // 12 hours
  SERIES: 12 * 60 * 60 * 1000, // 12 hours
  SERIES_INFO: 6 * 60 * 60 * 1000, // 6 hours
};

// Database file path
const DB_DIR = join(process.cwd(), ".cache");
const DB_PATH = join(DB_DIR, "xtream-cache.db");

// Initialize database connection (singleton)
let db: Database.Database | null = null;

function getDatabase(): Database.Database {
  if (!db) {
    // Ensure cache directory exists
    try {
      mkdirSync(DB_DIR, { recursive: true });
    } catch (error) {
      // Directory might already exist, ignore error
    }

    db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL"); // Enable Write-Ahead Logging for better performance

    // Create cache table if it doesn't exist
    db.exec(`
      CREATE TABLE IF NOT EXISTS cache (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        expires_at INTEGER NOT NULL,
        created_at INTEGER NOT NULL,
        hit_count INTEGER DEFAULT 0,
        last_accessed INTEGER
      );
      
      CREATE INDEX IF NOT EXISTS idx_expires_at ON cache(expires_at);
      
      -- Items table for structured storage of VOD streams and Series
      CREATE TABLE IF NOT EXISTS items (
        id TEXT NOT NULL,
        type TEXT NOT NULL CHECK(type IN ('vod', 'series')),
        name TEXT NOT NULL,
        poster_url TEXT,
        category_id TEXT,
        updated_at INTEGER NOT NULL,
        PRIMARY KEY (id, type)
      );
      
      CREATE INDEX IF NOT EXISTS idx_items_type ON items(type);
      CREATE INDEX IF NOT EXISTS idx_items_category ON items(category_id);
      CREATE INDEX IF NOT EXISTS idx_items_updated ON items(updated_at);
    `);
  }
  return db;
}

/**
 * Generate cache key from URL
 */
export function generateCacheKey(url: string): string {
  // Use URL as key, but normalize it
  const urlObj = new URL(url);
  // Remove timestamp/random params if any, keep only relevant params
  return urlObj.toString();
}

/**
 * Get TTL for a cache key based on the action/endpoint
 */
function getTTL(key: string): number {
  if (key.includes("get_vod_categories") || key.includes("get_series_categories")) {
    return CACHE_TTL.CATEGORIES;
  }
  if (key.includes("get_series_info")) {
    return CACHE_TTL.SERIES_INFO;
  }
  if (key.includes("get_series")) {
    return CACHE_TTL.SERIES;
  }
  // Default for streams
  return CACHE_TTL.STREAMS;
}

/**
 * Get cached value if it exists and hasn't expired
 */
export function getCache(key: string): unknown | null {
  try {
    const database = getDatabase();
    const now = Date.now();

    const row = database
      .prepare("SELECT value, expires_at FROM cache WHERE key = ?")
      .get(key) as { value: string; expires_at: number } | undefined;

    if (!row) {
      return null;
    }

    // Check if expired
    if (now > row.expires_at) {
      // Delete expired entry
      database.prepare("DELETE FROM cache WHERE key = ?").run(key);
      return null;
    }

    // Update hit count and last accessed
    database
      .prepare(
        "UPDATE cache SET hit_count = hit_count + 1, last_accessed = ? WHERE key = ?"
      )
      .run(now, key);

    // Parse and return cached value
    return JSON.parse(row.value);
  } catch (error) {
    console.error("Cache get error:", error);
    return null;
  }
}

/**
 * Set cache value with TTL
 */
export function setCache(key: string, value: unknown): void {
  try {
    const database = getDatabase();
    const now = Date.now();
    const expiresAt = now + getTTL(key);
    const valueStr = JSON.stringify(value);

    database
      .prepare(
        "INSERT OR REPLACE INTO cache (key, value, expires_at, created_at, hit_count, last_accessed) VALUES (?, ?, ?, ?, 0, ?)"
      )
      .run(key, valueStr, expiresAt, now, now);
  } catch (error) {
    console.error("Cache set error:", error);
  }
}

/**
 * Clear all cache entries
 */
export function clearCache(): void {
  try {
    const database = getDatabase();
    database.prepare("DELETE FROM cache").run();
  } catch (error) {
    console.error("Cache clear error:", error);
  }
}

/**
 * Clear expired cache entries
 */
export function clearExpiredCache(): void {
  try {
    const database = getDatabase();
    const now = Date.now();
    database.prepare("DELETE FROM cache WHERE expires_at < ?").run(now);
  } catch (error) {
    console.error("Cache cleanup error:", error);
  }
}

/**
 * Get cache statistics
 */
export function getCacheStats(): {
  totalEntries: number;
  expiredEntries: number;
  totalHits: number;
  totalSize: number;
} {
  try {
    const database = getDatabase();
    const now = Date.now();

    const totalEntries = database.prepare("SELECT COUNT(*) as count FROM cache").get() as {
      count: number;
    };
    const expiredEntries = database
      .prepare("SELECT COUNT(*) as count FROM cache WHERE expires_at < ?")
      .get(now) as { count: number };
    const totalHits = database
      .prepare("SELECT SUM(hit_count) as total FROM cache")
      .get() as { total: number | null };
    const totalSize = database
      .prepare("SELECT SUM(LENGTH(value)) as size FROM cache")
      .get() as { size: number | null };

    return {
      totalEntries: totalEntries.count,
      expiredEntries: expiredEntries.count,
      totalHits: totalHits.total || 0,
      totalSize: totalSize.size || 0,
    };
  } catch (error) {
    console.error("Cache stats error:", error);
    return {
      totalEntries: 0,
      expiredEntries: 0,
      totalHits: 0,
      totalSize: 0,
    };
  }
}

/**
 * Invalidate cache entries matching a pattern (e.g., all VOD streams)
 */
export function invalidateCachePattern(pattern: string): void {
  try {
    const database = getDatabase();
    database.prepare("DELETE FROM cache WHERE key LIKE ?").run(`%${pattern}%`);
  } catch (error) {
    console.error("Cache invalidation error:", error);
  }
}

/**
 * Close database connection (useful for cleanup)
 */
export function closeCache(): void {
  if (db) {
    db.close();
    db = null;
  }
}

// ============================================================================
// Items Storage Functions
// ============================================================================

export interface CachedItem {
  id: string;
  type: "vod" | "series";
  name: string;
  poster_url: string | null;
  category_id: string | null;
}

/**
 * Store a single item in the items table
 */
export function storeItem(item: CachedItem): void {
  try {
    const database = getDatabase();
    const now = Date.now();

    database
      .prepare(
        `INSERT OR REPLACE INTO items (id, type, name, poster_url, category_id, updated_at) 
         VALUES (?, ?, ?, ?, ?, ?)`
      )
      .run(item.id, item.type, item.name, item.poster_url || null, item.category_id || null, now);
  } catch (error) {
    console.error("Store item error:", error);
  }
}

/**
 * Store multiple items in batch (more efficient)
 */
export function storeItems(items: CachedItem[]): void {
  if (items.length === 0) return;

  try {
    const database = getDatabase();
    const now = Date.now();
    const stmt = database.prepare(
      `INSERT OR REPLACE INTO items (id, type, name, poster_url, category_id, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?)`
    );

    const transaction = database.transaction((items: CachedItem[]) => {
      for (const item of items) {
        stmt.run(item.id, item.type, item.name, item.poster_url || null, item.category_id || null, now);
      }
    });

    transaction(items);
  } catch (error) {
    console.error("Store items error:", error);
  }
}

/**
 * Get all items of a specific type, optionally filtered by category
 */
export function getItems(type: "vod" | "series", categoryId?: string): CachedItem[] {
  try {
    const database = getDatabase();

    if (categoryId) {
      const rows = database
        .prepare("SELECT id, type, name, poster_url, category_id FROM items WHERE type = ? AND category_id = ? ORDER BY name")
        .all(type, categoryId) as Array<{
          id: string;
          type: string;
          name: string;
          poster_url: string | null;
          category_id: string | null;
        }>;

      return rows.map((row) => ({
        id: row.id,
        type: row.type as "vod" | "series",
        name: row.name,
        poster_url: row.poster_url,
        category_id: row.category_id,
      }));
    } else {
      const rows = database
        .prepare("SELECT id, type, name, poster_url, category_id FROM items WHERE type = ? ORDER BY name")
        .all(type) as Array<{
          id: string;
          type: string;
          name: string;
          poster_url: string | null;
          category_id: string | null;
        }>;

      return rows.map((row) => ({
        id: row.id,
        type: row.type as "vod" | "series",
        name: row.name,
        poster_url: row.poster_url,
        category_id: row.category_id,
      }));
    }
  } catch (error) {
    console.error("Get items error:", error);
    return [];
  }
}

/**
 * Get a single item by ID and type
 */
export function getItem(id: string, type: "vod" | "series"): CachedItem | null {
  try {
    const database = getDatabase();

    const row = database
      .prepare("SELECT id, type, name, poster_url, category_id FROM items WHERE id = ? AND type = ?")
      .get(id, type) as
      | {
          id: string;
          type: string;
          name: string;
          poster_url: string | null;
          category_id: string | null;
        }
      | undefined;

    if (!row) {
      return null;
    }

    return {
      id: row.id,
      type: row.type as "vod" | "series",
      name: row.name,
      poster_url: row.poster_url,
      category_id: row.category_id,
    };
  } catch (error) {
    console.error("Get item error:", error);
    return null;
  }
}

/**
 * Clear all items of a specific type
 */
export function clearItems(type: "vod" | "series"): void {
  try {
    const database = getDatabase();
    database.prepare("DELETE FROM items WHERE type = ?").run(type);
  } catch (error) {
    console.error("Clear items error:", error);
  }
}

/**
 * Clear all items
 */
export function clearAllItems(): void {
  try {
    const database = getDatabase();
    database.prepare("DELETE FROM items").run();
  } catch (error) {
    console.error("Clear all items error:", error);
  }
}

/**
 * Get item count by type
 */
export function getItemCount(type?: "vod" | "series"): number {
  try {
    const database = getDatabase();

    if (type) {
      const row = database.prepare("SELECT COUNT(*) as count FROM items WHERE type = ?").get(type) as {
        count: number;
      };
      return row.count;
    } else {
      const row = database.prepare("SELECT COUNT(*) as count FROM items").get() as { count: number };
      return row.count;
    }
  } catch (error) {
    console.error("Get item count error:", error);
    return 0;
  }
}
