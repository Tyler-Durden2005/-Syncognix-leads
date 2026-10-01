"use client"

import { memo, useCallback, useMemo, useState } from "react"
import { createPortal } from "react-dom"
import Link from "next/link"
import { AnimatePresence } from "motion/react"
import * as m from "motion/react-m"
import {
  BookmarkCheck,
  BookmarkPlus,
  Eye,
  Loader2,
  Search,
  SearchX,
  TriangleAlert,
  X,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  LocationText,
  PhoneLink,
  WebsiteLink,
  cityState,
} from "@/components/leads/business-cells"
import {
  BusinessDetailsSheet,
  type BusinessDetails,
} from "@/components/leads/business-details-sheet"
import { EmptyState } from "@/components/shared/empty-state"
import { lowerFirst } from "@/lib/format"
import { cn } from "@/lib/utils"
import type {
  BusinessSearchResult,
  BusinessSearchSuccessResponse,
  CategoryOption,
} from "@/types/business"

type Presence = "any" | "has" | "missing"
type SortKey = "relevance" | "name" | "website" | "phone"

const SORT_LABELS: Record<SortKey, string> = {
  relevance: "Best match",
  name: "Business name A–Z",
  website: "Website first",
  phone: "Phone first",
}

const SOURCE_LABEL = "OpenStreetMap"
const nameCollator = new Intl.Collator("en-US", { sensitivity: "base", numeric: true })

function matchesPresence(value: string | null, filter: Presence) {
  if (filter === "has") return Boolean(value)
  if (filter === "missing") return !value
  return true
}

/** "Dallas, Texas", or "New York, New York 10001" for ZIP searches. */
function searchAreaLabel(data: BusinessSearchSuccessResponse) {
  const { searchLocation, query } = data
  const area = cityState(searchLocation.city, searchLocation.state)
  if (!area) return query.location
  const zip = /^\d{5}/.exec(query.location.trim())?.[0]
  return zip ? `${area} ${zip}` : area
}

function toDetails(business: BusinessSearchResult, categoryLabel: string): BusinessDetails {
  return {
    name: business.name,
    categoryLabel,
    website: business.website,
    phone: business.phone,
    address: business.address,
    street: business.street,
    city: business.city,
    state: business.state,
    postcode: business.postcode,
    latitude: business.latitude,
    longitude: business.longitude,
    osmId: business.osmId,
    osmType: business.osmType,
    source: SOURCE_LABEL,
  }
}

