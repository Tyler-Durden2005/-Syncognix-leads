import Link from "next/link"
import { ArrowUpRight, type LucideIcon } from "lucide-react"

type QuickActionCardProps = {
  href: string
  title: string
  description: string
  icon: LucideIcon
}

export function QuickActionCard({ href, title, description, icon: Icon }: QuickActionCardProps) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-md border bg-card p-3 transition-[border-color,background-color,box-shadow] duration-150 outline-none hover:border-foreground/15 hover:bg-muted/40 focus-visible:ring-[3px] focus-visible:ring-ring/50"
    >
      <span className="grid size-9 shrink-0 place-items-center rounded-md bg-primary/8 text-primary">
        <Icon className="size-4" strokeWidth={1.85} aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium">{title}</span>
        <span className="block truncate text-xs text-muted-foreground">{description}</span>
      </span>
      <ArrowUpRight
        className="size-4 shrink-0 text-muted-foreground transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-foreground"
        aria-hidden
      />
    </Link>
  )
}
