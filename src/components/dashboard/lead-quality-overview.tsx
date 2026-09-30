import { SectionCard } from "@/components/shared/section-card"
import { cn } from "@/lib/utils"

const tiers = [
  { label: "High quality", range: "80–100", dot: "bg-success" },
  { label: "Medium", range: "50–79", dot: "bg-warning" },
  { label: "Low", range: "0–49", dot: "bg-muted-foreground/50" },
]

// Placeholder silhouette of a score distribution; purely decorative.
const ghostBars = [18, 28, 36, 48, 62, 74, 66, 52, 38, 24]

export function LeadQualityOverview() {
  return (
    <SectionCard
      title="Lead quality overview"
      description="Distribution of lead scores across your workspace."
    >
      <div className="grid grid-cols-1 gap-6 md:grid-cols-[minmax(0,1fr)_14rem]">
        <div className="relative">
          <div
            aria-hidden
            className="flex h-40 items-end gap-1.5 border-b border-dashed pb-px sm:gap-2"
          >
            {ghostBars.map((height, i) => (
              <div
                key={i}
                className="flex-1 rounded-t-sm bg-gradient-to-t from-muted to-muted/40"
                style={{ height: `${height}%` }}
              />
            ))}
          </div>
          <div aria-hidden className="mt-2 flex justify-between text-[11px] text-muted-foreground tabular-nums">
            <span>0</span>
            <span>50</span>
            <span>100</span>
          </div>
          <div className="absolute inset-x-0 top-0 flex h-40 items-center justify-center px-6">
            <p className="max-w-xs rounded-md border bg-card/90 px-3 py-2 text-center text-[13px] text-pretty text-muted-foreground shadow-xs backdrop-blur-sm">
              Lead scores will appear after you start analyzing businesses.
            </p>
          </div>
        </div>

        <ul className="space-y-4 self-center">
          {tiers.map((tier) => (
            <li key={tier.label}>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <span className={cn("size-2 rounded-full", tier.dot)} aria-hidden />
                  {tier.label}
                  <span className="text-xs text-muted-foreground">{tier.range}</span>
                </span>
                <span className="font-medium tabular-nums">0</span>
              </div>
              <div className="mt-2 h-1.5 rounded-full bg-muted" aria-hidden />
            </li>
          ))}
        </ul>
      </div>
    </SectionCard>
  )
}
