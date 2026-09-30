/** Product identity. Import from here instead of hardcoding the name. */
export const brand = {
  name: "Syncognix Leads",
  /** Monogram shown in the logo mark. */
  shortName: "SL",
  description:
    "AI-powered lead intelligence and outreach platform for discovering and qualifying business prospects.",
  tagline: "Find better leads. Identify opportunities. Personalize outreach.",
  /** Identity sent to external services (e.g. OpenStreetMap User-Agent). */
  userAgentName: "Syncognix-Leads",
  /** Primary brand color as hex (the theme's --primary), for generated icons. */
  color: "#4455d0",
} as const

/**
 * The SL monogram, drawn as two strokes on a 24×24 grid. Shared by the
 * in-app logo and the generated favicons so they can never drift apart.
 */
export const brandMark = {
  viewBox: "0 0 24 24",
  strokeWidth: 2.3,
  paths: [
    // S: squared geometric form with one consistent 2.3 corner radius
    "M11.8 6.5H8A2.3 2.3 0 0 0 5.7 8.8V9.7A2.3 2.3 0 0 0 8 12H9.5A2.3 2.3 0 0 1 11.8 14.3V15.2A2.3 2.3 0 0 1 9.5 17.5H5.7",
    // L: same stroke and corner radius, sharing the S's baseline
    "M14.7 6.5V15.2A2.3 2.3 0 0 0 17 17.5H19.3",
  ],
} as const
