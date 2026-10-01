"use client"

import { useEffect, useRef, useState, useTransition } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Loader2, Search } from "lucide-react"
import { Input } from "@/components/ui/input"

const DEBOUNCE_MS = 300

/** Searches saved leads by name, city, state or category via the `?q=` param. */
export function LeadsToolbar({ query, total }: { query: string; total: number | null }) {
  const router = useRouter()
  const pathname = usePathname()
  const [value, setValue] = useState(query)
  const [pending, startTransition] = useTransition()
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)

  // Follow outside URL changes (e.g. "Clear search") without fighting typing.
  const [prevQuery, setPrevQuery] = useState(query)
  if (query !== prevQuery) {
    setPrevQuery(query)
    if (query !== value.trim()) setValue(query)
  }

  useEffect(() => () => clearTimeout(timer.current), [])

  function navigate(next: string) {
    const term = next.trim()
    // A new search always starts from the first page.
    const href = term ? `${pathname}?q=${encodeURIComponent(term)}` : pathname
    startTransition(() => router.replace(href, { scroll: false }))
  }

  function onChange(next: string) {
    setValue(next)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => navigate(next), DEBOUNCE_MS)
  }

  return (
    <div className="flex flex-col gap-3 border-b px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
      <div className="relative w-full sm:max-w-xs">
        {pending ? (
          <Loader2 className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 animate-spin text-muted-foreground" aria-hidden />
        ) : (
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
        )}
        <Input
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              clearTimeout(timer.current)
              navigate(value)
            }
          }}
          placeholder="Search name, city, state or category…"
          aria-label="Search saved leads"
          className="h-9 pl-9"
        />
      </div>
      {query && total !== null && (
        <p className="text-xs text-muted-foreground tabular-nums" aria-live="polite">
          {total} {total === 1 ? "match" : "matches"} for “{query}”
        </p>
      )}
    </div>
  )
}
