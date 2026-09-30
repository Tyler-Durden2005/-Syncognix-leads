import { cn } from "@/lib/utils"
import { siteConfig } from "@/config/site"

export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "grid size-7 shrink-0 place-items-center rounded-md bg-gradient-to-b from-primary to-[oklch(0.44_0.19_272)] text-primary-foreground shadow-xs ring-1 ring-white/10 ring-inset",
        className
      )}
    >
      <svg viewBox="0 0 24 24" fill="none" className="size-4">
        <path
          d="M4 18V7.5l4.5 3.5L12 5l3.5 6L20 7.5V18l-4-2.5L12 19l-4-3.5L4 18Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  )
}

export function Logo({
  className,
  textClassName,
}: {
  className?: string
  textClassName?: string
}) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <LogoMark />
      <span className={cn("text-[15px] font-semibold tracking-tight", textClassName)}>
        {siteConfig.shortName}
        <span className="font-normal opacity-60"> Leads</span>
      </span>
    </span>
  )
}
