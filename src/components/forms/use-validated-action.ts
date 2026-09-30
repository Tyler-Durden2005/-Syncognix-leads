"use client"

import { useActionState, useState } from "react"
import type { ActionState } from "@/types"

type Validator = (data: FormData) => Record<string, string> | undefined

const INITIAL: ActionState = { status: "idle" }

/**
 * Wraps a server action with instant client-side validation. Server-returned
 * field errors take over after each submission; editing a field clears its
 * error.
 */
export function useValidatedAction(
  action: (prev: ActionState, data: FormData) => Promise<ActionState>,
  validate: Validator
) {
  const [state, formAction, isPending] = useActionState(action, INITIAL)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [lastState, setLastState] = useState(state)

  if (state !== lastState) {
    setLastState(state)
    setErrors(state.fieldErrors ?? {})
  }

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    const clientErrors = validate(new FormData(event.currentTarget))
    if (!clientErrors) {
      setErrors({})
      return
    }
    event.preventDefault()
    setErrors(clientErrors)
    const first = Object.keys(clientErrors)[0]
    event.currentTarget
      .querySelector<HTMLElement>(`[name="${first}"]`)
      ?.focus()
  }

  function clearError(name: string) {
    if (!errors[name]) return
    setErrors((current) => {
      const next = { ...current }
      delete next[name]
      return next
    })
  }

  return { state, formAction, isPending, errors, onSubmit, clearError }
}

export function formValue(data: FormData, name: string) {
  const value = data.get(name)
  return typeof value === "string" ? value : ""
}
