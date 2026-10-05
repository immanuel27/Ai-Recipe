"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { Logo } from "@/components/shell/logo"
import { NAV_ITEMS, isActive } from "@/components/shell/nav-items"
import { UserMenu } from "@/components/shell/user-menu"
import { cn } from "@/lib/utils"

export function SiteHeader() {
  const pathname = usePathname()
  const isFeed = pathname === "/"

  return (
    <header
      className={cn(
        "sticky top-0 z-40 h-16 items-center md:h-20 bg-background/85 backdrop-blur-md",
        // The feed is edge-to-edge on mobile and has its own overlay header
        isFeed ? "hidden md:flex short:hidden!" : "flex"
      )}
    >
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 md:px-6">
        <Logo />
        <nav aria-label="Main" className="hidden items-center gap-2 md:flex">
          {NAV_ITEMS.map((item) => {
            const active = isActive(pathname, item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-foreground ring-1 ring-foreground/10 hover:bg-muted"
                )}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>
        <UserMenu />
      </div>
    </header>
  )
}
