"use client"

import { Check, Monitor, Moon, Sun } from "lucide-react"
import { useTheme, type Theme } from "@/lib/theme"
import { cn } from "@/lib/utils"

const options: { value: Theme; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
]

function Preview({ variant }: { variant: Theme }) {
  const half = (dark: boolean) => (
    <div className={cn("flex h-full", dark ? "bg-[#16171b]" : "bg-[#f7f7f8]")}>
      <div className={cn("w-1/4", dark ? "bg-[#0f1013]" : "bg-[#1b1c21]")} />
      <div className="flex-1 space-y-1.5 p-2">
        <div className={cn("h-1.5 w-2/3 rounded-full", dark ? "bg-white/20" : "bg-black/15")} />
        <div className={cn("h-5 rounded-sm", dark ? "bg-white/8" : "bg-white shadow-xs")} />
        <div className={cn("h-5 rounded-sm", dark ? "bg-white/8" : "bg-white shadow-xs")} />
      </div>
    </div>
  )

  if (variant === "system") {
    return (
      <div className="relative h-full">
        {half(false)}
        <div className="absolute inset-0 [clip-path:polygon(100%_0,100%_100%,0_100%)]">
          {half(true)}
        </div>
      </div>
    )
  }
  return half(variant === "dark")
}

export function AppearanceSettings() {
  const { theme, setTheme } = useTheme()

  return (
    <div role="radiogroup" aria-label="Theme" className="grid grid-cols-3 gap-3 p-5">
      {options.map(({ value, label, icon: Icon }) => {
        const selected = theme === value
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => setTheme(value)}
            className={cn(
              "group cursor-pointer rounded-md border p-1.5 text-left transition-[border-color,box-shadow] duration-150 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
              selected ? "border-primary ring-1 ring-primary" : "hover:border-foreground/20"
            )}
          >
            <div aria-hidden className="h-16 overflow-hidden rounded-sm border sm:h-20">
              <Preview variant={value} />
            </div>
            <div className="flex items-center justify-between px-1 pt-2 pb-0.5">
              <span className="flex items-center gap-1.5 text-sm">
                <Icon className="size-3.5 text-muted-foreground" aria-hidden />
                {label}
              </span>
              {selected && <Check className="size-3.5 text-primary" aria-hidden />}
            </div>
          </button>
        )
      })}
    </div>
  )
}
