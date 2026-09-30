import "server-only"

import type { BusinessCategory, OsmTagFilter } from "./category-map"
import { tagSelector } from "./build-overpass-query"
import { NOMINATIM_PAGE_SIZE, NOMINATIM_MAX_BUSINESS_REQUESTS } from "./constants"
import { boundingBox } from "./geo"
import { nominatimSearch } from "./nominatim-client"
import { isOsmElementType, type OsmElement } from "./osm-element"

/*
 * Nominatim can search by exact OSM tag ("[craft=plumber]") inside a bounded
 * box and return each place's contact tags (extratags) and address. It
 * answers in about a second, so it is the first source for every search;
 * Overpass is only used to top up when this returns too few results.
 *
 * It returns at most 40 places per request, and requests are rate-limited
 * by nominatim-client.ts. At most NOMINATIM_MAX_BUSINESS_REQUESTS are made
 * per search.
 */

interface NominatimBusiness {
  place_id?: number
  osm_type?: string
  osm_id?: number
  lat?: string
  lon?: string
  category?: string
  type?: string
  name?: string
  address?: Record<string, string>
  extratags?: Record<string, string> | null
}

/** Converts a Nominatim place into the Overpass element shape. */
function toOsmElement(place: NominatimBusiness): OsmElement | null {
  if (!isOsmElementType(place.osm_type) || typeof place.osm_id !== "number") return null

  const lat = Number(place.lat)
  const lon = Number(place.lon)
  const hasCoords = Number.isFinite(lat) && Number.isFinite(lon)
  const address = place.address ?? {}

  const tags: Record<string, string> = { ...(place.extratags ?? {}) }
  if (place.name) tags.name = place.name

  // Nominatim fills in the nearest road for places with no address of their
  // own. Only use street and postcode when the place has a house number,
  // i.e. a real address was mapped — never an approximated one.
  if (address.house_number && address.road) {
    tags["addr:housenumber"] = address.house_number
    tags["addr:street"] = address.road
    if (address.postcode) tags["addr:postcode"] = address.postcode
  }
  const city = address.city ?? address.town ?? address.village ?? address.hamlet
  if (city) tags["addr:city"] = city
  if (address.state) tags["addr:state"] = address.state
  if (address.country_code) tags["addr:country"] = address.country_code.toUpperCase()

  return {
    type: place.osm_type,
    id: place.osm_id,
    ...(place.osm_type === "node"
      ? { lat: hasCoords ? lat : undefined, lon: hasCoords ? lon : undefined }
      : { center: hasCoords ? { lat, lon } : undefined }),
    tags,
  }
}

async function searchTagPage(
  tag: OsmTagFilter,
  viewbox: string,
  excludePlaceIds: number[]
) {
  const params = new URLSearchParams({
    q: tagSelector(tag).replace(/"/g, ""), // [craft=plumber]
    format: "jsonv2",
    limit: String(NOMINATIM_PAGE_SIZE),
    addressdetails: "1",
    extratags: "1",
    countrycodes: "us",
    viewbox,
    bounded: "1",
  })
  if (excludePlaceIds.length) params.set("exclude_place_ids", excludePlaceIds.join(","))

  const places = (await nominatimSearch(params)) as NominatimBusiness[]
  return {
    // Special-phrase searches can also match names; keep exact tag matches only.
    matches: places.filter((place) => place.category === tag.key && place.type === tag.value),
    placeIds: places.flatMap((place) => (typeof place.place_id === "number" ? [place.place_id] : [])),
    pageWasFull: places.length >= NOMINATIM_PAGE_SIZE,
  }
}

/**
 * Finds businesses for a category around a point. `wanted` is how many
 * candidates we'd like; a second page is only fetched for single-tag
 * categories when the first page was full and we still need more.
 */
export async function searchNominatimBusinesses(
  category: BusinessCategory,
  latitude: number,
  longitude: number,
  radiusMeters: number,
  wanted: number
): Promise<OsmElement[]> {
  const box = boundingBox(latitude, longitude, radiusMeters)
  const viewbox = [box.west, box.north, box.east, box.south].map((n) => n.toFixed(6)).join(",")

  const elements: OsmElement[] = []
  let requests = 0

  for (const tag of category.tags) {
    const excluded: number[] = []
    // One page per tag; single-tag categories may take a second page.
    const maxPages = category.tags.length === 1 ? NOMINATIM_MAX_BUSINESS_REQUESTS : 1

    for (let page = 0; page < maxPages && requests < NOMINATIM_MAX_BUSINESS_REQUESTS; page++) {
      requests++
      const { matches, placeIds, pageWasFull } = await searchTagPage(tag, viewbox, excluded)
      excluded.push(...placeIds)
      for (const place of matches) {
        const element = toOsmElement(place)
        if (element) elements.push(element)
      }
      if (!pageWasFull || elements.length >= wanted) break
    }
  }

  return elements
}
