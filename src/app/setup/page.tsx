import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { Settings2 } from "lucide-react"
import { Logo } from "@/components/brand/logo"
import { isSupabaseConfigured } from "@/lib/supabase/env"

export const metadata: Metadata = { title: "Setup required" }
export const dynamic = "force-dynamic"

const variables = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"]

/** Shown by the proxy when Supabase environment variables are missing. */
export default function SetupPage() {
  if (isSupabaseConfigured()) redirect("/login")

  const missing = variables.filter((name) => !process.env[name])

  return (
    <main className="grid min-h-dvh place-items-center bg-background px-5 py-12">
      <div className="w-full max-w-lg">
        <Logo className="mb-8" />
        <div className="rounded-lg border bg-card p-6 shadow-xs">
          <div className="mb-4 grid size-10 place-items-center rounded-md border bg-muted/50">
            <Settings2 className="size-5 text-muted-foreground" aria-hidden />
          </div>
          <h1 className="text-lg font-semibold tracking-tight">Finish setting up Supabase</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            The app can&apos;t reach authentication because these environment variables are missing:
          </p>
          <ul className="mt-4 space-y-1.5">
            {missing.map((name) => (
              <li key={name}>
                <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[13px]">{name}</code>
              </li>
            ))}
          </ul>
          <ol className="mt-6 list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
            <li>
              Copy <code className="font-mono text-foreground">.env.example</code> to{" "}
              <code className="font-mono text-foreground">.env.local</code>.
            </li>
            <li>Paste your project URL and anon key from Supabase → Project Settings → API.</li>
            <li>Restart the dev server.</li>
          </ol>
        </div>
      </div>
    </main>
  )
}
