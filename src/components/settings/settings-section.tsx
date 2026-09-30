type SettingsSectionProps = {
  id: string
  title: string
  description: string
  children: React.ReactNode
}

export function SettingsSection({ id, title, description, children }: SettingsSectionProps) {
  return (
    <section
      aria-labelledby={`${id}-title`}
      className="grid gap-4 border-t pt-8 first:border-t-0 first:pt-0 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-10"
    >
      <div className="space-y-1">
        <h2 id={`${id}-title`} className="text-sm font-medium">
          {title}
        </h2>
        <p className="text-[13px] text-pretty text-muted-foreground">{description}</p>
      </div>
      <div className="min-w-0 overflow-hidden rounded-lg border bg-card shadow-xs">{children}</div>
    </section>
  )
}
