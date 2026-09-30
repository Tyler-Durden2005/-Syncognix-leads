"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight } from "lucide-react"
import { LogoMark } from "@/components/brand/logo"
import { brand } from "@/config/brand"
import { getNavItem } from "@/config/navigation"
import type { AppUser } from "@/types"
import { CommandMenu } from "./command-menu"
import { MobileSidebar } from "./mobile-sidebar"
import { NotificationsMenu } from "./notifications-menu"
import { ThemeToggle } from "./theme-toggle"
import { UserMenu } from "./user-menu"

export function AppHeader({ user }: { user: AppUser }) {
  const pathname = usePathname()
  const current = getNavItem(pathname)

  return (
    <header className="sticky top-0 z-20 border-b bg-background/80 backdrop-blur-md">
      <div className="flex h-14 items-center gap-2 px-4 sm:gap-3 sm:px-6 lg:px-8">
        <MobileSidebar user={user} />
        {/* Desktop shows the brand in the sidebar; mobile gets the compact mark. */}
        <Link
          href="/dashboard"
          aria-label={`${brand.name} home`}
          className="shrink-0 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring lg:hidden"
        >
          <LogoMark size="sm" />
        </Link>

        <nav aria-label="Breadcrumb" className="min-w-0 flex-1">
          <ol className="flex items-center gap-1.5 text-sm">
            <li className="hidden text-muted-foreground sm:block">Workspace</li>
            <li aria-hidden className="hidden text-muted-foreground/60 sm:block">
              <ChevronRight className="size-3.5" />
            </li>
            <li className="truncate font-medium" aria-current="page">
              {current?.title ?? "Dashboard"}
            </li>
          </ol>
        </nav>

        <div className="flex justify-center md:flex-1">
          <CommandMenu />
        </div>

        <div className="flex items-center justify-end gap-1 md:flex-1">
          <NotificationsMenu />
          <ThemeToggle />
          <div className="ml-1 border-l pl-3 sm:ml-2">
            <UserMenu user={user} variant="header" />
          </div>
        </div>
      </div>
    </header>
  )
}
