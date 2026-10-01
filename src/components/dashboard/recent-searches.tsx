import Link from "next/link"
import { ArrowUpRight, History, MapPin, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/shared/empty-state"
import { SectionCard } from "@/components/shared/section-card"
import type { SearchHistoryEntry } from "@/types"

const timeFormat = new Intl.RelativeTimeFormat("en-US", { numeric: "auto" })

function timeAgo(iso: string) {
  const seconds = Math.round((new Date(iso).getTime() - Date.now()) / 1000)
  const steps: [Intl.RelativeTimeFormatUnit, number][] = [
    ["day", 86_400],
    ["hour", 3_600],
    ["minute", 60],
  ]
  for (const [unit, size] of steps) {
    if (Math.abs(seconds) >= size) return timeFormat.format(Math.round(seconds / size), unit)
  }
  return "just now"
}

function rerunHref(search: SearchHistoryEntry) {
  const params = new URLSearchParams({
    businessType: search.business_type,
    location: search.location,
  })
  return `/find-leads?${params}`
}

export function RecentSearches({ searches }: { searches: SearchHistoryEntry[] }) {
  return (
    <SectionCard
      title="Recent searches"
      description="Your latest lead searches and their results."
      contentClassName={searches.length ? "px-0 py-0" : "flex items-center justify-center"}
    >
      {searches.length === 0 ? (
        <EmptyState
          icon={History}
          title="No searches yet."
          description="Start your first lead search to see activity here."
          action={
            <Button asChild size="sm">
              <Link href="/find-leads">
                <Search /> Find Leads
              </Link>
            </Button>
          }
        />
      ) : (
        <ul className="divide-y">
          {searches.map((search) => (
            <li key={search.id}>
              <Link
                href={rerunHref(search)}
                className="group flex items-center gap-3 px-5 py-3 outline-none transition-colors hover:bg-muted/40 focus-visible:bg-muted/40 focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:ring-inset"
              >
                <span className="grid size-8 shrink-0 place-items-center rounded-md border bg-muted/50 text-muted-foreground">
                  <Search className="size-4" strokeWidth={1.85} aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{search.business_type}</span>
                  <span className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                    <MapPin className="size-3 shrink-0" aria-hidden />
                    {search.location}
                  </span>
                </span>
                <span className="shrink-0 text-right text-xs text-muted-foreground">
                  <span className="block font-medium text-foreground tabular-nums">
                    {search.result_count} {search.result_count === 1 ? "result" : "results"}
                  </span>
                  {timeAgo(search.created_at)}
                </span>
                <ArrowUpRight
                  className="size-4 shrink-0 text-muted-foreground/60 transition-colors group-hover:text-foreground"
                  aria-hidden
                />
                <span className="sr-only">Search again</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  )
}
