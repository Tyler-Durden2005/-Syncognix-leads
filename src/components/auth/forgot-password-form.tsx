"use client"

import Link from "next/link"
import { MailCheck } from "lucide-react"
import { requestPasswordReset } from "@/lib/auth/actions"
import { collectErrors, validateEmail } from "@/lib/validation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FadeIn } from "@/components/shared/motion"
import { FormAlert } from "@/components/forms/form-alert"
import { FormField, fieldA11y } from "@/components/forms/form-field"
import { SubmitButton } from "@/components/forms/submit-button"
import { formValue, useValidatedAction } from "@/components/forms/use-validated-action"

function validate(data: FormData) {
  return collectErrors({ email: validateEmail(formValue(data, "email")) })
}

export function ForgotPasswordForm() {
  const { state, formAction, errors, onSubmit, clearError } = useValidatedAction(
    requestPasswordReset,
    validate
  )

  if (state.status === "success") {
    return (
      <FadeIn className="flex flex-col items-center text-center" role="status">
        <div className="mb-4 grid size-12 place-items-center rounded-full bg-success/10 text-success">
          <MailCheck className="size-5" aria-hidden />
        </div>
        <h2 className="text-lg font-semibold tracking-tight">Check your email</h2>
        <p className="mt-2 text-sm text-pretty text-muted-foreground">{state.message}</p>
        <Button asChild variant="outline" className="mt-6 h-10 w-full">
          <Link href="/login">Back to sign in</Link>
        </Button>
      </FadeIn>
    )
  }

  return (
    <form action={formAction} onSubmit={onSubmit} noValidate className="grid gap-5">
      <FormAlert message={state.status === "error" ? state.message : undefined} />

      <FormField id="email" label="Email" error={errors.email}>
        <Input
          {...fieldA11y("email", errors.email)}
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder="you@company.com"
          defaultValue={state.values?.email}
          onChange={() => clearError("email")}
          className="h-10"
          autoFocus
        />
      </FormField>

      <SubmitButton size="lg" className="h-10 w-full" pendingLabel="Sending link…">
        Send reset link
      </SubmitButton>
    </form>
  )
}
