import type { Metadata } from "next"
import { FindLeadsWorkspace } from "@/components/find-leads/find-leads-workspace"
import { PageHeader } from "@/components/shared/page-header"

export const metadata: Metadata = { title: "Find Leads" }

export default function FindLeadsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Find Leads"
        description="Search for businesses that match your ideal customer profile."
      />

      <FindLeadsWorkspace />
    </div>
  )
}
