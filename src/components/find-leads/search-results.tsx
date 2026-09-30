"use client"

import Link from "next/link"
import { CircleAlert, CircleCheck, Info, Radar, SearchX, TriangleAlert } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { LocationText, PhoneLink, WebsiteLink } from "@/components/leads/business-cells"
import { EmptyState } from "@/components/shared/empty-state"
import { cn } from "@/lib/utils"
import type { BusinessSearchSuccessResponse } from "@/types/business"

export type SearchState =
  | { status: "idle" }
  | { status: "loading"; businessType: string; location: string }
  | { status: "error"; message: string }
  | { status: "success"; data: BusinessSearchSuccessResponse }

const COLUMNS = ["Business", "Website", "Phone", "Address"]

export function SearchResults({
  state,
  onRetry,
}: {
  state: SearchState
  onRetry: () => void
}) {
  const count = state.status === "success" ? state.data.count : 0

  return (
    <section
      aria-labelledby="results-heading"
      aria-busy={state.status === "loading"}
      className="overflow-hidden rounded-lg border bg-card shadow-xs"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b px-5 py-4">
        <div className="min-w-0">
          <h2 id="results-heading" className="text-sm font-medium">
            Results
          </h2>
          {state.status === "success" && (
            <p className="truncate text-xs text-muted-foreground">
              Near {state.data.searchLocation.displayName}
            </p>
          )}
        </div>
        <span className="text-xs text-muted-foreground tabular-nums">
          {count} {count === 1 ? "business" : "businesses"}
        </span>
      </div>

      {state.status === "idle" && <IdleState />}
      {state.status === "loading" && <LoadingState state={state} />}
      {state.status === "error" && (
        <EmptyState
          icon={CircleAlert}
          title="Search failed"
          description={state.message}
          className="py-16 [&_h3]:text-destructive"
          action={
            <Button variant="outline" size="sm" onClick={onRetry}>
              Try again
            </Button>
          }
        />
      )}
      {state.status === "success" && <ResultsTable data={state.data} />}
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
            <span className="size-8 rounded-md bg-muted" />
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

function LoadingState({ state }: { state: Extract<SearchState, { status: "loading" }> }) {
  return (
    <div>
      <p role="status" className="border-b px-5 py-3 text-sm text-muted-foreground">
        Searching for <span className="font-medium text-foreground">{state.businessType}</span> near{" "}
        <span className="font-medium text-foreground">{state.location}</span>… Most searches take a
        few seconds; some trades can take up to a minute.
      </p>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 border-b px-5 py-4 last:border-b-0">
          <Skeleton className="h-3 w-44" />
          <Skeleton className="ml-auto hidden h-3 w-32 sm:block" />
          <Skeleton className="hidden h-3 w-28 md:block" />
          <Skeleton className="hidden h-3 w-48 lg:block" />
        </div>
      ))}
    </div>
  )
}

function Banner({
  tone,
  icon: Icon,
  children,
}: {
  tone: "success" | "warning" | "error" | "muted"
  icon: React.ComponentType<{ className?: string }>
  children: React.ReactNode
}) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "flex items-start gap-2.5 border-b px-5 py-3 text-sm",
        tone === "success" && "bg-success/8 text-success",
        tone === "warning" && "bg-warning/10 text-foreground [&_svg]:text-warning",
        tone === "error" && "bg-destructive/5 text-destructive",
        tone === "muted" && "bg-muted/40 text-muted-foreground"
      )}
    >
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden />
      <div className="leading-snug">{children}</div>
    </div>
  )
}

function ResultsTable({ data }: { data: BusinessSearchSuccessResponse }) {
  const { businesses, leads, meta } = data

  return (
    <div>
      {leads.status === "saved" && leads.count > 0 && (
        <Banner tone="success" icon={CircleCheck}>
          Saved {leads.count} {leads.count === 1 ? "lead" : "leads"} to your list.{" "}
          <Link href="/leads" className="font-medium underline underline-offset-4">
            View Leads
          </Link>
        </Banner>
      )}
      {leads.status === "failed" && (
        <Banner tone="error" icon={CircleAlert}>
          {leads.message}
        </Banner>
      )}
      {leads.status === "skipped" && (
        <Banner tone="muted" icon={Info}>
          {leads.message}
        </Banner>
      )}
      {meta.notice && (
        <Banner tone="warning" icon={TriangleAlert}>
          {meta.notice}
        </Banner>
      )}

      {businesses.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="No businesses found."
          description="OpenStreetMap has no matching businesses within 30 km. Try a nearby larger city or a related category."
          className="py-16"
        />
      ) : (
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow className="hover:bg-transparent">
              {COLUMNS.map((column) => (
                <TableHead
                  key={column}
                  className="h-10 px-4 text-xs font-medium whitespace-nowrap text-muted-foreground first:pl-5 last:pr-5"
                >
                  {column}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {businesses.map((business) => (
              <TableRow key={business.osmId}>
                <TableCell className="px-4 py-3 pl-5 align-top">
                  <div className="min-w-44 font-medium text-foreground">{business.name}</div>
                  <Badge variant="secondary" className="mt-1 font-normal capitalize">
                    {business.category}
                  </Badge>
                </TableCell>
                <TableCell className="px-4 py-3 align-top">
                  <WebsiteLink url={business.website} />
                </TableCell>
                <TableCell className="px-4 py-3 align-top">
                  <PhoneLink phone={business.phone} />
                </TableCell>
                <TableCell className="px-4 py-3 pr-5 align-top whitespace-normal">
                  <LocationText
                    address={business.address}
                    city={business.city}
                    state={business.state}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {businesses.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2 border-t px-5 py-3 text-xs text-muted-foreground">
          <span className="tabular-nums">
            Showing {businesses.length} of {meta.resultsBeforeLimit} found
          </span>
          <span>Data © OpenStreetMap contributors</span>
        </div>
      )}
    </div>
  )
}
