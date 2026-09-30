/**
 * Controlled mapping from the business types we support to OpenStreetMap tags.
 * Only values from this file ever reach an Overpass query, never raw user input.
 *
 * To add a category: add an entry below. `tags` are OR-ed together, so a
 * category can match several OSM tagging conventions.
 */

export interface OsmTagFilter {
  key: string
  value: string
}

export interface BusinessCategory {
  /** Stable id returned to clients as `category`. */
  id: string
  label: string
  /** Extra phrases users might type for the same category. */
  aliases: string[]
  tags: OsmTagFilter[]
}

export const BUSINESS_CATEGORIES: readonly BusinessCategory[] = [
  {
    id: "plumber",
    label: "Plumber",
    aliases: ["plumbers", "plumbing"],
    tags: [{ key: "craft", value: "plumber" }],
  },
  {
    id: "dentist",
    label: "Dentist",
    aliases: ["dentists", "dental", "dental clinic", "dental office"],
    tags: [{ key: "amenity", value: "dentist" }],
  },
  {
    id: "restaurant",
    label: "Restaurant",
    aliases: ["restaurants"],
    tags: [{ key: "amenity", value: "restaurant" }],
  },
  {
    id: "car wash",
    label: "Car wash",
    aliases: ["car washes", "carwash", "carwashes"],
    tags: [{ key: "amenity", value: "car_wash" }],
  },
  {
    id: "car repair",
    label: "Car repair",
    aliases: ["auto repair", "car mechanic", "auto mechanic", "mechanic", "mechanics", "auto shop"],
    tags: [{ key: "shop", value: "car_repair" }],
  },
  {
    id: "electrician",
    label: "Electrician",
    aliases: ["electricians", "electrical contractor", "electrical contractors"],
    tags: [{ key: "craft", value: "electrician" }],
  },
  {
    id: "roofing",
    label: "Roofing",
    aliases: ["roofer", "roofers", "roofing contractor", "roofing contractors", "roofing company"],
    tags: [{ key: "craft", value: "roofer" }],
  },
  {
    id: "landscaping",
    label: "Landscaping",
    aliases: ["landscaper", "landscapers", "landscaping company", "lawn care"],
    // Many US landscapers are tagged craft=gardener rather than craft=landscaper.
    tags: [
      { key: "craft", value: "landscaper" },
      { key: "craft", value: "gardener" },
    ],
  },
  {
    id: "cleaning",
    label: "Cleaning",
    aliases: ["cleaner", "cleaners", "cleaning service", "cleaning services", "cleaning company", "janitorial"],
    tags: [{ key: "craft", value: "cleaning" }],
  },
  {
    id: "hvac",
    label: "HVAC",
    aliases: ["hvac contractor", "hvac contractors", "heating and cooling", "air conditioning", "ac repair"],
    tags: [{ key: "craft", value: "hvac" }],
  },
  {
    // OSM has no universal "detailing" tag, so this starts from the closest
    // related places. Refine the tags here once better data sources exist.
    id: "auto detailing",
    label: "Auto detailing",
    aliases: ["car detailing", "mobile detailing", "detailing", "auto detailer", "car detailer", "detailer"],
    tags: [
      { key: "amenity", value: "car_wash" },
      { key: "shop", value: "car_repair" },
    ],
  },
]
