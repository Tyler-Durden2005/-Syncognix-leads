import Link from "next/link"
import { History, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/shared/empty-state"
import { SectionCard } from "@/components/shared/section-card"

export function RecentSearches() {
  return (
    <SectionCard
      title="Recent searches"
      description="Your latest lead searches and their results."
      contentClassName="flex items-center justify-center"
    >
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
    </SectionCard>
  )
}
