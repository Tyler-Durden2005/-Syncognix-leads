export type BusinessSearchService = "request" | "nominatim" | "overpass" | "internal"

export type BusinessSearchErrorCode =
  | "invalid_request"
  | "unsupported_category"
  | "location_not_found"
  | "upstream_timeout"
  | "upstream_busy"
  | "upstream_rate_limited"
  | "upstream_unavailable"
  | "upstream_bad_response"
  | "unauthorized"
  | "internal_error"

/**
 * An error whose `message` is always safe to show to API clients.
 * Upstream details go in `detail`, which is only ever logged server-side.
 */
export class BusinessSearchError extends Error {
  readonly status: number
  readonly code: BusinessSearchErrorCode
  readonly service: BusinessSearchService
  readonly detail?: string

  constructor(options: {
    message: string
    status: number
    code: BusinessSearchErrorCode
    service: BusinessSearchService
    detail?: string
  }) {
    super(options.message)
    this.name = "BusinessSearchError"
    this.status = options.status
    this.code = options.code
    this.service = options.service
    this.detail = options.detail
  }
}

export function isBusinessSearchError(error: unknown): error is BusinessSearchError {
  return error instanceof BusinessSearchError
}

function isAbortError(error: unknown) {
  return (
    error instanceof Error &&
    (error.name === "AbortError" || error.name === "TimeoutError")
  )
}

const SERVICE_LABELS = {
  nominatim: "location service",
  overpass: "business directory",
} as const

/**
 * Runs `fetch` with a hard timeout and converts timeouts and network failures
 * into user-safe BusinessSearchErrors.
 */
export async function fetchWithTimeout(
  service: keyof typeof SERVICE_LABELS,
  url: string,
  init: RequestInit,
  timeoutMs: number
): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  const label = SERVICE_LABELS[service]

  try {
    return await fetch(url, { ...init, signal: controller.signal, cache: "no-store" })
  } catch (error) {
    if (isAbortError(error)) {
      throw new BusinessSearchError({
        message: `The ${label} took too long to respond. Please try again.`,
        status: 504,
        code: "upstream_timeout",
        service,
        detail: `Timed out after ${timeoutMs}ms`,
      })
    }
    throw new BusinessSearchError({
      message: `We couldn't reach the ${label}. Please try again in a moment.`,
      status: 502,
      code: "upstream_unavailable",
      service,
      detail: error instanceof Error ? `${error.name}: ${error.message}` : String(error),
    })
  } finally {
    clearTimeout(timer)
  }
}

/** Maps a non-OK upstream HTTP status to a user-safe error. */
export function upstreamStatusError(
  service: keyof typeof SERVICE_LABELS,
  status: number
): BusinessSearchError {
  const label = SERVICE_LABELS[service]
  if (status === 429) {
    return new BusinessSearchError({
      message: `The ${label} is receiving too many requests. Please wait a minute and try again.`,
      status: 429,
      code: "upstream_rate_limited",
      service,
      detail: `HTTP ${status}`,
    })
  }
  if (status === 503 || status === 504) {
    return new BusinessSearchError({
      message: `The ${label} is busy right now. Please try again in a moment.`,
      status: 503,
      code: "upstream_busy",
      service,
      detail: `HTTP ${status}`,
    })
  }
  return new BusinessSearchError({
    message: `The ${label} is temporarily unavailable. Please try again later.`,
    status: 502,
    code: "upstream_unavailable",
    service,
    detail: `HTTP ${status}`,
  })
}

/** Logs an error without request bodies, tokens or large upstream payloads. */
export function logBusinessSearchError(error: unknown) {
  if (isBusinessSearchError(error)) {
    // Client mistakes are expected; only log problems worth investigating.
    if (error.status < 500 && error.code !== "upstream_rate_limited") return
    console.error(
      `[business-search] ${error.service} failed: ${error.code}` +
        (error.detail ? ` (${error.detail.slice(0, 300)})` : "")
    )
    return
  }
  console.error("[business-search] unexpected error:", error)
}
