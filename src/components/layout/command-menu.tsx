"use client"

import { useEffect, useId, useMemo, useState, useSyncExternalStore } from "react"
import { useRouter } from "next/navigation"
import { CornerDownLeft, Moon, Search } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { mainNav } from "@/config/navigation"
import { useTheme } from "@/lib/theme"
import { cn } from "@/lib/utils"

type Command = {
  id: string
  label: string
  hint: string
  icon: LucideIcon
  run: () => void
}

const noopSubscribe = () => () => {}
const isMacPlatform = () => /Mac|iPhone|iPad/.test(navigator.userAgent)

/**
 * Lightweight command palette (⌘K). For now it covers navigation and a few
 * actions; lead search will plug in here later.
 */
export function CommandMenu() {
  const router = useRouter()
  const { resolvedTheme, setTheme } = useTheme()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [active, setActive] = useState(0)
  const listId = useId()
  const isMac = useSyncExternalStore(noopSubscribe, isMacPlatform, () => false)

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        setOpen((value) => !value)
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  const commands = useMemo<Command[]>(
    () => [
      ...mainNav.map((item) => ({
        id: item.href,
        label: `Go to ${item.title}`,
        hint: item.description,
        icon: item.icon,
        run: () => router.push(item.href),
      })),
      {
        id: "theme",
        label: `Switch to ${resolvedTheme === "dark" ? "light" : "dark"} theme`,
        hint: "Appearance",
        icon: Moon,
        run: () => setTheme(resolvedTheme === "dark" ? "light" : "dark"),
      },
    ],
    [router, resolvedTheme, setTheme]
  )

  const results = commands.filter((command) =>
    `${command.label} ${command.hint}`.toLowerCase().includes(query.trim().toLowerCase())
  )

  function onOpenChange(next: boolean) {
    setOpen(next)
    if (!next) {
      setQuery("")
      setActive(0)
    }
  }

  function execute(command: Command | undefined) {
    if (!command) return
    onOpenChange(false)
    command.run()
  }

  function onInputKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault()
      setActive((i) => (results.length ? (i + 1) % results.length : 0))
    } else if (event.key === "ArrowUp") {
      event.preventDefault()
      setActive((i) => (results.length ? (i - 1 + results.length) % results.length : 0))
    } else if (event.key === "Enter") {
      event.preventDefault()
      execute(results[active])
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "flex size-9 cursor-pointer items-center justify-center gap-2 rounded-md text-sm text-muted-foreground transition-colors outline-none hover:bg-accent hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50",
          "md:w-full md:max-w-72 md:justify-start md:border md:bg-card md:px-3 md:shadow-xs md:hover:border-input md:hover:bg-card"
        )}
        aria-label="Open command menu"
      >
        <Search className="size-[18px] shrink-0 md:size-4" aria-hidden />
        <span className="hidden flex-1 truncate text-left md:block">Search or jump to…</span>
        <kbd className="hidden rounded border bg-muted px-1.5 font-sans text-[11px] font-medium lg:inline-block">
          {isMac ? "⌘K" : "Ctrl K"}
        </kbd>
      </button>

      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          showCloseButton={false}
          className="top-[20%] translate-y-0 gap-0 overflow-hidden p-0 sm:max-w-lg"
        >
          <DialogTitle className="sr-only">Command menu</DialogTitle>
          <DialogDescription className="sr-only">
            Search for a page or action and press Enter to run it.
          </DialogDescription>
          <div className="flex items-center gap-2 border-b px-4">
            <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden />
            <input
              autoFocus
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setActive(0)
              }}
              onKeyDown={onInputKeyDown}
              placeholder="Type a command or search…"
              role="combobox"
              aria-expanded
              aria-controls={listId}
              aria-activedescendant={results[active] ? `${listId}-${active}` : undefined}
              aria-label="Search commands"
              className="h-12 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <ul id={listId} role="listbox" className="max-h-80 overflow-y-auto p-2">
            {results.length === 0 && (
              <li className="px-3 py-8 text-center text-sm text-muted-foreground">
                No results for “{query}”. Lead search is coming in the next release.
              </li>
            )}
            {results.map((command, index) => {
              const Icon = command.icon
              return (
                <li
                  key={command.id}
                  id={`${listId}-${index}`}
                  role="option"
                  aria-selected={index === active}
                  onMouseMove={() => setActive(index)}
                  onClick={() => execute(command)}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                    index === active ? "bg-accent text-accent-foreground" : "text-foreground"
                  )}
                >
                  <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                  <span className="flex-1 truncate">{command.label}</span>
                  <span className="hidden text-xs text-muted-foreground sm:inline">{command.hint}</span>
                  {index === active && (
                    <CornerDownLeft className="size-3.5 text-muted-foreground" aria-hidden />
                  )}
                </li>
              )
            })}
          </ul>
        </DialogContent>
      </Dialog>
    </>
  )
}
