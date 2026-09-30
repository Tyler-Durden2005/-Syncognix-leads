"use client"

import { AnimatePresence } from "motion/react"
import * as m from "motion/react-m"
import { CircleAlert, CircleCheck } from "lucide-react"
import { cn } from "@/lib/utils"

type FormAlertProps = {
  variant?: "error" | "success"
  message?: string
  className?: string
}

export function FormAlert({ variant = "error", message, className }: FormAlertProps) {
  const Icon = variant === "error" ? CircleAlert : CircleCheck

  return (
    <AnimatePresence initial={false}>
      {message && (
        <m.div
          key={message}
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="overflow-hidden"
        >
          <div
            role={variant === "error" ? "alert" : "status"}
            className={cn(
              "flex items-start gap-2.5 rounded-md border px-3 py-2.5 text-sm",
              variant === "error"
                ? "border-destructive/20 bg-destructive/5 text-destructive"
                : "border-success/25 bg-success/8 text-success",
              className
            )}
          >
            <Icon className="mt-0.5 size-4 shrink-0" aria-hidden />
            <p className="leading-snug">{message}</p>
          </div>
        </m.div>
      )}
    </AnimatePresence>
  )
}
