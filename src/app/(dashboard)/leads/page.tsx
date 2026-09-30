import type { Metadata } from "next"
import Link from "next/link"
import { ChevronLeft, ChevronRight, CircleAlert, Database, Search, Users } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { LocationText, PhoneLink, WebsiteLink } from "@/components/leads/business-cells"
import { LeadsToolbar } from "@/components/leads/leads-toolbar"
import { EmptyState } from "@/components/shared/empty-state"
import { FadeIn } from "@/components/shared/motion"
import { PageHeader } from "@/components/shared/page-header"
import { requireUser } from "@/lib/auth/user"
import { getLeadsPage } from "@/lib/leads/get-leads"
import type { LeadStatus } from "@/types"

export const metadata: Metadata = { title: "Leads" }

const columns = ["Business", "Website", "Phone", "Location", "Status", "Added"]

const STATUS_LABELS: Record<LeadStatus, string> = {
  new: "New",
  contacted: "Contacted",
  replied: "Replied",
  qualified: "Qualified",
  archived: "Archived",
}

const dateFormat = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" })

function parsePage(value: string | string[] | undefined) {
  const page = Number(Array.isArray(value) ? value[0] : value)
  return Number.isInteger(page) && page > 0 ? page : 1
}

function FindLeadsButton({ label = "Find Leads" }: { label?: string }) {
  return (
    <Button asChild size="sm">
      <Link href="/find-leads">
        <Search /> {label}
      </Link>
    </Button>
  )
}

export default async function LeadsPage(props: PageProps<"/leads">) {
  const user = await requireUser()
  const page = parsePage((await props.searchParams).page)
  const result = await getLeadsPage(user.id, page)

  const total = result.status === "ok" ? result.total : 0

  return (
    <div className="space-y-8">
      <PageHeader
        title="Leads"
        description="Every business you discover, saved in one place."
        actions={
          <Button asChild>
            <Link href="/find-leads">
              <Search /> Find Leads
            </Link>
          </Button>
        }
      />

      <FadeIn>
        <div className="overflow-hidden rounded-lg border bg-card shadow-xs">
          <LeadsToolbar />

          {result.status === "not_set_up" && (
            <EmptyState
              icon={Database}
              title="The leads table isn't set up yet."
              description="Run supabase/migrations/20261001000000_create_leads.sql in the Supabase SQL Editor, then refresh this page."
              className="py-16"
            />
          )}

          {result.status === "error" && (
            <EmptyState
              icon={CircleAlert}
              title="We couldn't load your leads."
              description="Please refresh the page. If this keeps happening, try again in a few minutes."
              className="py-16"
            />
          )}

          {result.status === "ok" && result.leads.length === 0 && (
            <EmptyState
              icon={Users}
              title={result.total === 0 ? "No leads yet." : "No leads on this page."}
              description={
                result.total === 0
                  ? "Businesses you find are saved here automatically with their website, phone and address."
                  : "This page is past the end of your list."
              }
              className="py-16"
              action={
                result.total === 0 ? (
                  <FindLeadsButton label="Find Your First Leads" />
                ) : (
                  <Button asChild size="sm" variant="outline">
                    <Link href="/leads">Back to first page</Link>
                  </Button>
                )
              }
            />
          )}

          {result.status === "ok" && result.leads.length > 0 && (
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow className="hover:bg-transparent">
                  {columns.map((column) => (
                    <TableHead
                      key={column}
                      className="h-10 px-4 text-xs font-medium whitespace-nowrap text-muted-foreground first:pl-5 last:pr-5 last:text-right"
                    >
                      {column}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.leads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell className="px-4 py-3 pl-5 align-top">
                      <div className="min-w-44 font-medium text-foreground">{lead.name}</div>
                      <Badge variant="secondary" className="mt-1 font-normal capitalize">
                        {lead.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 py-3 align-top">
                      <WebsiteLink url={lead.website} />
                    </TableCell>
                    <TableCell className="px-4 py-3 align-top">
                      <PhoneLink phone={lead.phone} />
                    </TableCell>
                    <TableCell className="px-4 py-3 align-top whitespace-normal">
                      <LocationText address={lead.address} city={lead.city} state={lead.state} />
                    </TableCell>
                    <TableCell className="px-4 py-3 align-top">
                      <Badge variant="outline" className="font-normal">
                        {STATUS_LABELS[lead.status] ?? lead.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 py-3 pr-5 text-right align-top whitespace-nowrap text-muted-foreground tabular-nums">
                      {dateFormat.format(new Date(lead.created_at))}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          <div className="flex items-center justify-between gap-3 border-t px-5 py-3 text-xs text-muted-foreground">
            <span className="tabular-nums">
              {total} {total === 1 ? "lead" : "leads"}
            </span>
            {result.status === "ok" && (
              <Pagination page={result.page} pageCount={result.pageCount} />
            )}
          </div>
        </div>
      </FadeIn>
    </div>
  )
}

function Pagination({ page, pageCount }: { page: number; pageCount: number }) {
  const href = (target: number) => (target <= 1 ? "/leads" : `/leads?page=${target}`)
  return (
    <nav aria-label="Leads pages" className="flex items-center gap-2">
      <span className="tabular-nums">
        Page {Math.min(page, pageCount)} of {pageCount}
      </span>
      {page > 1 ? (
        <Button asChild variant="outline" size="icon" className="size-7">
          <Link href={href(Math.min(page - 1, pageCount))} aria-label="Previous page">
            <ChevronLeft />
          </Link>
        </Button>
      ) : (
        <Button variant="outline" size="icon" className="size-7" disabled aria-label="Previous page">
          <ChevronLeft />
        </Button>
      )}
      {page < pageCount ? (
        <Button asChild variant="outline" size="icon" className="size-7">
          <Link href={href(page + 1)} aria-label="Next page">
            <ChevronRight />
          </Link>
        </Button>
      ) : (
        <Button variant="outline" size="icon" className="size-7" disabled aria-label="Next page">
          <ChevronRight />
        </Button>
      )}
    </nav>
  )
}
