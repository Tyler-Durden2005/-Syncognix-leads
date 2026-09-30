"use client"

import { Bell, BellOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

/** Placeholder — real notifications arrive in a later step. */
export function NotificationsMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Notifications"
          className="text-muted-foreground hover:text-foreground"
        >
          <Bell className="size-[18px]" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
          Notifications
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="flex flex-col items-center px-4 py-8 text-center">
          <BellOff className="mb-2 size-5 text-muted-foreground" aria-hidden />
          <p className="text-sm font-medium">You&apos;re all caught up</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Search and enrichment updates will show up here.
          </p>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
