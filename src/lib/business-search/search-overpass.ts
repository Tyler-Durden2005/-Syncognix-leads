import "server-only"

import type { OsmElementType } from "@/types/business"
import {
  OVERPASS_ENDPOINTS,
  OVERPASS_FETCH_TIMEOUT_MS,
  OVERPASS_MAX_ATTEMPTS,
  OVERPASS_MIN_ATTEMPT_MS,
  OVERPASS_RETRY_DELAY_MS,
  OVERPASS_TOTAL_BUDGET_MS,
} from "./constants"
import {
  BusinessSearchError,
  fetchWithTimeout,
  upstreamError,
  upstreamStatusError,
} from "./errors"
import { getOsmUserAgent } from "./user-agent"

/*
 * Uses public Overpass API instances. Like Nominatim, they are shared free
 * services. When one answers "too busy" (it queues queries by available
 * slots) we wait briefly and make at most one more attempt — never in a
 * loop, never in parallel. Rate limits (429) and timeouts are not retried.
 * https://wiki.openstreetmap.org/wiki/Overpass_API#Public_Overpass_API_instances
 */

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

export async function searchOverpass(query: string): Promise<OverpassElement[]> {
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
        error.code === "upstream_busy" &&
        attempt < OVERPASS_MAX_ATTEMPTS &&
        deadline - Date.now() - OVERPASS_RETRY_DELAY_MS >= OVERPASS_MIN_ATTEMPT_MS
      if (!canRetry) throw error

      console.warn(
        `[business-search] overpass ${new URL(endpoint).host} busy on attempt ${attempt}; retrying once`
      )
      await new Promise((resolve) => setTimeout(resolve, OVERPASS_RETRY_DELAY_MS))
    }
  }
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

  const { text } = response
  const isJson = text.trimStart().startsWith("{")

  // Overpass reports overload as an HTML page ("runtime error ... Dispatcher",
  // "rate_limited", "too busy"), sometimes with HTTP 200 and sometimes 429/504.
  if (!isJson && /runtime error|Dispatcher_Client|rate_limited|too busy/i.test(text)) {
    if (response.status === 429) throw upstreamStatusError("overpass", 429)
    throw upstreamError("overpass", "upstream_busy", `HTTP ${response.status} with server error page`)
  }
  if (!response.ok) throw upstreamStatusError("overpass", response.status)
  if (!text.trim()) throw upstreamError("overpass", "upstream_bad_response", "Empty response")

  let payload: OverpassResponse
  try {
    payload = JSON.parse(text) as OverpassResponse
  } catch {
    throw upstreamError("overpass", "upstream_bad_response", `HTTP ${response.status}, response was not valid JSON`)
  }

  if (!Array.isArray(payload.elements)) {
    throw upstreamError("overpass", "upstream_bad_response", "Missing elements array")
  }

  // Server-side timeouts/memory limits come back as a 200 with a remark, and
  // the element list may be cut short. Treat that as a failed search.
  if (payload.remark && /runtime error|timed out|out of memory/i.test(payload.remark)) {
    throw upstreamError("overpass", "upstream_busy", payload.remark.slice(0, 200))
  }

  return payload.elements.filter(isOverpassElement)
}

function isOverpassElement(value: unknown): value is OverpassElement {
  if (!value || typeof value !== "object") return false
  const element = value as Partial<OverpassElement>
  return (
    (element.type === "node" || element.type === "way" || element.type === "relation") &&
    typeof element.id === "number"
  )
}
