import { ExternalLink, Phone } from "lucide-react"
import { cn } from "@/lib/utils"

/** Shown wherever a value is missing — never "null"/"undefined". */
export function Missing({ className }: { className?: string }) {
  return <span className={cn("text-muted-foreground/70", className)}>Not available</span>
}

/** "https://www.abcplumbing.com/contact" → "abcplumbing.com". */
export function displayDomain(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "")
  } catch {
    return url
  }
}

export function WebsiteLink({ url, className }: { url: string | null; className?: string }) {
  if (!url) return <Missing />
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      title={url}
      className={cn(
        "inline-flex max-w-52 items-center gap-1.5 rounded-sm text-primary underline-offset-4 outline-none hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/50",
        className
      )}
    >
      <span className="truncate">{displayDomain(url)}</span>
      <ExternalLink className="size-3.5 shrink-0" aria-hidden />
      <span className="sr-only">(opens in a new tab)</span>
    </a>
  )
}

export function PhoneLink({ phone }: { phone: string | null }) {
  if (!phone) return <Missing />
  const dial = phone.replace(/[^\d+]/g, "")
  if (dial.replace(/\D/g, "").length < 7) return <span className="tabular-nums">{phone}</span>
  return (
    <a
      href={`tel:${dial}`}
      className="inline-flex items-center gap-1.5 rounded-sm whitespace-nowrap tabular-nums outline-none hover:text-primary focus-visible:ring-[3px] focus-visible:ring-ring/50"
    >
      <Phone className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
      {phone}
    </a>
  )
}

/** "City, State" from whatever parts are known, or null. */
export function cityState(city: string | null, state: string | null) {
  return [city, state].filter(Boolean).join(", ") || null
}

/** Full street address when known, otherwise "City, State". Clamped to two lines. */
export function LocationText({
  address,
  city,
  state,
}: {
  address: string | null
  city: string | null
  state: string | null
}) {
  const text = address ?? cityState(city, state)
  if (!text) return <Missing />
  return (
    <span title={text} className="line-clamp-2 min-w-40 max-w-64 text-pretty">
      {text}
    </span>
  )
}
