import type { Metadata } from "next"
import { AuthCard } from "@/components/auth/auth-card"
import { brand } from "@/config/brand"
import { AuthLink } from "@/components/auth/auth-link"
import { GitHubButton } from "@/components/auth/github-button"
import { LoginForm } from "@/components/auth/login-form"

export const metadata: Metadata = { title: "Sign in" }

const NOTICES: Record<string, string> = {
  link_invalid: "That link is invalid or has expired. Please try again.",
  oauth_failed: "GitHub sign-in didn't go through. Please try again.",
}

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const params = await searchParams
  const next = typeof params.next === "string" ? params.next : undefined
  const error = typeof params.error === "string" ? params.error : undefined

  return (
    <AuthCard
      title="Welcome back"
      description={`Sign in to your ${brand.name} workspace.`}
      footer={
        <>
          Don&apos;t have an account? <AuthLink href="/signup">Create one</AuthLink>
        </>
      }
    >
      <GitHubButton next={next} />
      <LoginForm next={next} notice={error ? NOTICES[error] : undefined} />
    </AuthCard>
  )
}
