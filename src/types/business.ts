export type OsmElementType = "node" | "way" | "relation"

/** A clean, normalized business returned by the search API. */
export interface BusinessSearchResult {
  /** Unique across element types, e.g. "node:123456". */
  osmId: string
  osmType: OsmElementType
  name: string
  website: string | null
  phone: string | null
  address: string | null
  city: string | null
  state: string | null
  postcode: string | null
  /** Our category id (e.g. "plumber"), not the raw OSM tag. */
  category: string
  latitude: number | null
  longitude: number | null
}

export interface BusinessSearchQuery {
  businessType: string
  location: string
  limit: number
}

export interface GeocodedLocation {
  displayName: string
  latitude: number
  longitude: number
}

export interface BusinessSearchSuccessResponse {
  success: true
  query: BusinessSearchQuery
  location: GeocodedLocation
  count: number
  businesses: BusinessSearchResult[]
}

export interface BusinessSearchErrorResponse {
  success: false
  error: string
  supportedCategories?: string[]
}

export type BusinessSearchResponse =
  | BusinessSearchSuccessResponse
  | BusinessSearchErrorResponse
