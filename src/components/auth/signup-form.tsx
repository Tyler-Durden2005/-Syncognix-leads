"use client"

import { useState } from "react"
import Link from "next/link"
import { MailCheck } from "lucide-react"
import { signup } from "@/lib/auth/actions"
import {
  collectErrors,
  validateEmail,
  validateName,
  validatePassword,
  validatePasswordConfirm,
} from "@/lib/validation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FadeIn } from "@/components/shared/motion"
import { FormAlert } from "@/components/forms/form-alert"
import { FormField, fieldA11y } from "@/components/forms/form-field"
import { PasswordInput } from "@/components/forms/password-input"
import { SubmitButton } from "@/components/forms/submit-button"
import { formValue, useValidatedAction } from "@/components/forms/use-validated-action"
import { PasswordStrength } from "./password-strength"

function validate(data: FormData) {
  const password = formValue(data, "password")
  return collectErrors({
    fullName: validateName(formValue(data, "fullName")),
    email: validateEmail(formValue(data, "email")),
    password: validatePassword(password),
    confirmPassword: validatePasswordConfirm(password, formValue(data, "confirmPassword")),
  })
}

export function SignupForm() {
  const { state, formAction, errors, onSubmit, clearError } = useValidatedAction(
    signup,
    validate
  )
  const [password, setPassword] = useState("")

  if (state.status === "success") {
    return (
      <FadeIn className="flex flex-col items-center text-center" role="status">
        <div className="mb-4 grid size-12 place-items-center rounded-full bg-success/10 text-success">
          <MailCheck className="size-5" aria-hidden />
        </div>
        <h2 className="text-lg font-semibold tracking-tight">Check your inbox</h2>
        <p className="mt-2 text-sm text-pretty text-muted-foreground">{state.message}</p>
        <Button asChild variant="outline" className="mt-6 h-10 w-full">
          <Link href="/login">Back to sign in</Link>
        </Button>
      </FadeIn>
    )
  }

  return (
    <form
      action={formAction}
      onSubmit={onSubmit}
      onReset={() => setPassword("")}
      noValidate
      className="grid gap-5"
    >
      <FormAlert message={state.status === "error" ? state.message : undefined} />

      <FormField id="fullName" label="Full name" error={errors.fullName}>
        <Input
          {...fieldA11y("fullName", errors.fullName)}
          name="fullName"
          autoComplete="name"
          placeholder="Jordan Blake"
          defaultValue={state.values?.fullName}
          onChange={() => clearError("fullName")}
          className="h-10"
          autoFocus
        />
      </FormField>

      <FormField id="email" label="Work email" error={errors.email}>
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
        />
      </FormField>

      <FormField
        id="password"
        label="Password"
        error={errors.password}
        hint={<PasswordStrength value={password} />}
      >
        <PasswordInput
          {...fieldA11y("password", errors.password)}
          name="password"
          autoComplete="new-password"
          placeholder="Create a password"
          onChange={(e) => {
            setPassword(e.target.value)
            clearError("password")
          }}
          className="h-10"
        />
      </FormField>

      <FormField id="confirmPassword" label="Confirm password" error={errors.confirmPassword}>
        <PasswordInput
          {...fieldA11y("confirmPassword", errors.confirmPassword)}
          name="confirmPassword"
          autoComplete="new-password"
          placeholder="Repeat your password"
          onChange={() => clearError("confirmPassword")}
          className="h-10"
        />
      </FormField>

      <SubmitButton size="lg" className="mt-1 h-10 w-full" pendingLabel="Creating account…">
        Create account
      </SubmitButton>
    </form>
  )
}
