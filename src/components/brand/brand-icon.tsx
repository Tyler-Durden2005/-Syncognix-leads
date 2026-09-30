import { brand, brandMark } from "@/config/brand"

/**
 * The SL mark as plain JSX for `next/og` ImageResponse (favicons, app icons).
 * Uses fixed colors because generated images can't read theme CSS variables.
 */
export function BrandIcon({ size, rounded = true }: { size: number; rounded?: boolean }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        background: brand.color,
        borderRadius: rounded ? Math.round(size * 0.23) : 0,
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox={brandMark.viewBox}
        fill="none"
        stroke="#ffffff"
        strokeWidth={brandMark.strokeWidth}
        strokeLinejoin="round"
      >
        {brandMark.paths.map((d) => (
          <path key={d} d={d} />
        ))}
      </svg>
    </div>
  )
}
