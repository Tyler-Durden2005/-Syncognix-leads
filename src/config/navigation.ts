import {
  LayoutDashboard,
  Search,
  Settings,
  Users,
  type LucideIcon,
} from "lucide-react"

export type NavItem = {
  title: string
  href: string
  icon: LucideIcon
  description: string
}

export const mainNav: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    description: "Workspace overview",
  },
  {
    title: "Find Leads",
    href: "/find-leads",
    icon: Search,
    description: "Search for businesses",
  },
  {
    title: "Leads",
    href: "/leads",
    icon: Users,
    description: "Your lead database",
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
    description: "Profile and preferences",
  },
]

export function getNavItem(pathname: string) {
  return mainNav.find(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`)
  )
}
