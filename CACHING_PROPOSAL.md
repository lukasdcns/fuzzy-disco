# Caching Solution Proposal for Xtream API Content

## Problem Statement
Currently, all Xtream API content (VOD categories, streams, series, etc.) is fetched fresh on every page load/request. This:
- Consumes bandwidth unnecessarily
- Slows down page loads
- Makes the app unusable offline
- Increases load on Xtream API server

## Solution Options

### Option 1: IndexedDB (Client-Side) - **RECOMMENDED** ⭐

**Technology**: `idb-keyval` or `idb` library
**Storage**: Browser IndexedDB (client-side)
**Best For**: Single-user scenarios, offline support, fast client-side access

**Pros:**
- ✅ Large storage capacity (typically 50%+ of disk space)
- ✅ Works offline
- ✅ Fast client-side access
- ✅ No server infrastructure needed
- ✅ Data persists across sessions
- ✅ Simple to implement
- ✅ No additional dependencies complexity

**Cons:**
- ❌ Data is per-browser/user (not shared)
- ❌ Limited by browser storage quotas
- ❌ Data lost if browser data cleared

**Implementation:**
- Use `idb-keyval` for simple key-value storage
- Cache keys: `vod_categories`, `vod_streams_${categoryId}`, `series_categories`, `series_${categoryId}`, `series_info_${seriesId}`
- Add TTL (Time To Live) for cache expiration (e.g., 24 hours)
- Cache invalidation on config change

**Dependencies:**
```json
{
  "idb-keyval": "^6.2.1"
}
```

**Estimated Implementation Time:** 2-3 hours

---

### Option 2: Server-Side Database (SQLite/PostgreSQL)

**Technology**: SQLite (embedded) or PostgreSQL
**Storage**: Server-side database file
**Best For**: Multi-user scenarios, shared cache, production deployments

**Pros:**
- ✅ Shared cache across all users
- ✅ More control over cache management
- ✅ Can implement cache warming
- ✅ Better for production/enterprise use
- ✅ Can add analytics/usage tracking

**Cons:**
- ❌ Requires database setup/maintenance
- ❌ More complex implementation
- ❌ Server-side only (no offline support)
- ❌ Additional infrastructure

**Implementation:**
- Use SQLite for simplicity (no external DB needed)
- Or PostgreSQL for production
- Cache table structure:
  ```sql
  CREATE TABLE cache (
    key TEXT PRIMARY KEY,
    value JSONB,
    expires_at TIMESTAMP,
    created_at TIMESTAMP
  );
  ```
- Server-side cache middleware in proxy route

**Dependencies:**
```json
{
  "better-sqlite3": "^9.0.0"  // For SQLite
  // OR
  "pg": "^8.11.0"  // For PostgreSQL
}
```

**Estimated Implementation Time:** 4-6 hours

---

### Option 3: Hybrid Approach (IndexedDB + Server Cache)

**Technology**: Both IndexedDB and server-side cache
**Storage**: Client-side IndexedDB + Server-side database
**Best For**: Best of both worlds, production-ready

**Pros:**
- ✅ Fast client-side access (IndexedDB)
- ✅ Shared server cache reduces API calls
- ✅ Works offline (IndexedDB)
- ✅ Optimal performance

**Cons:**
- ❌ Most complex implementation
- ❌ Requires both client and server code
- ❌ More maintenance

**Implementation:**
- Client: IndexedDB for immediate access
- Server: Database cache for shared data
- Client checks IndexedDB first, then server cache, then API

**Estimated Implementation Time:** 6-8 hours

---

### Option 4: React Router Built-in Cache

**Technology**: React Router v7 cache headers
**Storage**: Browser HTTP cache + React Router cache
**Best For**: Simple caching without external dependencies

**Pros:**
- ✅ No additional dependencies
- ✅ Uses browser cache
- ✅ Simple to implement
- ✅ Works with SSR

**Cons:**
- ❌ Limited control
- ❌ Browser-dependent
- ❌ Less reliable than IndexedDB
- ❌ Cache can be cleared by browser/user

**Implementation:**
- Add cache headers to proxy route responses
- Use React Router's `shouldRevalidate` function
- Set appropriate Cache-Control headers

**Estimated Implementation Time:** 1-2 hours

---

## Recommended Solution: **Option 1 - IndexedDB with idb-keyval**

### Why This Solution?

1. **Simplicity**: Easiest to implement and maintain
2. **Performance**: Fast client-side access
3. **Offline Support**: Works without internet after first load
4. **No Infrastructure**: No server-side database needed
5. **User Experience**: Instant loading after first fetch

### Implementation Plan

#### Phase 1: Setup Cache Infrastructure
1. Install `idb-keyval` package
2. Create cache utility module (`app/lib/cache.ts`)
3. Define cache keys and TTL constants

#### Phase 2: Integrate with API Functions
1. Update API functions to check cache first
2. Store responses in cache after fetch
3. Add cache expiration logic

#### Phase 3: Cache Management
1. Add cache invalidation on config change
2. Add manual cache clear option in UI
3. Show cache status/hit rate

#### Phase 4: UI Enhancements
1. Show loading state (cache vs network)
2. Add "Refresh" button to bypass cache
3. Display cache info (last updated, size)

### Cache Strategy

**Cache Keys:**
- `vod_categories` - VOD categories list
- `vod_streams_${categoryId}` - VOD streams by category (or `all` for all)
- `series_categories` - Series categories list
- `series_${categoryId}` - Series by category (or `all` for all)
- `series_info_${seriesId}` - Series details with episodes

**TTL (Time To Live):**
- Categories: 24 hours
- Streams/Series lists: 12 hours
- Series details: 6 hours

**Cache Invalidation:**
- When Xtream config changes (different server/credentials)
- Manual refresh button
- TTL expiration

### Code Structure

```
app/lib/
  ├── cache.ts          # Cache utility functions
  ├── xtream-api.ts     # Updated with cache integration
  └── cache-keys.ts     # Cache key constants
```

### Example Usage

```typescript
// Before (current)
const streams = await getVODStreams(config, categoryId);

// After (with cache)
const streams = await getVODStreams(config, categoryId);
// Automatically checks cache first, then API, then stores in cache
```

---

## Alternative: Quick Win with Option 4 (React Router Cache)

If you want a **quick solution** without adding dependencies, we can implement Option 4 first (React Router cache headers) and then upgrade to IndexedDB later.

---

## Decision Matrix

| Criteria | IndexedDB | Server DB | Hybrid | Router Cache |
|----------|-----------|-----------|--------|--------------|
| **Ease of Implementation** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ |
| **Performance** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Offline Support** | ✅ | ❌ | ✅ | ❌ |
| **Shared Cache** | ❌ | ✅ | ✅ | ❌ |
| **Maintenance** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ |
| **Storage Capacity** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ |

---

## Recommendation

**Start with Option 1 (IndexedDB)** because:
1. Best balance of simplicity and performance
2. Works offline (great UX)
3. No server infrastructure needed
4. Easy to upgrade to Hybrid later if needed

**Upgrade path**: If you later need shared cache across users, add server-side caching (Option 3 - Hybrid).

---

## Next Steps

1. **Choose your preferred option** from above
2. **Review this proposal** and ask questions
3. **Approve** and I'll implement it following the CHANGELOG process
4. **Test** the implementation

---

## Questions to Consider

1. Do you need shared cache across multiple users/browsers?
2. Is offline support important?
3. How often does Xtream content change?
4. What's your preferred cache expiration time?
5. Do you want manual cache management UI?
