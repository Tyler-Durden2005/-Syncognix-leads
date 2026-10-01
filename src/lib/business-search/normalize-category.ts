import type { CategoryOption } from "@/types/business"
import { BUSINESS_CATEGORIES, type BusinessCategory } from "./category-map"

/** Lowercases, turns -/_ into spaces and collapses whitespace. */
export function normalizeCategoryInput(value: string) {
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

/** Supported categories for the search form, without their OSM tags. */
export function getCategoryOptions(): CategoryOption[] {
  return BUSINESS_CATEGORIES.map(({ id, label, plural, aliases }) => ({ id, label, plural, aliases }))
}

/** Friendly name for a stored category id, e.g. "car wash" → "Car wash". */
export function getCategoryLabel(id: string) {
  const category = resolveBusinessCategory(id)
  if (category) return category.label
  const text = id.replace(/[-_]+/g, " ").trim()
  return text ? text[0].toUpperCase() + text.slice(1) : "Business"
}
