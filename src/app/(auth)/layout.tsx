import { AuthShowcase } from "@/components/auth/auth-showcase"
import { Logo } from "@/components/brand/logo"
import { brand } from "@/config/brand"

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <aside className="sticky top-0 hidden h-dvh lg:block">
        <AuthShowcase />
      </aside>

      <main className="flex min-h-dvh flex-col bg-card">
        <header className="flex h-16 items-center px-6 lg:hidden">
          <Logo />
        </header>
        <div className="flex flex-1 items-center justify-center px-5 pt-4 pb-12 sm:px-8 lg:py-12">
          {children}
        </div>
        <footer className="px-6 pb-6 text-center text-xs text-muted-foreground lg:text-left">
          © {new Date().getFullYear()} {brand.name}
        </footer>
      </main>
    </div>
  )
}
