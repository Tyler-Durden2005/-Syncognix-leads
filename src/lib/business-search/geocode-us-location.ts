import "server-only"

import type { UsLocation } from "@/types/business"
import {
  GEOCODE_CACHE_MAX_ENTRIES,
  GEOCODE_CACHE_TTL_MS,
  NOMINATIM_SEARCH_URL,
  NOMINATIM_TIMEOUT_MS,
} from "./constants"
import {
  BusinessSearchError,
  fetchWithTimeout,
  upstreamError,
  upstreamStatusError,
} from "./errors"
import { mentionsUnitedStates, US_ZIP_CODE } from "./us-regions"
import { getOsmReferer, getOsmUserAgent } from "./user-agent"

/*
 * Uses the public Nominatim instance, which is fine for development and V1
 * but has a strict usage policy (max ~1 request/second, no heavy use):
 * https://operations.osmfoundation.org/policies/nominatim/
 *
 * Each search makes at most one Nominatim request, never in a loop or in
 * parallel, and repeat locations are served from a small in-memory cache.
 * That cache lives per server process: before production-scale traffic,
 * move it to a shared store (e.g. a Supabase table) or switch to a
 * self-hosted/commercial geocoder. Only this file needs to change.
 */

interface NominatimAddress {
  city?: string
  town?: string
  village?: string
  hamlet?: string
  municipality?: string
  county?: string
  state?: string
  postcode?: string
  country?: string
  country_code?: string
}

interface NominatimPlace {
  lat?: string
  lon?: string
  display_name?: string
  address?: NominatimAddress
}

const NOT_FOUND_MESSAGE =
  "We couldn't find that US location. Try a more specific value such as 'Dallas, Texas' or a valid US ZIP code."
const NOT_US_MESSAGE =
  "This version currently supports United States locations only."

// --- In-memory cache -------------------------------------------------------

const cache = new Map<string, { location: UsLocation; expiresAt: number }>()

function cacheKey(location: string) {
  return location.toLowerCase().replace(/\s+/g, " ").trim()
}

function readCache(key: string) {
  const entry = cache.get(key)
  if (!entry) return null
  if (entry.expiresAt < Date.now()) {
    cache.delete(key)
    return null
  }
  return entry.location
}

function writeCache(key: string, location: UsLocation) {
  // Map keeps insertion order, so the first key is the oldest entry.
  if (cache.size >= GEOCODE_CACHE_MAX_ENTRIES) {
    const oldest = cache.keys().next().value
    if (oldest !== undefined) cache.delete(oldest)
  }
  cache.set(key, { location, expiresAt: Date.now() + GEOCODE_CACHE_TTL_MS })
}

// --- Geocoding -------------------------------------------------------------

/**
 * Builds the Nominatim query. ZIP codes and inputs that name a US state are
 * restricted to the US (so "75001" can't match the Paris postcode). Other
 * text is searched worldwide on purpose: restricting "London" to the US
 * would silently return London, Kentucky, when the user meant the UK. The
 * result's country is verified either way.
 */
function buildSearchParams(location: string) {
  const params = new URLSearchParams({
    format: "jsonv2",
    limit: "1",
    addressdetails: "1",
  })
  if (US_ZIP_CODE.test(location)) {
    params.set("postalcode", location.slice(0, 5))
    params.set("countrycodes", "us")
  } else {
    params.set("q", location)
    if (mentionsUnitedStates(location)) params.set("countrycodes", "us")
  }
  return params
}

function pickCity(address: NominatimAddress) {
  return (
    address.city ??
    address.town ??
    address.village ??
    address.hamlet ??
    address.municipality ??
    null
  )
}

export async function geocodeUsLocation(location: string): Promise<UsLocation> {
  const key = cacheKey(location)
  const cached = readCache(key)
  if (cached) return cached

  const headers: Record<string, string> = {
    "User-Agent": getOsmUserAgent(),
    Accept: "application/json",
    "Accept-Language": "en",
  }
  const referer = getOsmReferer()
  if (referer) headers.Referer = referer

  const response = await fetchWithTimeout(
    "nominatim",
    `${NOMINATIM_SEARCH_URL}?${buildSearchParams(location)}`,
    { headers },
    NOMINATIM_TIMEOUT_MS
  )

  if (!response.ok) throw upstreamStatusError("nominatim", response.status)

  let places: unknown
  try {
    places = JSON.parse(response.text)
  } catch {
    throw upstreamError("nominatim", "upstream_bad_response", "Response was not valid JSON")
  }
  if (!Array.isArray(places)) {
    throw upstreamError("nominatim", "upstream_bad_response", "Expected a JSON array")
  }

  const place = places[0] as NominatimPlace | undefined
  if (!place) {
    throw new BusinessSearchError({
      message: NOT_FOUND_MESSAGE,
      status: 404,
      code: "location_not_found",
      service: "nominatim",
    })
  }

  // Never trust the query restriction alone: verify the result's country.
  const address = place.address
  if (!address || address.country_code?.toLowerCase() !== "us") {
    throw new BusinessSearchError({
      message: NOT_US_MESSAGE,
      status: 400,
      code: "location_not_us",
      service: "nominatim",
    })
  }

  const latitude = Number(place.lat)
  const longitude = Number(place.lon)
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    throw upstreamError("nominatim", "upstream_bad_response", "Result had no usable coordinates")
  }

  const result: UsLocation = {
    displayName: place.display_name?.trim() || location,
    latitude,
    longitude,
    city: pickCity(address),
    state: address.state ?? null,
    postcode: address.postcode ?? (US_ZIP_CODE.test(location) ? location.slice(0, 5) : null),
    country: "United States",
    countryCode: "US",
  }

  writeCache(key, result)
  return result
}
