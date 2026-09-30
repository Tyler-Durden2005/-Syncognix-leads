import { brand, brandMark } from "@/config/brand"
import { cn } from "@/lib/utils"

const SIZES = {
  sm: { tile: "size-6 rounded-[5px]", text: "text-sm" },
  md: { tile: "size-7 rounded-md", text: "text-[15px]" },
  lg: { tile: "size-10 rounded-[9px]", text: "text-lg" },
} as const

type LogoSize = keyof typeof SIZES

/**
 * The SL monogram on a primary-colored tile. Decorative by default; pass
 * `label` when it is shown without the brand name next to it.
 */
export function LogoMark({
  size = "md",
  label,
  className,
}: {
  size?: LogoSize
  label?: string
  className?: string
}) {
  return (
    <span
      {...(label ? { role: "img", "aria-label": label } : { "aria-hidden": true })}
      className={cn(
        "grid shrink-0 place-items-center bg-primary text-primary-foreground ring-1 ring-black/5 ring-inset dark:ring-white/10",
        SIZES[size].tile,
        className
      )}
    >
      <svg
        viewBox={brandMark.viewBox}
        fill="none"
        stroke="currentColor"
        strokeWidth={brandMark.strokeWidth}
        strokeLinejoin="round"
        className="size-full"
      >
        {brandMark.paths.map((d) => (
          <path key={d} d={d} />
        ))}
      </svg>
    </span>
  )
}

/**
 * Brand lockup: [SL] Syncognix Leads. `compact` shows only the mark (with an
 * accessible name), e.g. for collapsed sidebars.
 */
export function Logo({
  compact = false,
  size = "md",
  className,
  textClassName,
}: {
  compact?: boolean
  size?: LogoSize
  className?: string
  textClassName?: string
}) {
  if (compact) return <LogoMark size={size} label={brand.name} className={className} />

  const [company, ...rest] = brand.name.split(" ")
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <LogoMark size={size} />
      <span
        className={cn("font-semibold tracking-tight whitespace-nowrap", SIZES[size].text, textClassName)}
      >
        {company}
        {rest.length > 0 && <span className="font-normal opacity-60"> {rest.join(" ")}</span>}
      </span>
    </span>
  )
}
