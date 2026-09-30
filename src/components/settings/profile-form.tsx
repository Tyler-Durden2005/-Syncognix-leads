"use client"

import { useEffect } from "react"
import { Camera } from "lucide-react"
import { toast } from "sonner"
import { updateProfile } from "@/app/(dashboard)/settings/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { FormAlert } from "@/components/forms/form-alert"
import { FormField, fieldA11y } from "@/components/forms/form-field"
import { SubmitButton } from "@/components/forms/submit-button"
import { formValue, useValidatedAction } from "@/components/forms/use-validated-action"
import { UserAvatar } from "@/components/layout/user-avatar"
import { collectErrors, validateName } from "@/lib/validation"
import type { AppUser } from "@/types"

function validate(data: FormData) {
  return collectErrors({ fullName: validateName(formValue(data, "fullName")) })
}

export function ProfileForm({ user }: { user: AppUser }) {
  const { state, formAction, errors, onSubmit, clearError } = useValidatedAction(
    updateProfile,
    validate
  )

  useEffect(() => {
    if (state.status === "success" && state.message) toast.success(state.message)
  }, [state])

  return (
    <form action={formAction} onSubmit={onSubmit} noValidate>
      <div className="space-y-6 p-5">
        <div className="flex items-center gap-4">
          <UserAvatar user={user} className="size-14 text-base" />
          <div className="space-y-1.5">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  aria-disabled="true"
                  onClick={(e) => e.preventDefault()}
                  className="cursor-not-allowed text-muted-foreground active:scale-100"
                >
                  <Camera /> Upload photo
                </Button>
              </TooltipTrigger>
              <TooltipContent>Avatar uploads are coming soon</TooltipContent>
            </Tooltip>
            <p className="text-xs text-muted-foreground">Your initials are used until then.</p>
          </div>
        </div>

        <FormAlert message={state.status === "error" ? state.message : undefined} />

        <div className="grid gap-5 sm:grid-cols-2">
          <FormField id="fullName" label="Full name" error={errors.fullName}>
            <Input
              {...fieldA11y("fullName", errors.fullName)}
              name="fullName"
              autoComplete="name"
              defaultValue={state.values?.fullName ?? user.fullName}
              onChange={() => clearError("fullName")}
            />
          </FormField>
          <FormField
            id="email"
            label="Email"
            hint="Contact support to change the email on your account."
          >
            <Input id="email" type="email" value={user.email} readOnly disabled />
          </FormField>
        </div>
      </div>
      <div className="flex justify-end border-t bg-muted/30 px-5 py-3">
        <SubmitButton size="sm" pendingLabel="Saving…">
          Save changes
        </SubmitButton>
      </div>
    </form>
  )
}
