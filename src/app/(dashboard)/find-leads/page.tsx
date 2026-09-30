import type { Metadata } from "next"
import { Radar } from "lucide-react"
import { LeadSearchForm } from "@/components/find-leads/lead-search-form"
import { EmptyState } from "@/components/shared/empty-state"
import { FadeIn } from "@/components/shared/motion"
import { PageHeader } from "@/components/shared/page-header"

export const metadata: Metadata = { title: "Find Leads" }

export default function FindLeadsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Find Leads"
        description="Search for businesses that match your ideal customer profile."
      />

      <FadeIn>
        <LeadSearchForm />
      </FadeIn>

      <FadeIn delay={0.06}>
        <section aria-labelledby="results-heading" className="rounded-lg border bg-card shadow-xs">
          <div className="flex items-center justify-between border-b px-5 py-4">
            <h2 id="results-heading" className="text-sm font-medium">
              Results
            </h2>
            <span className="text-xs text-muted-foreground tabular-nums">0 businesses</span>
          </div>

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
              description="Run a search to discover businesses, their websites and contact emails — ranked by opportunity."
              className="relative py-20"
            />
          </div>
        </section>
      </FadeIn>
    </div>
  )
}
