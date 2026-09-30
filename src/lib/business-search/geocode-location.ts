import "server-only"

import type { GeocodedLocation } from "@/types/business"
import {
  BusinessSearchError,
  fetchWithTimeout,
  upstreamStatusError,
} from "./errors"
import { getOsmUserAgent } from "./user-agent"

/*
 * Uses the public Nominatim instance, which is fine for development and V1
 * but has a strict usage policy (max ~1 request/second, no heavy use):
 * https://operations.osmfoundation.org/policies/nominatim/
 *
 * Callers make exactly one geocoding request per search and never in a loop
 * or in parallel. Before production-scale traffic, add a cache in front of
 * this function (locations repeat constantly) or move to a self-hosted or
 * commercial geocoder. Keeping geocoding in this one function makes that a
 * drop-in change.
 */

const NOMINATIM_SEARCH_URL = "https://nominatim.openstreetmap.org/search"
const NOMINATIM_TIMEOUT_MS = 9_000

interface NominatimPlace {
  lat?: string
  lon?: string
  display_name?: string
}

export async function geocodeLocation(location: string): Promise<GeocodedLocation> {
  const params = new URLSearchParams({
    q: location,
    format: "jsonv2",
    limit: "1",
  })

  const response = await fetchWithTimeout(
    "nominatim",
    `${NOMINATIM_SEARCH_URL}?${params}`,
    {
      headers: {
        "User-Agent": getOsmUserAgent(),
        Accept: "application/json",
        "Accept-Language": "en",
      },
    },
    NOMINATIM_TIMEOUT_MS
  )

  if (!response.ok) throw upstreamStatusError("nominatim", response.status)

  let places: unknown
  try {
    places = await response.json()
  } catch {
    throw badResponse("Response was not valid JSON")
  }
  if (!Array.isArray(places)) throw badResponse("Expected a JSON array")

  const place = places[0] as NominatimPlace | undefined
  if (!place) {
    throw new BusinessSearchError({
      message:
        "We couldn't find that location. Try a more specific location such as 'Dallas, Texas'.",
      status: 404,
      code: "location_not_found",
      service: "nominatim",
    })
  }

  const latitude = Number(place.lat)
  const longitude = Number(place.lon)
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    throw badResponse("Result had no usable coordinates")
  }

  return {
    displayName: place.display_name?.trim() || location,
    latitude,
    longitude,
  }
}

function badResponse(detail: string) {
  return new BusinessSearchError({
    message: "The location service returned an unexpected response. Please try again.",
    status: 502,
    code: "upstream_bad_response",
    service: "nominatim",
    detail,
  })
}
