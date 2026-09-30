import type { BusinessSearchQuery } from "@/types/business"
import { BusinessSearchError } from "./errors"

export const DEFAULT_LIMIT = 25
export const MAX_LIMIT = 100
const MIN_TEXT_LENGTH = 2
const MAX_TEXT_LENGTH = 200

function invalid(message: string) {
  return new BusinessSearchError({
    message,
    status: 400,
    code: "invalid_request",
    service: "request",
  })
}

function requiredText(value: unknown, label: string) {
  if (value === undefined || value === null) throw invalid(`${label} is required.`)
  if (typeof value !== "string") throw invalid(`${label} must be text.`)
  const trimmed = value.trim().replace(/\s+/g, " ")
  if (!trimmed) throw invalid(`${label} is required.`)
  if (trimmed.length < MIN_TEXT_LENGTH) {
    throw invalid(`${label} must be at least ${MIN_TEXT_LENGTH} characters.`)
  }
  if (trimmed.length > MAX_TEXT_LENGTH) {
    throw invalid(`${label} must be ${MAX_TEXT_LENGTH} characters or fewer.`)
  }
  return trimmed
}

function parseLimit(value: unknown) {
  if (value === undefined || value === null) return DEFAULT_LIMIT
  if (typeof value !== "number" || !Number.isInteger(value) || value < 1 || value > MAX_LIMIT) {
    throw invalid(`Limit must be a whole number between 1 and ${MAX_LIMIT}.`)
  }
  return value
}

/** Validates an already-parsed JSON body and returns a clean query. */
export function validateSearchRequest(body: unknown): BusinessSearchQuery {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw invalid("Request body must be a JSON object.")
  }
  const input = body as Record<string, unknown>
  return {
    businessType: requiredText(input.businessType, "Business type"),
    location: requiredText(input.location, "Location"),
    limit: parseLimit(input.limit),
  }
}
