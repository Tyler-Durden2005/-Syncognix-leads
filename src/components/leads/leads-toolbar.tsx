"use client"

import { ArrowUpDown, Download, ListFilter, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

/** Toolbar controls are visible but inactive until leads exist (Step 2+). */
export function LeadsToolbar() {
  return (
    <div className="flex flex-col gap-3 border-b px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
      <div className="relative w-full sm:max-w-xs">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <Input
          type="search"
          placeholder="Search leads…"
          aria-label="Search leads"
          disabled
          className="h-9 pl-9"
        />
      </div>
      <div className="flex items-center gap-2">
        <ToolbarButton icon={ListFilter} label="Filters" />
        <ToolbarButton icon={ArrowUpDown} label="Sort" />
        <ToolbarButton icon={Download} label="Export" />
      </div>
    </div>
  )
}

function ToolbarButton({
  icon: Icon,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {/* aria-disabled keeps the button focusable so the tooltip is reachable */}
        <Button
          variant="outline"
          size="sm"
          aria-disabled="true"
          onClick={(e) => e.preventDefault()}
          className="flex-1 cursor-not-allowed text-muted-foreground opacity-70 hover:bg-background hover:text-muted-foreground active:scale-100 sm:flex-none"
        >
          <Icon className="size-4" />
          {label}
        </Button>
      </TooltipTrigger>
      <TooltipContent>Available once you have leads</TooltipContent>
    </Tooltip>
  )
}
