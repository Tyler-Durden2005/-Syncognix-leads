import type { LucideIcon } from "lucide-react"
import { Minus } from "lucide-react"

type MetricCardProps = {
  title: string
  value: number
  icon: LucideIcon
  hint?: string
}

const numberFormat = new Intl.NumberFormat("en-US")

export function MetricCard({ title, value, icon: Icon, hint = "No data yet" }: MetricCardProps) {
  return (
    <div className="group relative h-full rounded-lg border bg-card p-5 shadow-xs transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-px hover:border-foreground/15 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[13px] font-medium text-muted-foreground">{title}</p>
        <span className="grid size-8 place-items-center rounded-md border bg-muted/50 text-muted-foreground transition-colors duration-200 group-hover:text-primary">
          <Icon className="size-4" strokeWidth={1.85} aria-hidden />
        </span>
      </div>
      <p className="mt-3 text-[28px] leading-none font-semibold tracking-tight tabular-nums">
        {numberFormat.format(value)}
      </p>
      <div className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
        <span className="grid size-4 place-items-center rounded-full bg-muted">
          <Minus className="size-2.5" aria-hidden />
        </span>
        {hint}
      </div>
    </div>
  )
}
