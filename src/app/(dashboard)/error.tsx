"use client"

import { useEffect } from "react"
import { RotateCw, TriangleAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/shared/empty-state"

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="rounded-lg border bg-card">
      <EmptyState
        icon={TriangleAlert}
        title="Something went wrong"
        description="We couldn't load this page. Check your connection and try again."
        className="py-20"
        action={
          <Button variant="outline" size="sm" onClick={reset}>
            <RotateCw /> Try again
          </Button>
        }
      />
    </div>
  )
}
