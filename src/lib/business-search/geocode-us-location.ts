import "server-only"

import type { UsLocation } from "@/types/business"
import { GEOCODE_CACHE_MAX_ENTRIES, GEOCODE_CACHE_TTL_MS } from "./constants"
import { BusinessSearchError, upstreamError } from "./errors"
import { nominatimSearch } from "./nominatim-client"
import { TtlCache } from "./ttl-cache"
import { mentionsUnitedStates, US_ZIP_CODE } from "./us-regions"

/*
 * Geocodes with the public Nominatim instance (fine for development and V1).
 * Each search makes at most one geocoding request, and repeat locations are
 * served from a 24-hour in-memory cache. Before production-scale traffic,
 * move the cache to a shared store or switch to a self-hosted/commercial
 * geocoder — only this file needs to change.
 */

interface NominatimAddress {
  city?: string
  town?: string
  village?: string
  hamlet?: string
  municipality?: string
  state?: string
  postcode?: string
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

const cache = new TtlCache<UsLocation>(GEOCODE_CACHE_TTL_MS, GEOCODE_CACHE_MAX_ENTRIES)

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
  const key = location.toLowerCase().replace(/\s+/g, " ").trim()
  const cached = cache.get(key)
  if (cached) return cached

  const places = await nominatimSearch(buildSearchParams(location))

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

  cache.set(key, result)
  return result
}
