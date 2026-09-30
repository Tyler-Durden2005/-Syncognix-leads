import { Children, cloneElement, isValidElement } from "react"
import { cn } from "@/lib/utils"

/*
 * Entrance animations are pure CSS (tw-animate-css) so server-rendered content
 * is never hidden while waiting for JavaScript. Motion (JS) is reserved for
 * interactions that need it: layout indicators and exit animations.
 */

const ENTER = "animate-in fade-in fill-mode-both duration-250 ease-out"

type DivProps = React.ComponentProps<"div">

export function FadeIn({
  className,
  style,
  delay = 0,
  y = 6,
  ...props
}: DivProps & { delay?: number; y?: number }) {
  return (
    <div
      className={cn(ENTER, className)}
      style={
        {
          animationDelay: `${delay}s`,
          "--tw-enter-translate-y": `${y}px`,
          ...style,
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

/** Staggers the entrance of its <StaggerItem> children by index. */
export function Stagger({ children, ...props }: DivProps) {
  let index = 0
  return (
    <div {...props}>
      {Children.map(children, (child) =>
        isValidElement<StaggerItemProps>(child) && child.type === StaggerItem
          ? cloneElement(child, { index: index++ })
          : child
      )}
    </div>
  )
}

type StaggerItemProps = DivProps & { index?: number }

export function StaggerItem({ className, style, index = 0, ...props }: StaggerItemProps) {
  return (
    <div
      className={cn(ENTER, className)}
      style={
        {
          animationDelay: `${20 + index * 40}ms`,
          "--tw-enter-translate-y": "6px",
          ...style,
        } as React.CSSProperties
      }
      {...props}
    />
  )
}
