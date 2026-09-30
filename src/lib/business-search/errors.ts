export type BusinessSearchService = "request" | "nominatim" | "overpass" | "internal"

export type BusinessSearchErrorCode =
  | "invalid_request"
  | "unsupported_category"
  | "location_not_found"
  | "location_not_us"
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

type UpstreamService = "nominatim" | "overpass"

const MESSAGES: Record<UpstreamService, { timeout: string; unavailable: string }> = {
  nominatim: {
    timeout: "Location lookup timed out. Please try again.",
    unavailable: "Location lookup is temporarily unavailable. Please try again.",
  },
  overpass: {
    timeout: "Business search timed out. Please try again.",
    unavailable: "Business search is temporarily unavailable. Please try again.",
  },
}

const RATE_LIMITED_MESSAGE =
  "Too many searches right now. Please wait a minute and try again."

function isAbortError(error: unknown) {
  return (
    error instanceof Error &&
    (error.name === "AbortError" || error.name === "TimeoutError")
  )
}

export function upstreamError(
  service: UpstreamService,
  code: "upstream_timeout" | "upstream_busy" | "upstream_unavailable" | "upstream_bad_response",
  detail: string
) {
  return new BusinessSearchError({
    message: code === "upstream_timeout" ? MESSAGES[service].timeout : MESSAGES[service].unavailable,
    status: code === "upstream_timeout" ? 504 : 502,
    code,
    service,
    detail,
  })
}

export interface UpstreamResponse {
  ok: boolean
  status: number
  /** Full response body; read inside the timeout window. */
  text: string
}

/**
 * Runs `fetch` and reads the whole body under one hard timeout
 * (AbortController), so a slow download can't outlive the deadline.
 * Timeouts and network failures become user-safe BusinessSearchErrors.
 */
export async function fetchWithTimeout(
  service: UpstreamService,
  url: string,
  init: RequestInit,
  timeoutMs: number
): Promise<UpstreamResponse> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(url, { ...init, signal: controller.signal, cache: "no-store" })
    const text = await response.text()
    return { ok: response.ok, status: response.status, text }
  } catch (error) {
    if (isAbortError(error)) {
      throw upstreamError(service, "upstream_timeout", `Timed out after ${timeoutMs}ms`)
    }
    throw upstreamError(
      service,
      "upstream_unavailable",
      error instanceof Error ? `${error.name}: ${error.message}` : String(error)
    )
  } finally {
    clearTimeout(timer)
  }
}

/** Maps a non-OK upstream HTTP status to a user-safe error. */
export function upstreamStatusError(service: UpstreamService, status: number) {
  if (status === 429) {
    return new BusinessSearchError({
      message: RATE_LIMITED_MESSAGE,
      status: 429,
      code: "upstream_rate_limited",
      service,
      detail: `HTTP ${status}`,
    })
  }
  // Overpass answers 503/504 when it has no free query slots.
  const code = status === 503 || status === 504 ? "upstream_busy" : "upstream_unavailable"
  return upstreamError(service, code, `HTTP ${status}`)
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
