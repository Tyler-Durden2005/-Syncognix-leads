import type { OsmElementType } from "@/types/business"

/**
 * One OpenStreetMap object in the shape Overpass returns. Results from
 * Nominatim are converted into this shape too, so both sources share the
 * same normalization code.
 */
export interface OsmElement {
  type: OsmElementType
  id: number
  lat?: number
  lon?: number
  center?: { lat?: number; lon?: number }
  tags?: Record<string, string>
}

export function isOsmElementType(value: unknown): value is OsmElementType {
  return value === "node" || value === "way" || value === "relation"
}
