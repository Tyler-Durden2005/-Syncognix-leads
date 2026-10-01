"use client"

import { useEffect, useState } from "react"
import { CircleAlert, Loader2, Radar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/shared/empty-state"
import { lowerFirst } from "@/lib/format"
import type {
  BusinessSearchResult,
  BusinessSearchSuccessResponse,
  CategoryOption,
} from "@/types/business"
import { ResultsView } from "./results-view"

export type SearchState =
  | { status: "idle" }
  | { status: "loading"; label: string; location: string; startedAt: number }
  | { status: "error"; message: string }
  | { status: "success"; data: BusinessSearchSuccessResponse; id: number }

export function SearchResults({
  state,
  categories,
  savedIds,
  onSave,
  onRetry,
}: {
  state: SearchState
  categories: CategoryOption[]
  savedIds: ReadonlySet<string>
  onSave: (businesses: BusinessSearchResult[]) => Promise<boolean>
  onRetry: () => void
}) {
  return (
    <section
      aria-label="Search results"
      aria-busy={state.status === "loading"}
      className="overflow-hidden rounded-lg border bg-card shadow-xs"
    >
      {state.status === "idle" && <IdleState />}
      {state.status === "loading" && <LoadingState state={state} />}
      {state.status === "error" && (
        <EmptyState
          icon={CircleAlert}
          title="Search didn't complete"
          description={state.message}
          className="py-16"
          action={
            <Button variant="outline" size="sm" onClick={onRetry}>
              Try again
            </Button>
          }
        />
      )}
      {state.status === "success" && (
        // Keyed by search so filters and selection reset for each new search.
        <ResultsView
          key={state.id}
          data={state.data}
          categories={categories}
          savedIds={savedIds}
          onSave={onSave}
        />
      )}
    </section>
  )
}

function IdleState() {
  return (
    <div className="relative overflow-hidden">
      {/* Faint row silhouettes hint at the results layout */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 space-y-px opacity-60 [mask-image:linear-gradient(to_bottom,black,transparent_85%)]">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 border-b border-dashed px-5 py-4">
            <span className="size-4 rounded bg-muted" />
            <span className="h-2.5 w-40 rounded-full bg-muted" />
            <span className="ml-auto hidden h-2.5 w-24 rounded-full bg-muted sm:block" />
            <span className="hidden h-2.5 w-16 rounded-full bg-muted md:block" />
          </div>
        ))}
      </div>
      <EmptyState
        icon={Radar}
        title="Your results will appear here."
        description="Run a search to discover US businesses with their websites, phone numbers and addresses."
        className="relative py-20"
      />
    </div>
  )
}

/** Honest progress copy: what we're doing, never what we've "found". */
const STAGES = [
  { after: 0, text: "Locating the area…" },
  { after: 1_500, text: "Searching OpenStreetMap business data…" },
  { after: 9_000, text: "Still searching OpenStreetMap for more businesses…" },
  { after: 25_000, text: "Still searching. Busy areas can take up to a minute." },
]

function LoadingState({ state }: { state: Extract<SearchState, { status: "loading" }> }) {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => setElapsed(Date.now() - state.startedAt), 500)
    return () => clearInterval(timer)
  }, [state.startedAt])

  const stage = [...STAGES].reverse().find((s) => elapsed >= s.after) ?? STAGES[0]

  return (
    <div>
      <div className="border-b px-5 py-4">
        <div className="flex items-start gap-3">
          <Loader2 className="mt-0.5 size-4 shrink-0 animate-spin text-primary" aria-hidden />
          <div className="min-w-0" role="status" aria-live="polite">
            <p className="text-sm font-medium">
              Searching {lowerFirst(state.label)} in {state.location}…
            </p>
            <p
              key={stage.text}
              className="mt-0.5 animate-in text-[13px] text-muted-foreground duration-300 fade-in"
            >
              {stage.text}
            </p>
          </div>
        </div>
        {/* Indeterminate progress track */}
        <div className="relative mt-4 h-1 overflow-hidden rounded-full bg-muted" aria-hidden>
          <div className="absolute inset-y-0 w-1/3 animate-[search-progress_1.4s_ease-in-out_infinite] rounded-full motion-reduce:animate-none bg-primary/70" />
        </div>
      </div>
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 border-b px-5 py-4 last:border-b-0"
          style={{ opacity: 1 - i * 0.13 }}
        >
          <Skeleton className="size-4 rounded" />
          <div className="space-y-1.5">
            <Skeleton className="h-3 w-44" />
            <Skeleton className="h-2.5 w-24" />
          </div>
          <Skeleton className="ml-auto hidden h-3 w-32 sm:block" />
          <Skeleton className="hidden h-3 w-28 md:block" />
          <Skeleton className="hidden h-3 w-48 lg:block" />
        </div>
      ))}
    </div>
  )
}
