"use client"

import { Loader2, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSignOut } from "@/components/layout/use-sign-out"

export function SignOutButton() {
  const { signOut, isPending } = useSignOut()

  return (
    <Button variant="outline" size="sm" onClick={signOut} disabled={isPending}>
      {isPending ? <Loader2 className="animate-spin" /> : <LogOut />}
      {isPending ? "Signing out…" : "Sign out"}
    </Button>
  )
}
