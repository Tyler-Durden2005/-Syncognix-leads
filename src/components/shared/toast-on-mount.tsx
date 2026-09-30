"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { toast } from "sonner"

/** Shows a one-off success toast, then strips the query string that triggered it. */
export function ToastOnMount({ message }: { message: string }) {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    toast.success(message)
    router.replace(pathname, { scroll: false })
  }, [message, pathname, router])

  return null
}
