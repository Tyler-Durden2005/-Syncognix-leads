"use client"

import Link from "next/link"
import { Logo } from "@/components/brand/logo"
import { brand } from "@/config/brand"
import type { AppUser } from "@/types"
import { SidebarNav } from "./sidebar-nav"
import { UserMenu } from "./user-menu"

type SidebarContentProps = {
  user: AppUser
  layoutId: string
  onNavigate?: () => void
}

/** Shared body of the desktop sidebar and the mobile drawer. */
export function SidebarContent({ user, layoutId, onNavigate }: SidebarContentProps) {
  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex h-14 shrink-0 items-center px-5">
        <Link
          href="/dashboard"
          onClick={onNavigate}
          className="rounded-md outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
          aria-label={`${brand.name} home`}
        >
          <Logo textClassName="text-sidebar-accent-foreground" />
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pt-4">
        <SidebarNav layoutId={layoutId} onNavigate={onNavigate} />
      </div>

      <div className="px-3 pb-3">
        <div className="mb-3 rounded-md border border-sidebar-border bg-sidebar-accent/40 p-3">
          <p className="text-xs font-medium text-sidebar-accent-foreground">Lead search is next</p>
          <p className="mt-1 text-xs leading-relaxed text-sidebar-muted">
            Business discovery and email finding arrive in the next release.
          </p>
        </div>
        <div className="border-t border-sidebar-border pt-3">
          <UserMenu user={user} variant="sidebar" />
        </div>
      </div>
    </div>
  )
}
