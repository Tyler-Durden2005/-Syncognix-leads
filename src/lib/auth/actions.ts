"use server"

import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { toFriendlyAuthError } from "@/lib/auth/errors"
import {
  collectErrors,
  validateEmail,
  validateName,
  validatePassword,
  validatePasswordConfirm,
} from "@/lib/validation"
import type { ActionState } from "@/types"

function field(formData: FormData, name: string) {
  const value = formData.get(name)
  return typeof value === "string" ? value : ""
}

/** Only allow same-origin relative paths to avoid open redirects. */
function safeNextPath(value: string) {
  if (value.startsWith("/") && !value.startsWith("//") && !value.startsWith("/\\")) {
    return value
  }
  return "/dashboard"
}

async function getOrigin() {
  const h = await headers()
  const origin = h.get("origin")
  if (origin) return origin
  const host = h.get("x-forwarded-host") ?? h.get("host")
  const proto = h.get("x-forwarded-proto") ?? "http"
  return process.env.NEXT_PUBLIC_SITE_URL || `${proto}://${host}`
}

export async function login(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const email = field(formData, "email").trim()
  const password = field(formData, "password")
  const next = safeNextPath(field(formData, "next"))

  const fieldErrors = collectErrors({
    email: validateEmail(email),
    password: password ? undefined : "Password is required.",
  })
  if (fieldErrors) return { status: "error", fieldErrors, values: { email } }

  try {
    const supabase = await createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      return { status: "error", message: toFriendlyAuthError(error), values: { email } }
    }
  } catch (error) {
    return { status: "error", message: toFriendlyAuthError(error), values: { email } }
  }

  revalidatePath("/", "layout")
  redirect(next)
}

export async function signup(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const fullName = field(formData, "fullName").trim()
  const email = field(formData, "email").trim()
  const password = field(formData, "password")
  const confirmPassword = field(formData, "confirmPassword")
  const values = { fullName, email }

  const fieldErrors = collectErrors({
    fullName: validateName(fullName),
    email: validateEmail(email),
    password: validatePassword(password),
    confirmPassword: validatePasswordConfirm(password, confirmPassword),
  })
  if (fieldErrors) return { status: "error", fieldErrors, values }

  let hasSession = false
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${await getOrigin()}/auth/confirm?next=/dashboard`,
      },
    })

    if (error) return { status: "error", message: toFriendlyAuthError(error), values }

    // With email confirmation on, Supabase hides existing accounts by
    // returning a user with no identities instead of an error.
    if (data.user && data.user.identities?.length === 0) {
      return {
        status: "error",
        message: "An account with this email already exists. Try signing in instead.",
        values,
      }
    }

    hasSession = Boolean(data.session)
  } catch (error) {
    return { status: "error", message: toFriendlyAuthError(error), values }
  }

  if (hasSession) {
    revalidatePath("/", "layout")
    redirect("/dashboard")
  }

  return {
    status: "success",
    message: `We sent a confirmation link to ${email}. Open it to activate your account.`,
    values,
  }
}

export async function requestPasswordReset(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const email = field(formData, "email").trim()
  const emailError = validateEmail(email)
  if (emailError) {
    return { status: "error", fieldErrors: { email: emailError }, values: { email } }
  }

  try {
    const supabase = await createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${await getOrigin()}/auth/confirm?next=/reset-password`,
    })
    // Rate limits are worth surfacing; anything else stays generic so the
    // form never reveals whether an account exists.
    if (error && (error.status === 429 || error.status === 0)) {
      return { status: "error", message: toFriendlyAuthError(error), values: { email } }
    }
  } catch (error) {
    return { status: "error", message: toFriendlyAuthError(error), values: { email } }
  }

  return {
    status: "success",
    message: `If an account exists for ${email}, you'll receive a reset link shortly.`,
    values: { email },
  }
}

export async function updatePassword(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const password = field(formData, "password")
  const confirmPassword = field(formData, "confirmPassword")

  const fieldErrors = collectErrors({
    password: validatePassword(password),
    confirmPassword: validatePasswordConfirm(password, confirmPassword),
  })
  if (fieldErrors) return { status: "error", fieldErrors }

  try {
    const supabase = await createClient()
    const { error } = await supabase.auth.updateUser({ password })
    if (error) return { status: "error", message: toFriendlyAuthError(error) }
  } catch (error) {
    return { status: "error", message: toFriendlyAuthError(error) }
  }

  revalidatePath("/", "layout")
  redirect("/dashboard?password=updated")
}

export async function signOut() {
  try {
    const supabase = await createClient()
    await supabase.auth.signOut()
  } catch {
    // Even if the network call fails, fall through to the login page; the
    // proxy will treat the user as signed out once cookies are cleared.
  }
  revalidatePath("/", "layout")
  redirect("/login")
}

export async function signInWithGitHub(formData: FormData) {
  const next = safeNextPath(field(formData, "next"))
  let url: string | undefined

  try {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${await getOrigin()}/auth/confirm?next=${encodeURIComponent(next)}`,
      },
    })
    if (!error) url = data.url
  } catch {
    // Handled by the redirect below.
  }

  redirect(url ?? "/login?error=oauth_failed")
}
