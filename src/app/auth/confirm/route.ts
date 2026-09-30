import { NextResponse, type NextRequest } from "next/server"
import type { EmailOtpType } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/server"

/**
 * Landing point for links in Supabase auth emails (sign-up confirmation,
 * password recovery). Supports both the token-hash template format and the
 * default PKCE `?code=` redirect.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const tokenHash = searchParams.get("token_hash")
  const type = searchParams.get("type") as EmailOtpType | null
  const code = searchParams.get("code")
  const nextParam = searchParams.get("next") ?? "/dashboard"
  const next =
    nextParam.startsWith("/") && !nextParam.startsWith("//") ? nextParam : "/dashboard"

  try {
    const supabase = await createClient()

    if (tokenHash && type) {
      const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash })
      if (!error) return NextResponse.redirect(new URL(next, request.url))
    } else if (code) {
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      if (!error) return NextResponse.redirect(new URL(next, request.url))
    }
  } catch {
    // Fall through to the error redirect below.
  }

  const failure = new URL("/login", request.url)
  failure.searchParams.set("error", "link_invalid")
  return NextResponse.redirect(failure)
}
