import { Mail, Search, Sparkles } from "lucide-react"
import { Logo } from "@/components/brand/logo"
import { FadeIn } from "@/components/shared/motion"
import { siteConfig } from "@/config/site"

const benefits = [
  {
    icon: Search,
    title: "Find better leads",
    description: "Discover businesses that match your ideal customer profile.",
  },
  {
    icon: Sparkles,
    title: "Analyze business opportunities",
    description: "Score every lead so you know exactly where to focus.",
  },
  {
    icon: Mail,
    title: "Generate personalized outreach",
    description: "Write emails that reference what each business actually does.",
  },
]

const previewRows = [
  { name: "Harbor Auto Spa", score: 92, width: "w-24" },
  { name: "Coastal Detailing Co.", score: 84, width: "w-32" },
  { name: "Prime Shine Mobile", score: 71, width: "w-28" },
]

/** Left-hand brand panel on desktop auth pages. */
export function AuthShowcase() {
  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-sidebar px-10 py-10 text-sidebar-foreground xl:px-14">
      {/* Fine grid texture, fading out toward the bottom */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.35] [mask-image:linear-gradient(to_bottom,black,transparent_75%)]"
        style={{
          backgroundImage:
            "linear-gradient(to right, var(--color-sidebar-border) 1px, transparent 1px), linear-gradient(to bottom, var(--color-sidebar-border) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[36rem] -translate-x-1/2 rounded-full bg-sidebar-primary/10 blur-3xl"
      />

      <Logo textClassName="text-sidebar-accent-foreground" className="relative" />

      <div className="relative mt-auto max-w-md">
        <FadeIn>
          <h2 className="text-[28px] leading-[1.15] font-semibold tracking-tight text-balance text-sidebar-accent-foreground">
            Lead intelligence for teams that sell with precision.
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-sidebar-muted">
            {siteConfig.description}
          </p>
        </FadeIn>

        <FadeIn delay={0.08}>
          <ul className="mt-8 space-y-4">
            {benefits.map(({ icon: Icon, title, description }) => (
              <li key={title} className="flex gap-3">
                <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-md border border-sidebar-border bg-sidebar-accent text-sidebar-primary">
                  <Icon className="size-3.5" aria-hidden />
                </span>
                <div>
                  <p className="text-sm font-medium text-sidebar-accent-foreground">{title}</p>
                  <p className="text-[13px] text-sidebar-muted">{description}</p>
                </div>
              </li>
            ))}
          </ul>
        </FadeIn>
      </div>

      {/* Product preview — decorative */}
      <FadeIn delay={0.16} y={10} className="relative mt-10" aria-hidden>
        <div className="rounded-lg border border-sidebar-border bg-sidebar-accent/60 p-4 shadow-2xl shadow-black/20">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-medium text-sidebar-accent-foreground">
              Top opportunities
            </span>
            <span className="rounded-full border border-sidebar-border px-2 py-0.5 text-[10px] text-sidebar-muted">
              Preview
            </span>
          </div>
          <div className="space-y-2">
            {previewRows.map((row) => (
              <div
                key={row.name}
                className="flex items-center gap-3 rounded-md border border-sidebar-border/60 bg-sidebar px-3 py-2"
              >
                <span className="size-6 shrink-0 rounded bg-sidebar-accent" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs text-sidebar-accent-foreground">{row.name}</p>
                  <span className={`mt-1 block h-1 rounded-full bg-sidebar-border ${row.width}`} />
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-14 overflow-hidden rounded-full bg-sidebar-border">
                    <span
                      className="block h-full rounded-full bg-sidebar-primary"
                      style={{ width: `${row.score}%` }}
                    />
                  </span>
                  <span className="w-5 text-right font-mono text-[11px] text-sidebar-foreground tabular-nums">
                    {row.score}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </FadeIn>
    </div>
  )
}
