/** Search radius around the geocoded location. */
export const DEFAULT_SEARCH_RADIUS_METERS = 30_000

export const DEFAULT_LIMIT = 25
export const MAX_LIMIT = 100

export const DATA_PROVIDER = "OpenStreetMap"

/** Hard ceiling for one search, kept under the route's maxDuration. */
export const SEARCH_DEADLINE_MS = 50_000

/** Complete search results are reused for this long (per server process). */
export const RESULT_CACHE_TTL_MS = 6 * 60 * 60 * 1000
/**
 * Results that may be incomplete (a source was busy) are kept briefly, so
 * repeated searches don't keep waiting on an overloaded server.
 */
export const PARTIAL_RESULT_CACHE_TTL_MS = 10 * 60 * 1000
export const RESULT_CACHE_MAX_ENTRIES = 200

// --- Nominatim (geocoding) -------------------------------------------------
export const NOMINATIM_SEARCH_URL = "https://nominatim.openstreetmap.org/search"
export const NOMINATIM_TIMEOUT_MS = 9_000
/** Public Nominatim allows at most 1 request/second; keep a small margin. */
export const NOMINATIM_MIN_INTERVAL_MS = 1_100
/** Nominatim's maximum results per request. */
export const NOMINATIM_PAGE_SIZE = 40
/** Business-search requests to Nominatim per search (on top of one geocode). */
export const NOMINATIM_MAX_BUSINESS_REQUESTS = 2
/** How long a geocoded location is reused from the in-memory cache. */
export const GEOCODE_CACHE_TTL_MS = 24 * 60 * 60 * 1000
export const GEOCODE_CACHE_MAX_ENTRIES = 500

// --- Overpass (business search) -------------------------------------------
/**
 * Public instances, tried in order. Attempts rotate through this list; with a
 * single entry the one allowed retry goes to the same instance. Mirrors
 * (maps.mail.ru, overpass.kumi.systems, overpass.private.coffee) were
 * unreachable or timing out when tested, so they aren't listed.
 */
export const OVERPASS_ENDPOINTS = ["https://overpass-api.de/api/interpreter"]
/** First attempt plus at most one retry, and only when the server says it's busy. */
export const OVERPASS_MAX_ATTEMPTS = 2
export const OVERPASS_RETRY_DELAY_MS = 2_000
/** Server-side query timeout, in seconds, sent inside the query itself. */
export const OVERPASS_QUERY_TIMEOUT_S = 25
/**
 * Per-attempt fetch timeout. Longer than the query's own timeout because a
 * busy server can queue a query for a while before running it.
 */
export const OVERPASS_FETCH_TIMEOUT_MS = 40_000
/** Total time allowed across all attempts. */
export const OVERPASS_TOTAL_BUDGET_MS = 45_000
/** Don't start a retry with less time than this left. */
export const OVERPASS_MIN_ATTEMPT_MS = 10_000

/** Default application identity sent to OpenStreetMap services. */
export const DEFAULT_OSM_USER_AGENT = "BlackWolves-Leads/0.1"
