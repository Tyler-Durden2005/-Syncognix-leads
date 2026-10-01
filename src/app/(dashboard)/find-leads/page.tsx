import type { Metadata } from "next"
import { FindLeadsWorkspace } from "@/components/find-leads/find-leads-workspace"
import { PageHeader } from "@/components/shared/page-header"
import { getCategoryOptions } from "@/lib/business-search/normalize-category"

export const metadata: Metadata = { title: "Find Leads" }

function param(value: string | string[] | undefined) {
  const text = Array.isArray(value) ? value[0] : value
  return text?.trim().slice(0, 200) || undefined
}

export default async function FindLeadsPage({ searchParams }: PageProps<"/find-leads">) {
  // Recent searches on the dashboard link here with the form prefilled.
  const params = await searchParams
  const limit = Number(param(params.limit))

  return (
    <div className="space-y-8">
      <PageHeader
        title="Find Leads"
        description="Search for businesses that match your ideal customer profile."
      />

      <FindLeadsWorkspace
        categories={getCategoryOptions()}
        defaults={{
          businessType: param(params.businessType),
          location: param(params.location),
          limit: Number.isInteger(limit) ? limit : undefined,
        }}
      />
    </div>
  )
}
