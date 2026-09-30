import "server-only"

import {
  NOMINATIM_MIN_INTERVAL_MS,
  NOMINATIM_SEARCH_URL,
  NOMINATIM_TIMEOUT_MS,
} from "./constants"
import { fetchWithTimeout, upstreamError, upstreamStatusError } from "./errors"
import { getOsmReferer, getOsmUserAgent } from "./user-agent"

/*
 * Every Nominatim call in this app goes through here. The public instance
 * allows at most one request per second, so calls are queued and spaced at
 * least NOMINATIM_MIN_INTERVAL_MS apart — across all searches running in this
 * server process, not just within one search.
 * https://operations.osmfoundation.org/policies/nominatim/
 *
 * The queue is per process. With several server instances in production,
 * move to a shared rate limit, a paid provider, or a self-hosted Nominatim.
 */

let queue: Promise<void> = Promise.resolve()
let lastRequestAt = 0

function waitForTurn(): Promise<void> {
  const turn = queue.then(async () => {
    const wait = lastRequestAt + NOMINATIM_MIN_INTERVAL_MS - Date.now()
    if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait))
    lastRequestAt = Date.now()
  })
  queue = turn.catch(() => undefined)
  return turn
}

/** Calls Nominatim /search and returns the parsed JSON array. */
export async function nominatimSearch(params: URLSearchParams): Promise<unknown[]> {
  await waitForTurn()

  const headers: Record<string, string> = {
    "User-Agent": getOsmUserAgent(),
    Accept: "application/json",
    "Accept-Language": "en",
  }
  const referer = getOsmReferer()
  if (referer) headers.Referer = referer

  const response = await fetchWithTimeout(
    "nominatim",
    `${NOMINATIM_SEARCH_URL}?${params}`,
    { headers },
    NOMINATIM_TIMEOUT_MS
  )
  if (!response.ok) throw upstreamStatusError("nominatim", response.status)

  let data: unknown
  try {
    data = JSON.parse(response.text)
  } catch {
    throw upstreamError("nominatim", "upstream_bad_response", "Response was not valid JSON")
  }
  if (!Array.isArray(data)) {
    throw upstreamError("nominatim", "upstream_bad_response", "Expected a JSON array")
  }
  return data
}
