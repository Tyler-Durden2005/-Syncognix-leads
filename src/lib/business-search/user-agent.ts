import { DEFAULT_OSM_USER_AGENT } from "./constants"

/**
 * Identifies this app to OpenStreetMap services, as their usage policies
 * require (Overpass rejects requests without one). NOMINATIM_USER_AGENT
 * overrides the app identity; OSM_CONTACT_EMAIL lets operators reach us.
 */
export function getOsmUserAgent() {
  const base = process.env.NOMINATIM_USER_AGENT?.trim() || DEFAULT_OSM_USER_AGENT
  const contact = process.env.OSM_CONTACT_EMAIL?.trim()
  return contact ? `${base} (${contact})` : base
}

/** Public app URL, sent as Referer when configured and not a local address. */
export function getOsmReferer() {
  const site = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (!site) return null
  try {
    const url = new URL(site)
    if (url.hostname === "localhost" || url.hostname === "127.0.0.1") return null
    return url.origin
  } catch {
    return null
  }
}
