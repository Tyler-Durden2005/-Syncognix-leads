"use client"

import { useState } from "react"
import { updatePassword } from "@/lib/auth/actions"
import {
  collectErrors,
  validatePassword,
  validatePasswordConfirm,
} from "@/lib/validation"
import { FormAlert } from "@/components/forms/form-alert"
import { FormField, fieldA11y } from "@/components/forms/form-field"
import { PasswordInput } from "@/components/forms/password-input"
import { SubmitButton } from "@/components/forms/submit-button"
import { formValue, useValidatedAction } from "@/components/forms/use-validated-action"
import { PasswordStrength } from "./password-strength"

function validate(data: FormData) {
  const password = formValue(data, "password")
  return collectErrors({
    password: validatePassword(password),
    confirmPassword: validatePasswordConfirm(password, formValue(data, "confirmPassword")),
  })
}

export function ResetPasswordForm() {
  const { state, formAction, errors, onSubmit, clearError } = useValidatedAction(
    updatePassword,
    validate
  )
  const [password, setPassword] = useState("")

  return (
    <form
      action={formAction}
      onSubmit={onSubmit}
      onReset={() => setPassword("")}
      noValidate
      className="grid gap-5"
    >
      <FormAlert message={state.status === "error" ? state.message : undefined} />

      <FormField
        id="password"
        label="New password"
        error={errors.password}
        hint={<PasswordStrength value={password} />}
      >
        <PasswordInput
          {...fieldA11y("password", errors.password)}
          name="password"
          autoComplete="new-password"
          placeholder="Create a new password"
          onChange={(e) => {
            setPassword(e.target.value)
            clearError("password")
          }}
          className="h-10"
          autoFocus
        />
      </FormField>

      <FormField id="confirmPassword" label="Confirm new password" error={errors.confirmPassword}>
        <PasswordInput
          {...fieldA11y("confirmPassword", errors.confirmPassword)}
          name="confirmPassword"
          autoComplete="new-password"
          placeholder="Repeat your new password"
          onChange={() => clearError("confirmPassword")}
          className="h-10"
        />
      </FormField>

      <SubmitButton size="lg" className="mt-1 h-10 w-full" pendingLabel="Updating…">
        Update password
      </SubmitButton>
    </form>
  )
}
