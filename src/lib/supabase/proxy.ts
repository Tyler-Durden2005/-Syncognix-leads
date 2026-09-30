import { NextResponse, type NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { getSupabaseEnv } from "./env"

const AUTH_ROUTES = ["/login", "/signup", "/forgot-password"]
const PUBLIC_ROUTES = [...AUTH_ROUTES, "/auth", "/reset-password", "/setup"]

function matches(pathname: string, routes: string[]) {
  return routes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  )
}

/**
 * Refreshes the Supabase session cookie and applies optimistic route
 * protection. Server layouts re-verify the user before rendering data.
 */
export async function updateSession(request: NextRequest) {
  const { pathname } = request.nextUrl
  const env = getSupabaseEnv()

  if (!env) {
    if (matches(pathname, ["/setup"])) return NextResponse.next()
    return NextResponse.redirect(new URL("/setup", request.url))
  }

  let response = NextResponse.next({ request })

  const supabase = createServerClient(env.url, env.anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        )
        response = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        )
        Object.entries(headers ?? {}).forEach(([key, value]) =>
          response.headers.set(key, value)
        )
      },
    },
  })

  // Do not run code between createServerClient and getClaims(): it keeps the
  // session refresh and cookie write-back in a single, predictable step.
  let isAuthenticated = false
  try {
    const { data } = await supabase.auth.getClaims()
    isAuthenticated = Boolean(data?.claims?.sub)
  } catch {
    // Supabase unreachable — treat as signed out rather than crashing.
    isAuthenticated = false
  }

  const redirectTo = (path: string, keepNext = false) => {
    const url = request.nextUrl.clone()
    url.pathname = path
    url.search = ""
    if (keepNext && pathname !== "/") url.searchParams.set("next", pathname)
    const redirect = NextResponse.redirect(url)
    // Carry refreshed auth cookies over to the redirect response.
    response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie))
    return redirect
  }

  if (pathname === "/") {
    return redirectTo(isAuthenticated ? "/dashboard" : "/login")
  }

  if (isAuthenticated && matches(pathname, AUTH_ROUTES)) {
    return redirectTo("/dashboard")
  }

  // API routes answer with JSON (including their own 401s) instead of
  // redirecting to the login page.
  if (matches(pathname, ["/api"])) return response

  if (!isAuthenticated && !matches(pathname, PUBLIC_ROUTES)) {
    return redirectTo("/login", true)
  }

  return response
}
