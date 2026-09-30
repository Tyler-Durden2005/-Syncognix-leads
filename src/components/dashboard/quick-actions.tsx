import { Search, Settings, Users } from "lucide-react"
import { SectionCard } from "@/components/shared/section-card"
import { QuickActionCard } from "./quick-action-card"

const actions = [
  {
    href: "/find-leads",
    title: "Find Leads",
    description: "Search businesses by type and location",
    icon: Search,
  },
  {
    href: "/leads",
    title: "View Leads",
    description: "Browse and manage your lead list",
    icon: Users,
  },
  {
    href: "/settings",
    title: "Open Settings",
    description: "Profile, appearance and integrations",
    icon: Settings,
  },
]

export function QuickActions() {
  return (
    <SectionCard title="Quick actions" contentClassName="space-y-2">
      {actions.map((action) => (
        <QuickActionCard key={action.href} {...action} />
      ))}
    </SectionCard>
  )
}
