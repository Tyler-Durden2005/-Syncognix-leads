/**
 * Small, dependency-free validators shared by client forms and server actions.
 * Each returns an error message, or undefined when the value is valid.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export const PASSWORD_MIN_LENGTH = 8

export const passwordRules = [
  {
    id: "length",
    label: `At least ${PASSWORD_MIN_LENGTH} characters`,
    test: (v: string) => v.length >= PASSWORD_MIN_LENGTH,
  },
  { id: "letter", label: "One letter", test: (v: string) => /[A-Za-z]/.test(v) },
  { id: "number", label: "One number", test: (v: string) => /\d/.test(v) },
] as const

export function validateEmail(value: string) {
  if (!value.trim()) return "Email is required."
  if (!EMAIL_RE.test(value.trim())) return "Enter a valid email address."
}

export function validateName(value: string) {
  const name = value.trim()
  if (!name) return "Full name is required."
  if (name.length < 2) return "Name must be at least 2 characters."
  if (name.length > 80) return "Name must be 80 characters or fewer."
}

export function validatePassword(value: string) {
  if (!value) return "Password is required."
  const failed = passwordRules.find((rule) => !rule.test(value))
  if (failed) return `Password needs: ${failed.label.toLowerCase()}.`
  if (value.length > 72) return "Password must be 72 characters or fewer."
}

export function validatePasswordConfirm(password: string, confirm: string) {
  if (!confirm) return "Please confirm your password."
  if (password !== confirm) return "Passwords don't match."
}

/** Drops empty entries; returns undefined when there are no errors. */
export function collectErrors(errors: Record<string, string | undefined>) {
  const entries = Object.entries(errors).filter(
    (entry): entry is [string, string] => Boolean(entry[1])
  )
  return entries.length ? Object.fromEntries(entries) : undefined
}
