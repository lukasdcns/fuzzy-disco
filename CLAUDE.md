# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an Xtream API client built with React Router 7 (formerly Remix). It provides a web interface for browsing and streaming VOD (Video on Demand) content and TV series from Xtream-compatible IPTV services. The application uses server-side rendering, includes a server-side proxy to bypass CORS restrictions, and implements a SQLite-based caching system.

## Development Commands

```bash
# Start development server with HMR
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Type checking (generates types then runs tsc)
npm run typecheck
```

The dev server runs at `http://localhost:5173`.

## Architecture

### Core Application Structure

- **React Router 7 with SSR**: Uses file-based routing via `app/routes.ts` configuration
- **Server-Side Proxy Pattern**: All Xtream API requests go through `/api/xtream-proxy` to bypass CORS and DNS restrictions
- **SQLite Caching Layer**: Implements a server-only caching system in `app/lib/cache.server.ts` using better-sqlite3
- **Type-Safe API**: TypeScript types for Xtream API responses in `types/xtream.types.ts`

### Key Architectural Patterns

1. **Server-Side Only Modules**: Files in `app/lib/*.server.ts` contain server-only code that throws errors if imported on the client. These files use runtime checks:
   ```typescript
   if (typeof window !== "undefined" || typeof process === "undefined" || !process.versions?.node) {
     throw new Error("cache.ts is server-side only");
   }
   ```

2. **Proxy-Based API Access**: Client code doesn't make direct requests to Xtream APIs. Instead:
   - Client → `/api/xtream-proxy?url=<encoded-xtream-url>` → Server → Xtream API
   - The proxy handles caching, CORS headers, and network issues
   - Use `buildApiUrl()` from `utils/api-url.ts` to construct proxy URLs

3. **Streaming URL Format**: Video streams use specific URL patterns:
   - VOD: `http://server/movie/username/password/contentId`
   - Series: `http://server/series/username/password/contentId`
   - Built via `buildVODStreamUrl()` and `buildSeriesStreamUrl()` in `utils/stream-url.ts`
   - Can optionally use `/api/stream` proxy endpoint for CORS bypass

4. **Two-Tier Caching**:
   - **API Response Cache**: Generic key-value cache with TTLs (24h for categories, 12h for streams)
   - **Items Table**: Structured storage for VOD/Series metadata enabling fast search and pagination
   - Both use the same SQLite database in `.cache/xtream-cache.db`

### Critical Implementation Details

- **Native Module Handling**: `better-sqlite3` is a native module. The `vite.config.ts` excludes it from optimization (`optimizeDeps.exclude`) to prevent bundling issues.

- **Cache Key Generation**: Cache keys are generated from full API URLs via `generateCacheKey()`. The function normalizes URLs to ensure consistency.

- **Item Extraction**: The proxy automatically extracts VOD/Series items from API responses (`action=get_vod_streams`, `action=get_series`) and stores them in the items table for search functionality.

- **Configuration Storage**: User configuration (server URL, credentials) is stored in localStorage via `utils/config.ts`. The config page (`routes/config.tsx`) auto-syncs content after successful connection.

## Route Structure

Routes are defined in `app/routes.ts`:

- `routes/home.tsx` - Landing page
- `routes/config.tsx` - Xtream API configuration
- `routes/settings.tsx` - App settings and cache management
- `routes/vod.tsx` - VOD list view
- `routes/vod.$id.tsx` - VOD player (dynamic route)
- `routes/series.tsx` - Series list view
- `routes/api.xtream-proxy.tsx` - Main proxy endpoint
- `routes/api.stream.tsx` - Streaming proxy for video playback
- `routes/api.cache.tsx` - Cache management API
- `routes/api.items.tsx` - Items database API
- `routes/api.search.tsx` - Search API
- `routes/api.sync.tsx` - Content sync API

## Custom Hooks

Located in `hooks/`:

- `useXtreamConfig.ts` - Configuration management and connection testing
- `useVOD.ts` - VOD content fetching and management
- `useSeries.ts` - Series content fetching
- `useSync.ts` - Content synchronization to local database
- `useSearch.ts` - Search functionality

## Working with the Cache System

The cache system has two parts:

1. **Generic Cache** (`getCache()`, `setCache()`, `clearCache()`):
   - Stores full API responses with automatic TTL
   - Keys are generated from API URLs
   - Returns `null` for cache misses or expired entries

2. **Items Storage** (`storeItems()`, `getItems()`, `searchItems()`):
   - Structured storage of VOD streams and Series
   - Supports pagination, filtering by type/category
   - Powers the search functionality

When adding new API endpoints that return item lists, ensure you update `extractAndStoreItems()` in `api.xtream-proxy.tsx` to populate the items table.

## Path Aliases

TypeScript path alias `~/*` maps to `./app/*` (configured in `tsconfig.json`).

## Code Style Conventions

### TypeScript

- **Explicit return types**: Always specify return types on functions (`Promise<void>`, `JSX.Element`, `string`, etc.)
- **Type-only imports**: Use `import type { }` for types/interfaces
- **Explicit type annotations**: Annotate state and variables with types: `useState<XtreamConfig | null>(null)`
- **Interface over type**: Prefer `interface` for object shapes, especially for component props
- **No implicit any**: Strict TypeScript mode is enabled

### Documentation

- **JSDoc on all functions**: Every exported function must have JSDoc comments with:
  - Description of what the function does
  - `@param` for each parameter
  - `@returns` for return value
  - `@example` for complex functions (hooks, utilities)
- **File header comments**: Every file starts with a comment block explaining its purpose
- **Inline comments**: Explain "why", not "what"

### Function & Component Style

- **Named exports**: Use `export function` for most exports (not `export default` except for route components)
- **Arrow function syntax**: Use regular function declarations, not arrow functions for top-level exports
- **Explicit void types**: Event handlers and callbacks should be typed as `: void` if they don't return values
- **Early returns**: Use guard clauses and early returns for better readability
- **Destructure props**: Destructure component props in function parameters

### Naming

- **camelCase**: Functions, variables, parameters
- **PascalCase**: Components, interfaces, types
- **UPPER_SNAKE_CASE**: Constants (e.g., `CACHE_TTL`)
- **Descriptive names**: Function names should be verbs (`buildApiUrl`, `testConnection`, `handleSubmit`)

### React Patterns

- **Explicit JSX.Element**: Components return `JSX.Element` type
- **Optional chaining**: Use `?.()` for optional callbacks (e.g., `onPlay?.()`)
- **Cleanup in useEffect**: Always return cleanup functions from useEffect
- **Type event handlers**: `(e: React.ChangeEvent<HTMLInputElement>): void`

### Formatting

- **Semicolons**: Always use semicolons
- **Double quotes**: Use double quotes for strings
- **Template literals**: Use for string interpolation and multi-line strings
- **Const by default**: Use `const` unless reassignment is needed

### Error Handling

- **Try-catch with logging**: Catch errors and use `console.error()` for logging
- **Graceful degradation**: Functions should handle errors without crashing
- **Error type checking**: Use `error instanceof Error` before accessing `.message`

## Important Notes

- Never import `*.server.ts` files in client code - they will throw runtime errors
- Always use the proxy for Xtream API requests; direct fetch from client will fail due to CORS
- Cache TTLs are defined in `cache.server.ts` as `CACHE_TTL` constants
- The database schema is auto-created on first run (see `getDatabase()` in `cache.server.ts`)
- Video streaming should use the `/api/stream` proxy endpoint to handle CORS properly
