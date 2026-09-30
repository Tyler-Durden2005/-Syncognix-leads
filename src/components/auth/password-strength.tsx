import { Check } from "lucide-react"
import { passwordRules } from "@/lib/validation"
import { cn } from "@/lib/utils"

export function PasswordStrength({ value }: { value: string }) {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1.5" aria-label="Password requirements">
      {passwordRules.map((rule) => {
        const met = rule.test(value)
        return (
          <li
            key={rule.id}
            className={cn(
              "flex items-center gap-1.5 text-[12.5px] transition-colors duration-200",
              met ? "text-success" : "text-muted-foreground"
            )}
          >
            <span
              className={cn(
                "grid size-3.5 place-items-center rounded-full border transition-all duration-200",
                met ? "border-success bg-success text-white" : "border-border"
              )}
            >
              <Check
                className={cn("size-2.5 transition-opacity", met ? "opacity-100" : "opacity-0")}
                strokeWidth={3}
                aria-hidden
              />
            </span>
            {rule.label}
            <span className="sr-only">{met ? "(met)" : "(not met)"}</span>
          </li>
        )
      })}
    </ul>
  )
}
