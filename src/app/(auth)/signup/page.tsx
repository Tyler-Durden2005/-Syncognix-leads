import type { Metadata } from "next"
import { AuthCard } from "@/components/auth/auth-card"
import { AuthLink } from "@/components/auth/auth-link"
import { GitHubButton } from "@/components/auth/github-button"
import { SignupForm } from "@/components/auth/signup-form"

export const metadata: Metadata = { title: "Create account" }

export default function SignupPage() {
  return (
    <AuthCard
      title="Create your account"
      description="Start building a pipeline of qualified leads in minutes."
      footer={
        <>
          Already have an account? <AuthLink href="/login">Sign in</AuthLink>
        </>
      }
    >
      <GitHubButton />
      <SignupForm />
    </AuthCard>
  )
}
