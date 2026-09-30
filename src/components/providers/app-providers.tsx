"use client"

import { LazyMotion, MotionConfig } from "motion/react"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "@/components/ui/sonner"

const loadFeatures = () =>
  import("./motion-features").then((mod) => mod.default)

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={loadFeatures} strict>
      <MotionConfig reducedMotion="user">
        <TooltipProvider delayDuration={300}>
          {children}
          <Toaster position="bottom-right" closeButton={false} />
        </TooltipProvider>
      </MotionConfig>
    </LazyMotion>
  )
}
