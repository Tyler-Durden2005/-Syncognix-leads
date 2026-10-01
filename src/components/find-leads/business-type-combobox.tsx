"use client"

import { useId, useMemo, useRef, useState } from "react"
import { Building2, Check, ChevronsUpDown } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import type { CategoryOption } from "@/types/business"

function normalize(value: string) {
  return value.toLowerCase().replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim()
}

/** The option whose label, id or alias is exactly `text`, if any. */
export function findCategory(options: CategoryOption[], text: string) {
  const query = normalize(text)
  if (!query) return null
  return (
    options.find((option) =>
      [option.label, option.id, ...option.aliases].some((phrase) => normalize(phrase) === query)
    ) ?? null
  )
}

type Match = { option: CategoryOption; alias?: string }

function filterOptions(options: CategoryOption[], text: string): Match[] {
  const query = normalize(text)
  if (!query) return options.map((option) => ({ option }))
  const matches: Match[] = []
  for (const option of options) {
    if (normalize(option.label).includes(query) || normalize(option.id).includes(query)) {
      matches.push({ option })
      continue
    }
    const alias = option.aliases.find((phrase) => normalize(phrase).includes(query))
    if (alias) matches.push({ option, alias })
  }
  return matches
}

/**
 * Searchable list of supported business types (ARIA 1.2 combobox pattern).
 * Typing filters by name and common synonyms, e.g. "mobile detailing" finds
 * Auto detailing. `value` is the selected category id, or "" when none.
 */
export function BusinessTypeCombobox({
  id,
  name,
  options,
  value,
  onValueChange,
  disabled,
  invalid,
  describedBy,
}: {
  id: string
  name: string
  options: CategoryOption[]
  value: string
  onValueChange: (id: string) => void
  disabled?: boolean
  invalid?: boolean
  describedBy?: string
}) {
  const listId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const selected = options.find((option) => option.id === value) ?? null

  const [text, setText] = useState(selected?.label ?? "")
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  // Show the full list right after focusing, even if a value is selected.
  const [filtering, setFiltering] = useState(false)

  const matches = useMemo(
    () => filterOptions(options, filtering ? text : ""),
    [options, text, filtering]
  )

  function choose(option: CategoryOption) {
    onValueChange(option.id)
    setText(option.label)
    setFiltering(false)
    setOpen(false)
  }

  function commitText() {
    const match = findCategory(options, text)
    if (match) choose(match)
    else {
      onValueChange("")
      setOpen(false)
    }
  }

  function moveActive(next: number) {
    const index = (next + matches.length) % Math.max(matches.length, 1)
    setActive(index)
    listRef.current
      ?.querySelector<HTMLElement>(`[data-index="${index}"]`)
      ?.scrollIntoView({ block: "nearest" })
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault()
        if (!open) {
          setOpen(true)
          setActive(0)
        } else moveActive(active + 1)
        break
      case "ArrowUp":
        event.preventDefault()
        if (open) moveActive(active - 1)
        break
      case "Enter":
        // Pick the highlighted option instead of submitting the form.
        if (open && matches[active]) {
          event.preventDefault()
          choose(matches[active].option)
        }
        break
      case "Escape":
        if (open) {
          event.preventDefault()
          setOpen(false)
        }
        break
    }
  }

  const activeId = open && matches[active] ? `${listId}-${active}` : undefined

  return (
    <div className="relative">
      <Building2
        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
      <Input
        ref={inputRef}
        id={id}
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={activeId}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        placeholder="Choose or type, e.g. Plumber"
        autoComplete="off"
        spellCheck={false}
        disabled={disabled}
        value={text}
        onChange={(event) => {
          setText(event.target.value)
          setFiltering(true)
          setOpen(true)
          setActive(0)
          if (value) onValueChange("")
        }}
        onFocus={() => {
          setFiltering(false)
          setActive(Math.max(0, options.findIndex((option) => option.id === value)))
          setOpen(true)
        }}
        onBlur={commitText}
        onKeyDown={onKeyDown}
        className="h-10 pr-9 pl-9"
      />
      <ChevronsUpDown
        className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground/70"
        aria-hidden
      />
      {/* Submitted value: the category id, or the raw text for server-side matching. */}
      <input type="hidden" name={name} value={value || text.trim()} />

      <ul
        ref={listRef}
        id={listId}
        role="listbox"
        aria-label="Business types"
        hidden={!open}
        className={cn(
          "absolute inset-x-0 top-full z-50 mt-1 max-h-64 overflow-y-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
          open && "animate-in fade-in-0 zoom-in-[0.98] duration-150"
        )}
      >
        {matches.length === 0 ? (
          <li role="presentation" className="px-2 py-6 text-center text-sm text-muted-foreground">
            This business category is not supported yet.
          </li>
        ) : (
          matches.map(({ option, alias }, index) => (
            <li
              key={option.id}
              id={`${listId}-${index}`}
              data-index={index}
              role="option"
              aria-selected={option.id === value}
              // Keep focus in the input so blur doesn't fire before the click.
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => choose(option)}
              onMouseMove={() => active !== index && setActive(index)}
              className={cn(
                "flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm select-none",
                index === active && "bg-accent text-accent-foreground"
              )}
            >
              <span className="flex-1 truncate">
                {option.label}
                {alias && (
                  <span className="ml-1.5 text-xs text-muted-foreground">
                    matches “{alias}”
                  </span>
                )}
              </span>
              {option.id === value && <Check className="size-4 text-primary" aria-hidden />}
            </li>
          ))
        )}
      </ul>
    </div>
  )
}
