"use client"

import { useState, useTransition } from "react"
import { Eye, Loader2, MoreHorizontal, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { deleteLeadAction } from "@/lib/leads/actions"
import type { Lead } from "@/types"
import { LocationText, PhoneLink, WebsiteLink, cityState } from "./business-cells"
import { BusinessDetailsSheet, type BusinessDetails } from "./business-details-sheet"

export type LeadRow = Lead & { categoryLabel: string }

const COLUMNS = ["Business", "Website", "Phone", "Location", "Category", "Source", "Date Added"]

const dateFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
})

function sourceLabel(source: string | undefined) {
  return !source || source === "openstreetmap" ? "OpenStreetMap" : source
}

function toDetails(lead: LeadRow): BusinessDetails {
  return {
    name: lead.name,
    categoryLabel: lead.categoryLabel,
    website: lead.website,
    phone: lead.phone,
    address: lead.address,
    street: lead.street,
    city: lead.city,
    state: lead.state,
    postcode: lead.postcode,
    latitude: lead.latitude,
    longitude: lead.longitude,
    osmId: lead.osm_id,
    osmType: lead.osm_type,
    source: sourceLabel(lead.source),
    addedAt: lead.created_at,
  }
}

/** Saved leads with view and remove actions. Rows come from the server. */
export function LeadsTable({ leads }: { leads: LeadRow[] }) {
  const [viewing, setViewing] = useState<LeadRow | null>(null)
  const [removing, setRemoving] = useState<LeadRow | null>(null)
  const [pending, startTransition] = useTransition()

  function confirmRemove() {
    const lead = removing
    if (!lead) return
    startTransition(async () => {
      const result = await deleteLeadAction(lead.id).catch(() => null)
      if (!result?.ok) {
        toast.error(result?.message ?? "We couldn't remove this lead. Please try again.")
        return
      }
      setRemoving(null)
      if (viewing?.id === lead.id) setViewing(null)
      toast.success(`Removed ${lead.name} from your saved leads.`)
    })
  }

  const actions = (lead: LeadRow) => (
    // Non-modal so the confirm dialog it opens gets focus cleanly.
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="size-8" aria-label={`Actions for ${lead.name}`}>
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem onSelect={() => setViewing(lead)}>
          <Eye /> View details
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onSelect={() => setRemoving(lead)}>
          <Trash2 /> Remove
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )

  return (
    <>
      <div className="hidden md:block">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow className="hover:bg-transparent">
              {COLUMNS.map((column) => (
                <TableHead
                  key={column}
                  className="h-10 px-4 text-xs font-medium whitespace-nowrap text-muted-foreground first:pl-5"
                >
                  {column}
                </TableHead>
              ))}
              <TableHead className="h-10 w-12 pr-5">
                <span className="sr-only">Action</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads.map((lead) => (
              <TableRow key={lead.id}>
                <TableCell className="px-4 py-3 pl-5 align-top">
                  <button
                    type="button"
                    onClick={() => setViewing(lead)}
                    className="min-w-40 rounded-sm text-left font-medium text-foreground outline-none hover:underline hover:underline-offset-4 focus-visible:ring-[3px] focus-visible:ring-ring/50"
                  >
                    {lead.name}
                  </button>
                </TableCell>
                <TableCell className="px-4 py-3 align-top">
                  <WebsiteLink url={lead.website} />
                </TableCell>
                <TableCell className="px-4 py-3 align-top">
                  <PhoneLink phone={lead.phone} />
                </TableCell>
                <TableCell className="px-4 py-3 align-top whitespace-normal">
                  <LocationText address={null} city={lead.city} state={lead.state} />
                </TableCell>
                <TableCell className="px-4 py-3 align-top">
                  <Badge variant="secondary" className="font-normal">
                    {lead.categoryLabel}
                  </Badge>
                </TableCell>
                <TableCell className="px-4 py-3 align-top text-muted-foreground">
                  {sourceLabel(lead.source)}
                </TableCell>
                <TableCell className="px-4 py-3 align-top whitespace-nowrap text-muted-foreground tabular-nums">
                  {dateFormat.format(new Date(lead.created_at))}
                </TableCell>
                <TableCell className="px-4 py-2 pr-5 text-right align-top">{actions(lead)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ul className="divide-y md:hidden">
        {leads.map((lead) => (
          <li key={lead.id} className="flex gap-3 px-4 py-4">
            <div className="min-w-0 flex-1 space-y-2">
              <div>
                <button
                  type="button"
                  onClick={() => setViewing(lead)}
                  className="rounded-sm text-left font-medium leading-snug outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                >
                  {lead.name}
                </button>
                <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  {cityState(lead.city, lead.state) ?? "Location not available"}
                  <Badge variant="secondary" className="font-normal">
                    {lead.categoryLabel}
                  </Badge>
                </div>
              </div>
              <dl className="grid grid-cols-[4.5rem_minmax(0,1fr)] gap-x-3 gap-y-1.5 text-[13px]">
                <dt className="text-muted-foreground">Website</dt>
                <dd className="min-w-0">
                  <WebsiteLink url={lead.website} className="max-w-full" />
                </dd>
                <dt className="text-muted-foreground">Phone</dt>
                <dd>
                  <PhoneLink phone={lead.phone} />
                </dd>
                <dt className="text-muted-foreground">Added</dt>
                <dd className="text-muted-foreground tabular-nums">
                  {dateFormat.format(new Date(lead.created_at))}
                </dd>
              </dl>
            </div>
            <div className="-mr-1 shrink-0">{actions(lead)}</div>
          </li>
        ))}
      </ul>

      <BusinessDetailsSheet
        business={viewing ? toDetails(viewing) : null}
        onOpenChange={(open) => !open && setViewing(null)}
        footer={
          viewing && (
            <Button variant="outline" onClick={() => setRemoving(viewing)} className="text-destructive hover:text-destructive">
              <Trash2 /> Remove from saved leads
            </Button>
          )
        }
      />

      <AlertDialog open={removing !== null} onOpenChange={(open) => !open && !pending && setRemoving(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove {removing?.name} from your saved leads?</AlertDialogTitle>
            <AlertDialogDescription>
              You can save it again from a future search.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
            <Button variant="destructive" onClick={confirmRemove} disabled={pending}>
              {pending && <Loader2 className="animate-spin" aria-hidden />}
              {pending ? "Removing..." : "Remove"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
