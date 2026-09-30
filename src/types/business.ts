export type OsmElementType = "node" | "way" | "relation"

/** A clean, normalized US business returned by the search API. */
export interface BusinessSearchResult {
  /** Unique across element types, e.g. "node:123456". */
  osmId: string
  osmType: OsmElementType

  name: string

  website: string | null
  phone: string | null

  street: string | null
  city: string | null
  state: string | null
  postcode: string | null
  /** Full street address, or null when no street is known. */
  address: string | null

  /** Our category id (e.g. "plumber"), not the raw OSM tag. */
  category: string

  latitude: number | null
  longitude: number | null

  country: "United States"
  countryCode: "US"
}

export interface BusinessSearchQuery {
  businessType: string
  location: string
  limit: number
}

export interface UsLocation {
  displayName: string
  latitude: number
  longitude: number
  city: string | null
  state: string | null
  postcode: string | null
  country: "United States"
  countryCode: "US"
}

export interface BusinessSearchSuccessResponse {
  success: true
  query: BusinessSearchQuery & { normalizedBusinessType: string }
  searchLocation: UsLocation
  count: number
  businesses: BusinessSearchResult[]
  meta: {
    provider: string
    radiusMeters: number
    /** Matching businesses found before `limit` was applied. */
    resultsBeforeLimit: number
  }
}

export interface BusinessSearchErrorResponse {
  success: false
  error: string
  supportedCategories?: string[]
}

export type BusinessSearchResponse =
  | BusinessSearchSuccessResponse
  | BusinessSearchErrorResponse
