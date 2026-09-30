"use client"

import Link from "next/link"
import { login } from "@/lib/auth/actions"
import { collectErrors, validateEmail } from "@/lib/validation"
import { Input } from "@/components/ui/input"
import { FormAlert } from "@/components/forms/form-alert"
import { FormField, fieldA11y } from "@/components/forms/form-field"
import { PasswordInput } from "@/components/forms/password-input"
import { SubmitButton } from "@/components/forms/submit-button"
import { formValue, useValidatedAction } from "@/components/forms/use-validated-action"

function validate(data: FormData) {
  return collectErrors({
    email: validateEmail(formValue(data, "email")),
    password: formValue(data, "password") ? undefined : "Password is required.",
  })
}

export function LoginForm({ next, notice }: { next?: string; notice?: string }) {
  const { state, formAction, errors, onSubmit, clearError } = useValidatedAction(
    login,
    validate
  )

  return (
    <form action={formAction} onSubmit={onSubmit} noValidate className="grid gap-5">
      <FormAlert message={state.status === "error" ? state.message : notice} />
      {next && <input type="hidden" name="next" value={next} />}

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

      <FormField
        id="password"
        label="Password"
        error={errors.password}
        labelAction={
          <Link
            href="/forgot-password"
            className="rounded-sm text-[13px] text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            Forgot password?
          </Link>
        }
      >
        <PasswordInput
          {...fieldA11y("password", errors.password)}
          name="password"
          autoComplete="current-password"
          placeholder="Enter your password"
          onChange={() => clearError("password")}
          className="h-10"
        />
      </FormField>

      <SubmitButton size="lg" className="mt-1 h-10 w-full" pendingLabel="Signing in…">
        Sign in
      </SubmitButton>
    </form>
  )
}
