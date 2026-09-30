export type OsmElementType = "node" | "way" | "relation"

export type BusinessDataSource = "nominatim" | "overpass"

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
    /** OpenStreetMap services that contributed results. */
    sources: BusinessDataSource[]
    /** True when served from the server's recent-results cache. */
    cached: boolean
    /** Set when results may be incomplete (e.g. a source was busy). */
    notice?: string
  }
  /** Whether the results were saved to the signed-in user's leads. */
  leads: LeadsSaveStatus
}

export type LeadsSaveStatus =
  | { status: "saved"; count: number }
  | { status: "failed"; message: string }
  /** No signed-in user (only possible in `next dev`), so nothing was saved. */
  | { status: "skipped"; message: string }

export interface BusinessSearchErrorResponse {
  success: false
  error: string
  supportedCategories?: string[]
}

export type BusinessSearchResponse =
  | BusinessSearchSuccessResponse
  | BusinessSearchErrorResponse
