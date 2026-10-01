"use client"

import { useState } from "react"
import { Loader2, MapPin, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FormField, fieldA11y } from "@/components/forms/form-field"
import { cn } from "@/lib/utils"
import { collectErrors } from "@/lib/validation"
import type { CategoryOption } from "@/types/business"
import { BusinessTypeCombobox, findCategory } from "./business-type-combobox"

export const LEAD_COUNT_OPTIONS = [10, 25, 50, 100] as const
export const DEFAULT_LEAD_COUNT = 25

type Errors = Partial<Record<"businessType" | "location", string>>

export type LeadSearchValues = {
  /** Category id, e.g. "car wash". */
  businessType: string
  location: string
  limit: number
}

/** Search criteria form. Validates input, then hands it to `onSearch`. */
export function LeadSearchForm({
  categories,
  defaults,
  onSearch,
  pending,
}: {
  categories: CategoryOption[]
  defaults?: Partial<LeadSearchValues>
  onSearch: (values: LeadSearchValues) => void
  pending: boolean
}) {
  const [errors, setErrors] = useState<Errors>({})
  const [category, setCategory] = useState(
    () => (defaults?.businessType && findCategory(categories, defaults.businessType)?.id) || ""
  )
  const [limit, setLimit] = useState<number>(
    LEAD_COUNT_OPTIONS.find((n) => n === defaults?.limit) ?? DEFAULT_LEAD_COUNT
  )

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pending) return
    const data = new FormData(event.currentTarget)
    const typed = String(data.get("businessType") ?? "").trim()
    const location = String(data.get("location") ?? "").trim()
    const match = category ? categories.find((c) => c.id === category) : findCategory(categories, typed)

    const nextErrors =
      collectErrors({
        businessType: !typed
          ? "Choose a business type, e.g. Plumber."
          : match
            ? undefined
            : "This business category is not supported yet.",
        location:
          location.length >= 2 ? undefined : "Enter a US city and state or a ZIP code.",
      }) ?? {}

    setErrors(nextErrors)
    if (Object.keys(nextErrors).length || !match) return

    onSearch({ businessType: match.id, location, limit })
  }

  function clear(name: keyof Errors) {
    if (!errors[name]) return
    setErrors((current) => {
      const next = { ...current }
      delete next[name]
      return next
    })
  }

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      aria-label="Find leads"
      className="rounded-lg border bg-card shadow-xs"
    >
      <div className="border-b px-5 py-4">
        <h2 className="text-sm font-medium">Search criteria</h2>
        <p className="text-[13px] text-muted-foreground">
          Choose a business type and a US location to find real businesses.
        </p>
      </div>

      <div className="grid gap-5 p-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
        <FormField id="businessType" label="Business type" error={errors.businessType}>
          <BusinessTypeCombobox
            id="businessType"
            name="businessType"
            options={categories}
            value={category}
            onValueChange={(id) => {
              setCategory(id)
              if (id) clear("businessType")
            }}
            disabled={pending}
            invalid={Boolean(errors.businessType)}
            describedBy={errors.businessType ? "businessType-error" : undefined}
          />
        </FormField>

        <FormField
          id="location"
          label="Location"
          error={errors.location}
          hint={
            <span className="flex items-center gap-1.5">
              <span className="font-medium text-foreground/80">US locations only</span>
              <span aria-hidden>·</span> city and state, state, or ZIP code
            </span>
          }
        >
          <div className="relative">
            <MapPin
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              {...fieldA11y("location", errors.location)}
              name="location"
              placeholder="Dallas, Texas"
              autoComplete="off"
              defaultValue={defaults?.location}
              disabled={pending}
              onChange={() => clear("location")}
              className="h-10 pl-9"
            />
          </div>
        </FormField>

        <fieldset className="grid content-start gap-2" disabled={pending}>
          <legend className="mb-2 text-sm leading-none font-medium select-none">
            Number of leads
          </legend>
          <div
            className="grid h-10 grid-cols-4 rounded-md border bg-muted/40 p-0.5 lg:w-56"
          >
            {LEAD_COUNT_OPTIONS.map((option) => (
              <label
                key={option}
                className={cn(
                  "relative grid cursor-pointer place-items-center rounded-[5px] text-sm tabular-nums transition-[background-color,color,box-shadow] duration-150 has-[:focus-visible]:ring-[3px] has-[:focus-visible]:ring-ring/50 has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-60",
                  limit === option
                    ? "bg-background font-medium text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <input
                  type="radio"
                  name="limit"
                  value={option}
                  checked={limit === option}
                  onChange={() => setLimit(option)}
                  className="sr-only"
                />
                {option}
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      <div className="flex flex-col-reverse gap-3 border-t bg-muted/30 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">
          Business data comes from OpenStreetMap. Up to 100 leads per search.
        </p>
        <Button
          type="submit"
          disabled={pending}
          aria-busy={pending}
          className="h-10 shrink-0 sm:h-9 sm:min-w-32"
        >
          {pending ? <Loader2 className="animate-spin" aria-hidden /> : <Search />}
          {pending ? "Searching Businesses..." : "Find Leads"}
        </Button>
      </div>
    </form>
  )
}
