"use client"

import { useTransition } from "react"
import { toast } from "sonner"
import { signOut } from "@/lib/auth/actions"

export function useSignOut() {
  const [isPending, startTransition] = useTransition()

  function handleSignOut() {
    startTransition(async () => {
      try {
        await signOut()
      } catch (error) {
        // redirect() throws a special error that Next.js handles; anything
        // else is a genuine failure.
        const digest = (error as { digest?: unknown })?.digest
        if (typeof digest === "string" && digest.startsWith("NEXT_REDIRECT")) throw error
        toast.error("We couldn't sign you out. Please try again.")
      }
    })
  }

  return { signOut: handleSignOut, isPending }
}
