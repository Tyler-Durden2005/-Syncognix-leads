import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

type EmptyStateProps = {
  icon: LucideIcon
  title: string
  description: string
  action?: React.ReactNode
  className?: string
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center px-6 py-12 text-center",
        className
      )}
    >
      <div className="relative mb-4">
        <div
          aria-hidden
          className="absolute -inset-3 rounded-full bg-[radial-gradient(closest-side,var(--color-muted),transparent)]"
        />
        <div className="relative grid size-11 place-items-center rounded-lg border bg-card shadow-xs">
          <Icon className="size-5 text-muted-foreground" strokeWidth={1.75} />
        </div>
      </div>
      <h3 className="text-sm font-medium text-foreground">{title}</h3>
      <p className="mt-1 max-w-xs text-sm text-pretty text-muted-foreground">
        {description}
      </p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
