import type { Metadata } from "next"
import Link from "next/link"
import { Search, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { LeadsToolbar } from "@/components/leads/leads-toolbar"
import { EmptyState } from "@/components/shared/empty-state"
import { FadeIn } from "@/components/shared/motion"
import { PageHeader } from "@/components/shared/page-header"

export const metadata: Metadata = { title: "Leads" }

const columns = [
  "Business",
  "Website",
  "Email",
  "Location",
  "Score",
  "Opportunity",
  "Status",
  "Actions",
]

export default function LeadsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Leads"
        description="Every business you discover, enriched and scored in one place."
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
          </Table>
          <EmptyState
            icon={Users}
            title="No leads yet."
            description="Leads you find will be listed here with their emails, scores and outreach status."
            className="py-16"
            action={
              <Button asChild size="sm">
                <Link href="/find-leads">
                  <Search /> Find Your First Leads
                </Link>
              </Button>
            }
          />
          <div className="flex items-center justify-between border-t px-5 py-3 text-xs text-muted-foreground">
            <span className="tabular-nums">0 leads</span>
            <span>Page 1 of 1</span>
          </div>
        </div>
      </FadeIn>
    </div>
  )
}
