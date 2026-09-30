import "server-only"

import type { OsmElementType } from "@/types/business"
import type { BusinessCategory, OsmTagFilter } from "./category-map"
import {
  BusinessSearchError,
  fetchWithTimeout,
  upstreamStatusError,
} from "./errors"
import { getOsmUserAgent } from "./user-agent"

/*
 * Uses the public Overpass API instance. Like Nominatim, it is a shared free
 * service. When it answers "too busy" (it queues queries by available slots),
 * we wait briefly and try once more — never in a loop, never in parallel.
 * https://wiki.openstreetmap.org/wiki/Overpass_API#Public_Overpass_API_instances
 *
 * Other public instances can be added to OVERPASS_ENDPOINTS; attempts rotate
 * through the list. (maps.mail.ru, kumi.systems and private.coffee were all
 * unreachable or timing out when this was written.)
 */

const OVERPASS_ENDPOINTS = ["https://overpass-api.de/api/interpreter"]
const OVERPASS_MAX_ATTEMPTS = 2
const OVERPASS_RETRY_DELAY_MS = 2_000
/** Server-side query timeout, in seconds, sent inside the query itself. */
const OVERPASS_QUERY_TIMEOUT_S = 25
/** Per-attempt fetch timeout: a little longer than the query's so Overpass can report its own timeout. */
const OVERPASS_FETCH_TIMEOUT_MS = 30_000
/** Total time allowed across all attempts. */
const OVERPASS_TOTAL_BUDGET_MS = 45_000
/** Don't start a retry with less time than this left. */
const OVERPASS_MIN_ATTEMPT_MS = 10_000

export const DEFAULT_SEARCH_RADIUS_METERS = 30_000

export interface OverpassElement {
  type: OsmElementType
  id: number
  lat?: number
  lon?: number
  center?: { lat?: number; lon?: number }
  tags?: Record<string, string>
}

interface OverpassResponse {
  elements?: unknown
  remark?: string
}

// Category tags come from our own map, but validate them anyway so a typo in
// category-map.ts can never produce a malformed or injectable query.
const SAFE_TAG_PART = /^[a-z0-9_:]+$/

function tagSelector({ key, value }: OsmTagFilter) {
  if (!SAFE_TAG_PART.test(key) || !SAFE_TAG_PART.test(value)) {
    throw new Error(`Invalid OSM tag in category map: ${key}=${value}`)
  }
  return `["${key}"="${value}"]`
}

function coordinate(value: number, max: number) {
  if (!Number.isFinite(value) || Math.abs(value) > max) {
    throw new Error(`Invalid coordinate: ${value}`)
  }
  return value.toFixed(6)
}

export function buildOverpassQuery(
  category: BusinessCategory,
  latitude: number,
  longitude: number,
  radiusMeters = DEFAULT_SEARCH_RADIUS_METERS
) {
  const radius = Math.round(radiusMeters)
  if (!Number.isFinite(radius) || radius <= 0) {
    throw new Error(`Invalid search radius: ${radiusMeters}`)
  }
  const around = `(around:${radius},${coordinate(latitude, 90)},${coordinate(longitude, 180)})`

  // ["name"] asks Overpass to skip unnamed objects, which we'd discard anyway.
  const statements = category.tags
    .map((tag) => `  nwr${tagSelector(tag)}["name"]${around};`)
    .join("\n")

  return `[out:json][timeout:${OVERPASS_QUERY_TIMEOUT_S}];
(
${statements}
);
out center tags;`
}

export async function searchOverpass(
  category: BusinessCategory,
  latitude: number,
  longitude: number,
  radiusMeters = DEFAULT_SEARCH_RADIUS_METERS
): Promise<OverpassElement[]> {
  const query = buildOverpassQuery(category, latitude, longitude, radiusMeters)
  const deadline = Date.now() + OVERPASS_TOTAL_BUDGET_MS

  for (let attempt = 1; ; attempt++) {
    const endpoint = OVERPASS_ENDPOINTS[(attempt - 1) % OVERPASS_ENDPOINTS.length]
    try {
      return await queryOverpass(
        endpoint,
        query,
        Math.min(OVERPASS_FETCH_TIMEOUT_MS, deadline - Date.now())
      )
    } catch (error) {
      const canRetry =
        error instanceof BusinessSearchError &&
        isBusy(error) &&
        attempt < OVERPASS_MAX_ATTEMPTS &&
        deadline - Date.now() - OVERPASS_RETRY_DELAY_MS >= OVERPASS_MIN_ATTEMPT_MS
      if (!canRetry) throw error

      console.warn(
        `[business-search] overpass ${new URL(endpoint).host} busy on attempt ${attempt}; retrying`
      )
      await new Promise((resolve) => setTimeout(resolve, OVERPASS_RETRY_DELAY_MS))
    }
  }
}

/**
 * Only "server busy" answers are retried. Rate limits (429) and our own
 * timeouts are not: retrying those would just add load or blow the budget.
 */
function isBusy(error: BusinessSearchError) {
  return error.code === "upstream_busy"
}

async function queryOverpass(
  endpoint: string,
  query: string,
  timeoutMs: number
): Promise<OverpassElement[]> {
  const response = await fetchWithTimeout(
    "overpass",
    endpoint,
    {
      method: "POST",
      headers: {
        "User-Agent": getOsmUserAgent(),
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ data: query }),
    },
    timeoutMs
  )

  const text = await response.text().catch(() => "")

  // Overpass reports overload as an HTML page ("runtime error ... Dispatcher",
  // "rate_limited", "timeout"), sometimes with HTTP 200 and sometimes 429/504.
  if (/runtime error|Dispatcher_Client|rate_limited|too busy/i.test(text) && !text.trimStart().startsWith("{")) {
    throw response.status === 429
      ? upstreamStatusError("overpass", 429)
      : busyError(`HTTP ${response.status} with server error page`)
  }
  if (!response.ok) throw upstreamStatusError("overpass", response.status)

  let payload: OverpassResponse
  try {
    payload = JSON.parse(text) as OverpassResponse
  } catch {
    throw badResponse(`HTTP ${response.status}, response was not valid JSON`)
  }

  if (!Array.isArray(payload.elements)) throw badResponse("Missing elements array")

  // Overpass reports server-side timeouts/memory limits as a 200 with a remark,
  // and the element list may be cut short. Treat that as a failed search.
  if (payload.remark && /runtime error|timed out|out of memory/i.test(payload.remark)) {
    throw busyError(payload.remark.slice(0, 200))
  }

  return payload.elements.filter(isOverpassElement)
}

function busyError(detail: string) {
  return new BusinessSearchError({
    message:
      "The business directory is busy right now. Please try again in a moment.",
    status: 503,
    code: "upstream_busy",
    service: "overpass",
    detail,
  })
}

function isOverpassElement(value: unknown): value is OverpassElement {
  if (!value || typeof value !== "object") return false
  const element = value as Partial<OverpassElement>
  return (
    (element.type === "node" || element.type === "way" || element.type === "relation") &&
    typeof element.id === "number"
  )
}

function badResponse(detail: string) {
  return new BusinessSearchError({
    message: "The business directory returned an unexpected response. Please try again.",
    status: 502,
    code: "upstream_bad_response",
    service: "overpass",
    detail,
  })
}
