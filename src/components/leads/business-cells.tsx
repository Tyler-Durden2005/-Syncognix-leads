import { ExternalLink, Phone } from "lucide-react"

/** Placeholder for a missing value, announced as "Not available". */
export function Missing() {
  return (
    <span className="text-muted-foreground/60" aria-label="Not available">
      —
    </span>
  )
}

function displayHost(url: string) {
  try {
    const { hostname, pathname } = new URL(url)
    const host = hostname.replace(/^www\./, "")
    return pathname && pathname !== "/" ? `${host}${pathname}`.replace(/\/$/, "") : host
  } catch {
    return url
  }
}

export function WebsiteLink({ url }: { url: string | null }) {
  if (!url) return <Missing />
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex max-w-56 items-center gap-1.5 text-primary underline-offset-4 hover:underline"
    >
      <span className="truncate">{displayHost(url)}</span>
      <ExternalLink className="size-3.5 shrink-0" aria-hidden />
      <span className="sr-only">(opens in a new tab)</span>
    </a>
  )
}

export function PhoneLink({ phone }: { phone: string | null }) {
  if (!phone) return <Missing />
  return (
    <a
      href={`tel:${phone.replace(/[^\d+]/g, "")}`}
      className="inline-flex items-center gap-1.5 whitespace-nowrap tabular-nums hover:text-primary"
    >
      <Phone className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
      {phone}
    </a>
  )
}

/** Full street address when known, otherwise "City, State". */
export function LocationText({
  address,
  city,
  state,
}: {
  address: string | null
  city: string | null
  state: string | null
}) {
  const text = address ?? [city, state].filter(Boolean).join(", ")
  if (!text) return <Missing />
  return <span className="line-clamp-2 min-w-40 text-pretty">{text}</span>
}
