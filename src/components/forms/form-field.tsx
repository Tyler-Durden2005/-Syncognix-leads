"use client"

import { AnimatePresence } from "motion/react"
import * as m from "motion/react-m"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

type FormFieldProps = {
  id: string
  label: string
  error?: string
  hint?: React.ReactNode
  labelAction?: React.ReactNode
  className?: string
  children: React.ReactNode
}

/**
 * Label + control + animated error message. The control should set
 * `aria-describedby={`${id}-error`}` and `aria-invalid` when `error` is set.
 */
export function FormField({
  id,
  label,
  error,
  hint,
  labelAction,
  className,
  children,
}: FormFieldProps) {
  return (
    <div className={cn("grid content-start gap-2", className)}>
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor={id}>{label}</Label>
        {labelAction}
      </div>
      {children}
      <AnimatePresence initial={false} mode="popLayout">
        {error ? (
          <m.p
            key={error}
            id={`${id}-error`}
            role="alert"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -2 }}
            transition={{ duration: 0.16 }}
            className="text-[13px] leading-snug text-destructive"
          >
            {error}
          </m.p>
        ) : hint ? (
          <div className="text-[13px] leading-snug text-muted-foreground">{hint}</div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}

/** Accessibility props for a control rendered inside <FormField>. */
export function fieldA11y(id: string, error?: string) {
  return {
    id,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error ? `${id}-error` : undefined,
  } as const
}
