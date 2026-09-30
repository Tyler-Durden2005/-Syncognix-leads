import type { Metadata } from "next"
import Link from "next/link"
import { AuthCard } from "@/components/auth/auth-card"
import { AuthLink } from "@/components/auth/auth-link"
import { ResetPasswordForm } from "@/components/auth/reset-password-form"
import { Button } from "@/components/ui/button"
import { getCurrentUser } from "@/lib/auth/user"

export const metadata: Metadata = { title: "Choose a new password" }

export default async function ResetPasswordPage() {
  // The recovery link signs the user in via /auth/confirm before landing here.
  const user = await getCurrentUser()

  if (!user) {
    return (
      <AuthCard
        title="Link expired"
        description="This password reset link is invalid or has expired. Request a new one to continue."
      >
        <Button asChild size="lg" className="h-10 w-full">
          <Link href="/forgot-password">Request a new link</Link>
        </Button>
      </AuthCard>
    )
  }

  return (
    <AuthCard
      title="Choose a new password"
      description={`Set a new password for ${user.email}.`}
      footer={<AuthLink href="/dashboard">Skip for now</AuthLink>}
    >
      <ResetPasswordForm />
    </AuthCard>
  )
}
