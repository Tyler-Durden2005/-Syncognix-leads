"use client"

import { useState } from "react"
import { Building2, Hash, MapPin, Search } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FormAlert } from "@/components/forms/form-alert"
import { FormField, fieldA11y } from "@/components/forms/form-field"
import { collectErrors } from "@/lib/validation"

const MIN_LEADS = 10
const MAX_LEADS = 500

type Errors = Partial<Record<"businessType" | "location" | "limit", string>>

/**
 * Search form UI. Submitting validates input but does not run a search yet —
 * the search backend ships in Step 2.
 */
export function LeadSearchForm() {
  const [errors, setErrors] = useState<Errors>({})
  const [notice, setNotice] = useState<string>()

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const businessType = String(data.get("businessType") ?? "").trim()
    const location = String(data.get("location") ?? "").trim()
    const limit = Number(data.get("limit"))

    const nextErrors =
      collectErrors({
        businessType: businessType ? undefined : "Enter a business type.",
        location: location ? undefined : "Enter a location.",
        limit:
          Number.isInteger(limit) && limit >= MIN_LEADS && limit <= MAX_LEADS
            ? undefined
            : `Choose between ${MIN_LEADS} and ${MAX_LEADS} leads.`,
      }) ?? {}

    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) {
      setNotice(undefined)
      return
    }

    setNotice(
      `Ready to search for ${limit} “${businessType}” businesses in ${location}. Lead search is coming in Step 2.`
    )
    toast.info("Lead search is coming in Step 2", {
      description: "Your search form is ready. Results will appear here once search launches.",
    })
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
      <div className="flex flex-wrap items-center justify-between gap-2 border-b px-5 py-4">
        <div>
          <h2 className="text-sm font-medium">Search criteria</h2>
          <p className="text-[13px] text-muted-foreground">
            Describe the businesses you want to reach.
          </p>
        </div>
        <Badge variant="secondary" className="font-normal">
          Coming in Step 2
        </Badge>
      </div>

      <div className="grid gap-5 p-5 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_10rem]">
        <FormField id="businessType" label="Business type" error={errors.businessType}>
          <IconInput icon={Building2}>
            <Input
              {...fieldA11y("businessType", errors.businessType)}
              name="businessType"
              placeholder="e.g. Mobile Detailing"
              autoComplete="off"
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
              placeholder="e.g. Florida"
              autoComplete="off"
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
              step={10}
              defaultValue={100}
              onChange={() => clear("limit")}
              className="h-10 pl-9 tabular-nums"
            />
          </IconInput>
        </FormField>
      </div>

      <div className="px-5">
        <FormAlert variant="success" message={notice} className="mb-5 border-primary/20 bg-primary/5 text-primary" />
      </div>

      <div className="flex flex-col-reverse gap-3 border-t bg-muted/30 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">
          Results include website, email, and an opportunity score for each business.
        </p>
        <Button type="submit" className="h-10 sm:h-9">
          <Search /> Find Leads
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
