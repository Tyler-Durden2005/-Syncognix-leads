import { FadeIn } from "@/components/shared/motion"

type AuthCardProps = {
  title: string
  description: React.ReactNode
  footer?: React.ReactNode
  children: React.ReactNode
}

export function AuthCard({ title, description, footer, children }: AuthCardProps) {
  return (
    <FadeIn y={8} className="w-full max-w-[400px]">
      <div className="mb-8 space-y-1.5">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="text-sm text-pretty text-muted-foreground">{description}</p>
      </div>
      {children}
      {footer && (
        <p className="mt-8 text-center text-sm text-muted-foreground">{footer}</p>
      )}
    </FadeIn>
  )
}
