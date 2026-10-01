"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { FadeIn } from "@/components/shared/motion"
import { saveLeadsAction } from "@/lib/leads/actions"
import type {
  BusinessSearchErrorResponse,
  BusinessSearchResponse,
  BusinessSearchResult,
  CategoryOption,
} from "@/types/business"
import { LeadSearchForm, type LeadSearchValues } from "./lead-search-form"
import { SearchResults, type SearchState } from "./search-results"

/** A little longer than the API's own 60s limit, so the server answers first. */
const CLIENT_TIMEOUT_MS = 70_000

const UNAVAILABLE = "Business search is temporarily unavailable. Please try again."

/** Turns an API error into a friendly message; never shows raw errors. */
function errorMessage(body: BusinessSearchErrorResponse) {
  switch (body.code) {
    case "location_not_found":
      return "We couldn't find that US location. Try a city and state such as Dallas, Texas."
    case "location_not_us":
      return "Syncognix Leads currently supports United States searches only."
    case "unsupported_category":
      return "This business category is not supported yet."
    case "invalid_request":
    case "upstream_rate_limited":
      // These messages are written for users by the API.
      return body.error
    case "upstream_timeout":
      return "Business search took too long to respond. Please try again."
    default:
      return UNAVAILABLE
  }
}

function plural(count: number, one: string, many: string) {
  return `${count} ${count === 1 ? one : many}`
}

/** Connects the search form to POST /api/businesses/search and saving to Supabase. */
export function FindLeadsWorkspace({
  categories,
  defaults,
}: {
  categories: CategoryOption[]
  defaults?: Partial<LeadSearchValues>
}) {
  const router = useRouter()
  const [state, setState] = useState<SearchState>({ status: "idle" })
  const [savedIds, setSavedIds] = useState<ReadonlySet<string>>(new Set())
  const lastSearch = useRef<LeadSearchValues | null>(null)
  const inFlight = useRef<AbortController | null>(null)

  // Cancel a running search if the user leaves the page.
  useEffect(() => () => inFlight.current?.abort(), [])

  async function search(values: LeadSearchValues) {
    if (inFlight.current) return // one search at a time
    lastSearch.current = values
    const controller = new AbortController()
    inFlight.current = controller
    const timer = setTimeout(() => controller.abort("timeout"), CLIENT_TIMEOUT_MS)

    const category = categories.find((c) => c.id === values.businessType)
    setState({
      status: "loading",
      label: category?.plural ?? values.businessType,
      location: values.location,
      startedAt: Date.now(),
    })

    try {
      const response = await fetch("/api/businesses/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
        signal: controller.signal,
      })

      let body: BusinessSearchResponse | null = null
      try {
        body = (await response.json()) as BusinessSearchResponse
      } catch {
        body = null
      }

      if (!body) {
        setState({ status: "error", message: UNAVAILABLE })
        return
      }
      if (!body.success) {
        if (response.status === 401 || body.code === "unauthorized") {
          toast.error("Your session has expired. Please sign in again.")
          router.push("/login?next=/find-leads")
        }
        setState({ status: "error", message: errorMessage(body) })
        return
      }

      setSavedIds(new Set(body.savedOsmIds))
      setState({ status: "success", data: body, id: Date.now() })
    } catch {
      if (controller.signal.aborted && controller.signal.reason !== "timeout") return
      setState({
        status: "error",
        message: controller.signal.aborted
          ? "Business search took too long to respond. Please try again."
          : "We couldn't reach the server. Check your connection and try again.",
      })
    } finally {
      clearTimeout(timer)
      if (inFlight.current === controller) inFlight.current = null
    }
  }

  function retry() {
    if (lastSearch.current) void search(lastSearch.current)
  }

  const data = state.status === "success" ? state.data : null

  /** Saves businesses in one batch. Resolves true on success; results stay on screen either way. */
  const save = useCallback(
    async (businesses: BusinessSearchResult[]) => {
      if (!data || businesses.length === 0) return false
      const result = await saveLeadsAction({
        businesses,
        businessType: categories.find((c) => c.id === data.query.normalizedBusinessType)?.label ??
          data.query.businessType,
        location: data.query.location,
      }).catch(() => null)

      if (!result || !result.ok) {
        toast.error(result?.message ?? "We couldn't save these leads. Please try again.")
        return false
      }

      setSavedIds((current) => new Set([...current, ...result.savedOsmIds]))
      const { saved, alreadySaved } = result
      const viewLeads = { label: "View Leads", onClick: () => router.push("/leads") }
      if (saved === 0) {
        toast.info(
          alreadySaved === 1
            ? "This lead was already in your lead list."
            : `All ${alreadySaved} leads were already in your lead list.`,
          { action: viewLeads }
        )
      } else if (alreadySaved === 0) {
        toast.success(`${plural(saved, "lead", "leads")} saved successfully.`, { action: viewLeads })
      } else {
        toast.success(
          `${plural(saved, "new lead", "new leads")} saved. ${alreadySaved} ${
            alreadySaved === 1 ? "was" : "were"
          } already in your lead list.`,
          { action: viewLeads }
        )
      }
      return true
    },
    [data, categories, router]
  )

  return (
    <>
      {/* Above the results so the business type list can overlap them. */}
      <FadeIn className="relative z-10">
        <LeadSearchForm
          categories={categories}
          defaults={defaults}
          onSearch={search}
          pending={state.status === "loading"}
        />
      </FadeIn>

      <FadeIn delay={0.06}>
        <SearchResults
          state={state}
          categories={categories}
          savedIds={savedIds}
          onSave={save}
          onRetry={retry}
        />
      </FadeIn>
    </>
  )
}