export function ResultsView({
  data,
  categories,
  savedIds,
  onSave,
}: {
  data: BusinessSearchSuccessResponse
  categories: CategoryOption[]
  savedIds: ReadonlySet<string>
  onSave: (businesses: BusinessSearchResult[]) => Promise<boolean>
}) {
  const { businesses, meta } = data
  const [nameQuery, setNameQuery] = useState("")
  const [website, setWebsite] = useState<Presence>("any")
  const [phone, setPhone] = useState<Presence>("any")
  const [sort, setSort] = useState<SortKey>("relevance")
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set())
  const [saving, setSaving] = useState<"selected" | "all" | "single" | null>(null)
  const [viewing, setViewing] = useState<BusinessSearchResult | null>(null)

  const categoryLabels = useMemo(
    () => new Map(categories.map((c) => [c.id, c.label])),
    [categories]
  )
  const labelFor = useCallback(
    (id: string) => categoryLabels.get(id) ?? id,
    [categoryLabels]
  )
  const category = categories.find((c) => c.id === data.query.normalizedBusinessType)

  const visible = useMemo(() => {
    const query = nameQuery.trim().toLowerCase()
    const list = businesses.filter(
      (b) =>
        (!query || b.name.toLowerCase().includes(query)) &&
        matchesPresence(b.website, website) &&
        matchesPresence(b.phone, phone)
    )
    if (sort === "relevance") return list
    // Array.prototype.sort is stable, so ties keep the API's best-match order.
    return [...list].sort((a, b) => {
      if (sort === "name") return nameCollator.compare(a.name, b.name)
      const key = sort === "website" ? "website" : "phone"
      return Number(Boolean(b[key])) - Number(Boolean(a[key]))
    })
  }, [businesses, nameQuery, website, phone, sort])

  const filtersActive = nameQuery.trim() !== "" || website !== "any" || phone !== "any"
  const visibleSelected = visible.filter((b) => selected.has(b.osmId)).length
  const allVisibleSelected = visible.length > 0 && visibleSelected === visible.length
  const unsavedCount = businesses.filter((b) => !savedIds.has(b.osmId)).length

  const toggle = useCallback((osmId: string, checked: boolean) => {
    setSelected((current) => {
      const next = new Set(current)
      if (checked) next.add(osmId)
      else next.delete(osmId)
      return next
    })
  }, [])

  function toggleAllVisible(checked: boolean) {
    setSelected((current) => {
      const next = new Set(current)
      for (const b of visible) {
        if (checked) next.add(b.osmId)
        else next.delete(b.osmId)
      }
      return next
    })
  }

  function resetFilters() {
    setNameQuery("")
    setWebsite("any")
    setPhone("any")
  }

  async function save(kind: "selected" | "all" | "single", list: BusinessSearchResult[]) {
    if (saving || list.length === 0) return
    setSaving(kind)
    const ok = await onSave(list)
    setSaving(null)
    if (ok && kind === "selected") setSelected(new Set())
    if (ok && kind === "single") {
      setSelected((current) => {
        const next = new Set(current)
        list.forEach((b) => next.delete(b.osmId))
        return next
      })
    }
  }

  const view = useCallback((business: BusinessSearchResult) => setViewing(business), [])

  if (businesses.length === 0) {
    return (
      <>
        {meta.notice && <Notice text={meta.notice} />}
        <EmptyState
          icon={SearchX}
          title="No matching businesses were found in this area."
          description={`OpenStreetMap has no ${category ? lowerFirst(category.plural) : "matching businesses"} listed within ${Math.round(meta.radiusMeters / 1000)} km. Try a nearby larger city or a related business type.`}
          className="py-16"
        />
      </>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col gap-3 border-b px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-base font-semibold tracking-tight tabular-nums">
            {businesses.length} {businesses.length === 1 ? "business" : "businesses"} found
          </h2>
          <p className="truncate text-sm text-muted-foreground">
            {category?.plural ?? "Businesses"} near {searchAreaLabel(data)}
          </p>
          <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span>Search radius: {Math.round(meta.radiusMeters / 1000)} km</span>
            <span aria-hidden className="text-border">|</span>
            <span>Source: {SOURCE_LABEL}</span>
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => save("all", businesses)}
          disabled={saving !== null || unsavedCount === 0}
          className="shrink-0"
        >
          {saving === "all" ? (
            <Loader2 className="animate-spin" aria-hidden />
          ) : unsavedCount === 0 ? (
            <BookmarkCheck />
          ) : (
            <BookmarkPlus />
          )}
          {saving === "all"
            ? "Saving..."
            : unsavedCount === 0
              ? "All saved"
              : `Save All (${businesses.length})`}
        </Button>
      </div>

      {meta.notice && <Notice text={meta.notice} />}

      {/* Filters */}
      <div className="flex flex-col gap-2.5 border-b bg-muted/20 px-5 py-3 md:flex-row md:items-center">
        <div className="relative md:max-w-xs md:flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input
            type="search"
            value={nameQuery}
            onChange={(e) => setNameQuery(e.target.value)}
            placeholder="Search business name…"
            aria-label="Search business name"
            className="h-9 bg-background pl-9"
          />
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap md:ml-auto">
          <PresenceSelect label="Website" value={website} onChange={setWebsite} />
          <PresenceSelect label="Phone" value={phone} onChange={setPhone} />
          <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
            <SelectTrigger aria-label="Sort results" className="col-span-2 w-full bg-background sm:w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="end">
              {(Object.keys(SORT_LABELS) as SortKey[]).map((key) => (
                <SelectItem key={key} value={key}>
                  {SORT_LABELS[key]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {visible.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="No businesses match these filters."
          description="Try clearing a filter to see more of your results."
          className="py-14"
          action={
            <Button variant="outline" size="sm" onClick={resetFilters}>
              Clear filters
            </Button>
          }
        />
      ) : (
        <>
          {/* Select-all row (shared by table and cards) */}
          <div className="flex items-center gap-3 border-b px-5 py-2.5 text-[13px] text-muted-foreground md:hidden">
            <Checkbox
              id="select-all-mobile"
              checked={allVisibleSelected ? true : visibleSelected > 0 ? "indeterminate" : false}
              onCheckedChange={(c) => toggleAllVisible(c === true)}
            />
            <label htmlFor="select-all-mobile" className="cursor-pointer">
              Select all{filtersActive ? " shown" : ""} ({visible.length})
            </label>
          </div>

          {/* Desktop / tablet table */}
          <div className="hidden md:block">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="h-10 w-10 pr-0 pl-5">
                    <Checkbox
                      aria-label={`Select all${filtersActive ? " shown" : ""} businesses`}
                      checked={allVisibleSelected ? true : visibleSelected > 0 ? "indeterminate" : false}
                      onCheckedChange={(c) => toggleAllVisible(c === true)}
                    />
                  </TableHead>
                  {["Business", "Website", "Phone", "Address", "Category", "Source"].map((column) => (
                    <TableHead
                      key={column}
                      className="h-10 px-4 text-xs font-medium whitespace-nowrap text-muted-foreground"
                    >
                      {column}
                    </TableHead>
                  ))}
                  <TableHead className="h-10 px-4 pr-5 text-right text-xs font-medium text-muted-foreground">
                    <span className="sr-only">Action</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visible.map((business, index) => (
                  <ResultRow
                    key={business.osmId}
                    business={business}
                    index={index}
                    categoryLabel={labelFor(business.category)}
                    checked={selected.has(business.osmId)}
                    saved={savedIds.has(business.osmId)}
                    onToggle={toggle}
                    onView={view}
                  />
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile cards */}
          <ul className="divide-y md:hidden">
            {visible.map((business, index) => (
              <ResultCard
                key={business.osmId}
                business={business}
                index={index}
                checked={selected.has(business.osmId)}
                saved={savedIds.has(business.osmId)}
                onToggle={toggle}
                onView={view}
              />
            ))}
          </ul>
        </>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 border-t px-5 py-3 text-xs text-muted-foreground">
        <span className="tabular-nums">
          {filtersActive
            ? `Showing ${visible.length} of ${businesses.length}`
            : meta.resultsBeforeLimit > businesses.length
              ? `Showing the ${businesses.length} closest of ${meta.resultsBeforeLimit} found`
              : `Showing all ${businesses.length}`}
        </span>
        <span>Data © OpenStreetMap contributors</span>
      </div>

      <SelectionBar
        count={selected.size}
        saving={saving === "selected"}
        disabled={saving !== null}
        onClear={() => setSelected(new Set())}
        onSave={() => save("selected", businesses.filter((b) => selected.has(b.osmId)))}
      />

      <BusinessDetailsSheet
        business={viewing ? toDetails(viewing, labelFor(viewing.category)) : null}
        onOpenChange={(open) => !open && setViewing(null)}
        footer={
          viewing &&
          (savedIds.has(viewing.osmId) ? (
            <Button variant="outline" asChild>
              <Link href="/leads">
                <BookmarkCheck /> Saved — View Leads
              </Link>
            </Button>
          ) : (
            <Button onClick={() => save("single", [viewing])} disabled={saving !== null}>
              {saving === "single" ? <Loader2 className="animate-spin" aria-hidden /> : <BookmarkPlus />}
              {saving === "single" ? "Saving..." : "Save Lead"}
            </Button>
          ))
        }
      />
    </div>
  )
}

function Notice({ text }: { text: string }) {
  return (
    <div role="status" className="flex items-start gap-2.5 border-b bg-warning/10 px-5 py-3 text-sm">
      <TriangleAlert className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden />
      <p className="leading-snug">{text}</p>
    </div>
  )
}

function PresenceSelect({
  label,
  value,
  onChange,
}: {
  label: "Website" | "Phone"
  value: Presence
  onChange: (value: Presence) => void
}) {
  const lower = label.toLowerCase()
  return (
    <Select value={value} onValueChange={(v) => onChange(v as Presence)}>
      <SelectTrigger
        aria-label={`Filter by ${lower}`}
        className={cn("w-full bg-background sm:w-40", value !== "any" && "border-primary/40 text-foreground")}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="any">Any {lower}</SelectItem>
        <SelectItem value="has">Has {lower}</SelectItem>
        <SelectItem value="missing">Missing {lower}</SelectItem>
      </SelectContent>
    </Select>
  )
}

/** Small entrance stagger, capped so long lists don't wait. */
function rowEnter(index: number): React.CSSProperties {
  return { animationDelay: `${Math.min(index, 12) * 18}ms` }
}

const ROW_ENTER =
  "animate-in fade-in slide-in-from-bottom-1 fill-mode-both duration-200 ease-out"

type RowProps = {
  business: BusinessSearchResult
  index: number
  checked: boolean
  saved: boolean
  onToggle: (osmId: string, checked: boolean) => void
  onView: (business: BusinessSearchResult) => void
}

function SavedBadge() {
  return (
    <Badge variant="outline" className="gap-1 border-success/30 bg-success/8 font-normal text-success">
      <BookmarkCheck aria-hidden /> Saved
    </Badge>
  )
}

const ResultRow = memo(function ResultRow({
  business,
  index,
  categoryLabel,
  checked,
  saved,
  onToggle,
  onView,
}: RowProps & { categoryLabel: string }) {
  const place = cityState(business.city, business.state)
  return (
    <TableRow
      data-state={checked ? "selected" : undefined}
      className={ROW_ENTER}
      style={rowEnter(index)}
    >
      <TableCell className="w-10 pr-0 pl-5 align-top">
        <Checkbox
          className="mt-0.5"
          aria-label={`Select ${business.name}`}
          checked={checked}
          onCheckedChange={(c) => onToggle(business.osmId, c === true)}
        />
      </TableCell>
      <TableCell className="px-4 py-3 align-top">
        <div className="flex min-w-44 items-center gap-2">
          <span className="font-medium text-foreground">{business.name}</span>
          {saved && <SavedBadge />}
        </div>
        {place && <div className="mt-0.5 text-xs text-muted-foreground">{place}</div>}
      </TableCell>
      <TableCell className="px-4 py-3 align-top">
        <WebsiteLink url={business.website} />
      </TableCell>
      <TableCell className="px-4 py-3 align-top">
        <PhoneLink phone={business.phone} />
      </TableCell>
      <TableCell className="px-4 py-3 align-top whitespace-normal">
        <LocationText address={business.address} city={null} state={null} />
      </TableCell>
      <TableCell className="px-4 py-3 align-top">
        <Badge variant="secondary" className="font-normal">
          {categoryLabel}
        </Badge>
      </TableCell>
      <TableCell className="px-4 py-3 align-top text-muted-foreground">{SOURCE_LABEL}</TableCell>
      <TableCell className="px-4 py-2 pr-5 text-right align-top">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onView(business)}
          aria-label={`View details for ${business.name}`}
        >
          <Eye /> View
        </Button>
      </TableCell>
    </TableRow>
  )
})

const ResultCard = memo(function ResultCard({
  business,
  index,
  checked,
  saved,
  onToggle,
  onView,
}: RowProps) {
  const checkboxId = `select-${business.osmId}`
  const place = cityState(business.city, business.state)
  return (
    <li
      className={cn("flex gap-3 px-5 py-4", ROW_ENTER, checked && "bg-muted/50")}
      style={rowEnter(index)}
    >
      <Checkbox
        id={checkboxId}
        className="mt-1"
        checked={checked}
        onCheckedChange={(c) => onToggle(business.osmId, c === true)}
      />
      <div className="min-w-0 flex-1 space-y-2">
        <div>
          <label htmlFor={checkboxId} className="block cursor-pointer font-medium leading-snug">
            {business.name}
          </label>
          <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            {place ?? "Location not available"}
            {saved && <SavedBadge />}
          </div>
        </div>
        <dl className="grid grid-cols-[4.5rem_minmax(0,1fr)] gap-x-3 gap-y-1.5 text-[13px]">
          <dt className="text-muted-foreground">Website</dt>
          <dd className="min-w-0">
            <WebsiteLink url={business.website} className="max-w-full" />
          </dd>
          <dt className="text-muted-foreground">Phone</dt>
          <dd>
            <PhoneLink phone={business.phone} />
          </dd>
        </dl>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="-mr-2 shrink-0"
        onClick={() => onView(business)}
        aria-label={`View details for ${business.name}`}
      >
        <Eye />
      </Button>
    </li>
  )
})

function SelectionBar({
  count,
  saving,
  disabled,
  onClear,
  onSave,
}: {
  count: number
  saving: boolean
  disabled: boolean
  onClear: () => void
  onSave: () => void
}) {
  // Portaled: an animated ancestor's transform would otherwise pin this
  // "fixed" bar to the results card instead of the viewport.
  if (typeof document === "undefined") return null
  return createPortal(
    <AnimatePresence>
      {count > 0 && (
        <m.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="pointer-events-none fixed inset-x-0 bottom-4 z-40 flex justify-center px-4 lg:pl-64"
        >
          <div
            role="region"
            aria-label="Selected businesses"
            className="pointer-events-auto flex w-full max-w-md items-center gap-2 rounded-xl border bg-popover/95 py-2 pr-2 pl-4 text-popover-foreground shadow-lg backdrop-blur"
          >
            <span className="text-sm font-medium tabular-nums" aria-live="polite">
              {count} selected
            </span>
            <Button variant="ghost" size="sm" onClick={onClear} disabled={disabled} className="ml-auto text-muted-foreground">
              <X /> Clear
            </Button>
            <Button size="sm" onClick={onSave} disabled={disabled}>
              {saving ? <Loader2 className="animate-spin" aria-hidden /> : <BookmarkPlus />}
              {saving ? "Saving..." : "Save Leads"}
            </Button>
          </div>
        </m.div>
      )}
    </AnimatePresence>,
    document.body
  )
}
