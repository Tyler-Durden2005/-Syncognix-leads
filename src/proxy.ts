import type { NextRequest } from "next/server"
import { updateSession } from "@/lib/supabase/proxy"

export async function proxy(request: NextRequest) {
  return updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Run on everything except static assets, image optimization files and
     * the generated app icons (src/app/icon.tsx, apple-icon.tsx).
     */
    "/((?!_next/static|_next/image|favicon.ico|icon$|apple-icon$|.*\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml)$).*)",
  ],
}
