"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { FadeIn } from "@/components/shared/motion"
import type { BusinessSearchResponse } from "@/types/business"
import { LeadSearchForm, type LeadSearchValues } from "./lead-search-form"
import { SearchResults, type SearchState } from "./search-results"

/** A little longer than the API's own 60s limit, so the server answers first. */
const CLIENT_TIMEOUT_MS = 70_000

/** Connects the search form to POST /api/businesses/search and shows results. */
export function FindLeadsWorkspace() {
  const router = useRouter()
  const [state, setState] = useState<SearchState>({ status: "idle" })
  const lastSearch = useRef<LeadSearchValues | null>(null)
  const inFlight = useRef<AbortController | null>(null)

  // Cancel a running search if the user leaves the page.
  useEffect(() => () => inFlight.current?.abort(), [])

  async function search(values: LeadSearchValues) {
    lastSearch.current = values
    inFlight.current?.abort()
    const controller = new AbortController()
    inFlight.current = controller
    const timer = setTimeout(() => controller.abort("timeout"), CLIENT_TIMEOUT_MS)

    setState({ status: "loading", businessType: values.businessType, location: values.location })

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
        setState({ status: "error", message: "The server returned an unexpected response. Please try again." })
        return
      }
      if (!body.success) {
        if (response.status === 401) {
          toast.error("Your session has expired. Please sign in again.")
          router.push("/login?next=/find-leads")
        }
        setState({ status: "error", message: body.error })
        return
      }

      setState({ status: "success", data: body })
      if (body.leads.status === "saved" && body.leads.count > 0) {
        // Leads and dashboard pages show saved leads; refresh their server data.
        router.refresh()
      }
    } catch {
      if (controller.signal.aborted && controller.signal.reason !== "timeout") return
      setState({
        status: "error",
        message: controller.signal.aborted
          ? "The search took too long. Please try again."
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

  return (
    <>
      <FadeIn>
        <LeadSearchForm onSearch={search} pending={state.status === "loading"} />
      </FadeIn>

      <FadeIn delay={0.06}>
        <SearchResults state={state} onRetry={retry} />
      </FadeIn>
    </>
  )
}
