"use client"

import { useState } from "react"
import { Building2, Hash, Loader2, MapPin, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FormField, fieldA11y } from "@/components/forms/form-field"
import { collectErrors } from "@/lib/validation"

// Matches the search API's limits (src/lib/business-search/constants.ts).
const MIN_LEADS = 1
const MAX_LEADS = 100
const DEFAULT_LEADS = 25

type Errors = Partial<Record<"businessType" | "location" | "limit", string>>

export type LeadSearchValues = {
  businessType: string
  location: string
  limit: number
}

/** Search criteria form. Validates input, then hands it to `onSearch`. */
export function LeadSearchForm({
  onSearch,
  pending,
}: {
  onSearch: (values: LeadSearchValues) => void
  pending: boolean
}) {
  const [errors, setErrors] = useState<Errors>({})

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pending) return
    const data = new FormData(event.currentTarget)
    const businessType = String(data.get("businessType") ?? "").trim()
    const location = String(data.get("location") ?? "").trim()
    const limit = Number(data.get("limit"))

    const nextErrors =
      collectErrors({
        businessType:
          businessType.length >= 2 ? undefined : "Enter a business type, e.g. dentist.",
        location:
          location.length >= 2 ? undefined : "Enter a US city, state or ZIP code.",
        limit:
          Number.isInteger(limit) && limit >= MIN_LEADS && limit <= MAX_LEADS
            ? undefined
            : `Choose between ${MIN_LEADS} and ${MAX_LEADS} leads.`,
      }) ?? {}

    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return

    onSearch({ businessType, location, limit })
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
    <form onSubmit={onSubmit} noValidate className="rounded-lg border bg-card shadow-xs">
      <div className="border-b px-5 py-4">
        <h2 className="text-sm font-medium">Search criteria</h2>
        <p className="text-[13px] text-muted-foreground">
          Describe the businesses you want to reach. United States locations only.
        </p>
      </div>

      <div className="grid gap-5 p-5 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_10rem]">
        <FormField id="businessType" label="Business type" error={errors.businessType}>
          <IconInput icon={Building2}>
            <Input
              {...fieldA11y("businessType", errors.businessType)}
              name="businessType"
              placeholder="e.g. Dentist"
              autoComplete="off"
              disabled={pending}
              onChange={() => clear("businessType")}
              className="h-10 pl-9"
            />
          </IconInput>
        </FormField>

        <FormField id="location" label="Location" error={errors.location}>
          <IconInput icon={MapPin}>
            <Input
              {...fieldA11y("location", errors.location)}
              name="location"
              placeholder="e.g. Orlando, Florida or 32801"
              autoComplete="off"
              disabled={pending}
              onChange={() => clear("location")}
              className="h-10 pl-9"
            />
          </IconInput>
        </FormField>

        <FormField id="limit" label="Number of leads" error={errors.limit}>
          <IconInput icon={Hash}>
            <Input
              {...fieldA11y("limit", errors.limit)}
              name="limit"
              type="number"
              inputMode="numeric"
              min={MIN_LEADS}
              max={MAX_LEADS}
              defaultValue={DEFAULT_LEADS}
              disabled={pending}
              onChange={() => clear("limit")}
              className="h-10 pl-9 tabular-nums"
            />
          </IconInput>
        </FormField>
      </div>

      <div className="flex flex-col-reverse gap-3 border-t bg-muted/30 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">
          Try plumber, dentist, restaurant, car wash, car repair, electrician, roofing,
          landscaping, cleaning, HVAC or auto detailing.
        </p>
        <Button type="submit" disabled={pending} className="h-10 shrink-0 sm:h-9">
          {pending ? <Loader2 className="animate-spin" aria-hidden /> : <Search />}
          {pending ? "Searching…" : "Find Leads"}
        </Button>
      </div>
    </form>
  )
}

function IconInput({
  icon: Icon,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>
  children: React.ReactNode
}) {
  return (
    <div className="relative">
      <Icon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
      {children}
    </div>
  )
}
