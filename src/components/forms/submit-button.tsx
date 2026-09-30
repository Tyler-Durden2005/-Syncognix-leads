"use client"

import { useFormStatus } from "react-dom"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

type SubmitButtonProps = React.ComponentProps<typeof Button> & {
  pendingLabel?: string
  /** Force the pending state (e.g. when not rendered inside a <form>). */
  pending?: boolean
}

export function SubmitButton({
  children,
  pendingLabel,
  pending: pendingProp,
  disabled,
  ...props
}: SubmitButtonProps) {
  const status = useFormStatus()
  const pending = pendingProp ?? status.pending

  return (
    <Button type="submit" disabled={pending || disabled} aria-busy={pending} {...props}>
      {pending && <Loader2 className="animate-spin" aria-hidden />}
      {pending ? (pendingLabel ?? children) : children}
    </Button>
  )
}
