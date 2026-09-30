import type { BusinessCategory, OsmTagFilter } from "./category-map"
import { DEFAULT_SEARCH_RADIUS_METERS, OVERPASS_QUERY_TIMEOUT_S } from "./constants"

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

/**
 * Builds an Overpass QL query from a controlled category and geocoded
 * coordinates only — user text never reaches the query.
 *
 *   [out:json][timeout:25];
 *   (
 *     nwr["craft"="plumber"]["name"](around:30000,32.776272,-96.796856);
 *   );
 *   out center tags;
 */
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
