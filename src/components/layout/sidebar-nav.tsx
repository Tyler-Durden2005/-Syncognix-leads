"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import * as m from "motion/react-m"
import { mainNav } from "@/config/navigation"
import { cn } from "@/lib/utils"

type SidebarNavProps = {
  /** Unique per rendered instance so desktop/mobile indicators don't collide. */
  layoutId: string
  onNavigate?: () => void
}

export function SidebarNav({ layoutId, onNavigate }: SidebarNavProps) {
  const pathname = usePathname()

  return (
    <nav aria-label="Main">
      <p className="mb-2 px-3 text-[11px] font-medium tracking-wider text-sidebar-muted/80 uppercase">
        Workspace
      </p>
      <ul className="space-y-0.5">
        {mainNav.map(({ title, href, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`)
          return (
            <li key={href}>
              <Link
                href={href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "group relative flex h-9 items-center gap-3 rounded-md px-3 text-sm outline-none",
                  "transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-sidebar-ring",
                  active
                    ? "text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                )}
              >
                {active && (
                  <m.span
                    layoutId={layoutId}
                    aria-hidden
                    className="absolute inset-0 rounded-md bg-sidebar-accent ring-1 ring-white/[0.04] ring-inset"
                    transition={{ type: "spring", stiffness: 500, damping: 40, mass: 0.8 }}
                  >
                    <span className="absolute top-1/2 left-0 h-4 w-[3px] -translate-y-1/2 rounded-r-full bg-sidebar-primary" />
                  </m.span>
                )}
                <Icon
                  aria-hidden
                  className={cn(
                    "relative size-4 shrink-0 transition-[color,transform] duration-150 group-hover:translate-x-px",
                    active ? "text-sidebar-primary" : "text-sidebar-muted group-hover:text-sidebar-foreground"
                  )}
                  strokeWidth={1.85}
                />
                <span className="relative">{title}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
