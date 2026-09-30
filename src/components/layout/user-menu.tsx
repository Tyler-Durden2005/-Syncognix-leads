"use client"

import Link from "next/link"
import { ChevronsUpDown, LogOut, Monitor, Moon, Settings, Sun } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useTheme, type Theme } from "@/lib/theme"
import { cn } from "@/lib/utils"
import type { AppUser } from "@/types"
import { UserAvatar } from "./user-avatar"
import { useSignOut } from "./use-sign-out"

type UserMenuProps = {
  user: AppUser
  /** "sidebar" renders a full-width row; "header" renders just the avatar. */
  variant: "sidebar" | "header"
}

export function UserMenu({ user, variant }: UserMenuProps) {
  const { theme, setTheme } = useTheme()
  const { signOut, isPending } = useSignOut()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Open account menu"
        className={cn(
          "cursor-pointer outline-none",
          variant === "sidebar"
            ? "flex w-full items-center gap-3 rounded-md p-2 text-left transition-colors hover:bg-sidebar-accent/60 focus-visible:ring-2 focus-visible:ring-sidebar-ring data-[state=open]:bg-sidebar-accent/60"
            : "rounded-full transition-shadow focus-visible:ring-[3px] focus-visible:ring-ring/50"
        )}
      >
        <UserAvatar user={user} />
        {variant === "sidebar" && (
          <>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-sidebar-accent-foreground">
                {user.fullName}
              </span>
              <span className="block truncate text-xs text-sidebar-muted">{user.email}</span>
            </span>
            <ChevronsUpDown className="size-4 shrink-0 text-sidebar-muted" aria-hidden />
          </>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align={variant === "sidebar" ? "start" : "end"}
        side={variant === "sidebar" ? "top" : "bottom"}
        sideOffset={8}
        className="w-60"
      >
        <DropdownMenuLabel className="flex items-center gap-3 font-normal">
          <UserAvatar user={user} />
          <span className="min-w-0">
            <span className="block truncate text-sm font-medium">{user.fullName}</span>
            <span className="block truncate text-xs text-muted-foreground">{user.email}</span>
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/settings">
              <Settings /> Settings
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Sun className="dark:hidden" />
              <Moon className="hidden dark:block" />
              Theme
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="w-36">
              <DropdownMenuRadioGroup
                value={theme}
                onValueChange={(value) => setTheme(value as Theme)}
              >
                <DropdownMenuRadioItem value="light">
                  <Sun /> Light
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="dark">
                  <Moon /> Dark
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="system">
                  <Monitor /> System
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          disabled={isPending}
          onSelect={(event) => {
            event.preventDefault()
            signOut()
          }}
        >
          <LogOut /> {isPending ? "Signing out…" : "Sign out"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
