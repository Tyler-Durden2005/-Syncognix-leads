import { isAuthError } from "@supabase/supabase-js"

const MESSAGES: Record<string, string> = {
  invalid_credentials:
    "That email and password combination doesn't match our records.",
  email_not_confirmed:
    "Please confirm your email address first. Check your inbox for the link.",
  user_already_exists:
    "An account with this email already exists. Try signing in instead.",
  email_exists:
    "An account with this email already exists. Try signing in instead.",
  weak_password:
    "That password is too weak. Use at least 8 characters with letters and numbers.",
  same_password: "Your new password must be different from your current one.",
  over_request_rate_limit:
    "Too many attempts. Please wait a minute and try again.",
  over_email_send_rate_limit:
    "We've sent too many emails recently. Please wait a few minutes and try again.",
  email_address_invalid: "That email address doesn't look valid.",
  email_address_not_authorized: "Emails can't be sent to this address yet.",
  signup_disabled: "New sign-ups are currently disabled.",
  user_banned: "This account has been suspended. Contact support for help.",
  session_expired: "Your session has expired. Please sign in again.",
  session_not_found: "Your session has expired. Please sign in again.",
  otp_expired: "This link has expired. Please request a new one.",
  flow_state_expired: "This link has expired. Please request a new one.",
  bad_code_verifier:
    "This link must be opened in the same browser you requested it from.",
  request_timeout: "The request timed out. Please try again.",
}

export const NETWORK_ERROR =
  "We couldn't reach our authentication service. Check your connection and try again."
export const GENERIC_ERROR = "Something went wrong on our end. Please try again."

/** Converts any Supabase/network error into a message that is safe to show users. */
export function toFriendlyAuthError(error: unknown): string {
  if (isAuthError(error)) {
    if (error.code && MESSAGES[error.code]) return MESSAGES[error.code]
    if (error.name === "AuthRetryableFetchError" || error.status === 0) {
      return NETWORK_ERROR
    }
    if (error.status === 429) return MESSAGES.over_request_rate_limit
    console.error("[auth] Unexpected Supabase error:", error)
    return GENERIC_ERROR
  }
  if (error instanceof Error && error.name === "SupabaseConfigError") {
    return "Authentication isn't configured yet. Add your Supabase keys to .env.local."
  }
  if (error instanceof TypeError) return NETWORK_ERROR
  console.error("[auth] Unexpected error:", error)
  return GENERIC_ERROR
}
