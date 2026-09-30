import { redirect } from "next/navigation"

// The proxy routes "/" based on auth state; this is a fallback.
export default function Home() {
  redirect("/dashboard")
}
