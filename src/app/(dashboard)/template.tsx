/**
 * Re-mounts on every navigation, giving each page a short CSS entrance that
 * doesn't depend on JavaScript having loaded.
 */
export default function DashboardTemplate({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="animate-in fade-in fill-mode-both duration-200 ease-out"
      style={{ "--tw-enter-translate-y": "4px" } as React.CSSProperties}
    >
      {children}
    </div>
  )
}
