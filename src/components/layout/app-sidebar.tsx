import type { AppUser } from "@/types"
import { SidebarContent } from "./sidebar-content"

/** Fixed desktop sidebar (≥1024px). Mobile uses <MobileSidebar>. */
export function AppSidebar({ user }: { user: AppUser }) {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 border-r border-sidebar-border lg:block">
      <SidebarContent user={user} layoutId="sidebar-active-desktop" />
    </aside>
  )
}
