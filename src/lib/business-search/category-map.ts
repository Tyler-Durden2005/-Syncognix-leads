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
    aliases: ["dentists", "dental", "dental clinic"],
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
    aliases: ["auto repair", "car mechanic", "auto mechanic", "mechanic", "mechanics"],
    tags: [{ key: "shop", value: "car_repair" }],
  },
]

/** Lowercases, turns -/_ into spaces and collapses whitespace. */
function normalizeCategoryInput(value: string) {
  return value.toLowerCase().replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim()
}

const CATEGORY_LOOKUP = new Map<string, BusinessCategory>()
for (const category of BUSINESS_CATEGORIES) {
  for (const phrase of [category.id, ...category.aliases]) {
    CATEGORY_LOOKUP.set(normalizeCategoryInput(phrase), category)
  }
}

/** Returns the category for a user-supplied business type, or null if unsupported. */
export function resolveBusinessCategory(input: string): BusinessCategory | null {
  return CATEGORY_LOOKUP.get(normalizeCategoryInput(input)) ?? null
}

export function getSupportedCategoryIds() {
  return BUSINESS_CATEGORIES.map((category) => category.id)
}
