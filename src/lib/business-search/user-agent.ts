import { siteConfig } from "@/config/site"

/**
 * Identifies this app to OpenStreetMap services, as their usage policies
 * require. Set OSM_CONTACT_EMAIL so operators can reach us about our traffic.
 */
export function getOsmUserAgent() {
  const app = siteConfig.name.replace(/\s+/g, "")
  const contact = process.env.OSM_CONTACT_EMAIL?.trim()
  return `${app}/0.1 (business search${contact ? `; ${contact}` : ""})`
}
