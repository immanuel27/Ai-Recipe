"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { NAV_ITEMS, isActive } from "@/components/shell/nav-items"
import { cn } from "@/lib/utils"

export function MobileTabBar() {
  const pathname = usePathname()
  const onMedia = pathname === "/"

  return (
    <nav
      aria-label="Main"
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 border-t pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden",
        onMedia
          ? "border-on-media/10 bg-scrim/70 text-on-media"
          : "border-border bg-card/90 text-foreground"
      )}
    >
      <ul className="mx-auto flex h-16 max-w-md items-stretch justify-around">
        {NAV_ITEMS.map((item) => {
          const active = isActive(pathname, item.href)
          const Icon = item.icon
          return (
            <li key={item.href} className="flex flex-1">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex flex-1 flex-col items-center justify-center gap-1 text-[0.6875rem] font-medium outline-none focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-inset",
                  active ? (onMedia ? "text-on-media" : "text-primary") : "opacity-70"
                )}
              >
                <Icon className="size-5" aria-hidden />
                {item.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
