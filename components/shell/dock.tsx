"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { SettingsIcon, UserIcon } from "@/components/icons"
import { useAppStore } from "@/components/providers/app-store"
import { AccountMenu } from "@/components/shell/account-menu"
import { DOCK_ITEMS, isActive, pageTitle } from "@/components/shell/nav-items"
import { UserAvatar } from "@/components/shell/user-avatar"
import { cn } from "@/lib/utils"

const round =
  "flex size-10 shrink-0 items-center justify-center rounded-full outline-none sm:size-12 transition-colors duration-160 focus-visible:ring-2 focus-visible:ring-ring"

/**
 * The dock sits on the frame, under the canvas: page title on the left,
 * round nav in the middle (active is solid), settings and you on the right.
 */
export function Dock() {
  const pathname = usePathname()
  const { user, hydrated } = useAppStore()
  const items = DOCK_ITEMS.filter((i) => !i.seller || (hydrated && user?.isSeller))

  return (
    <footer className="grid h-dock shrink-0 grid-cols-[1fr_auto_1fr] items-center gap-1 px-1 sm:gap-2 md:gap-4 md:px-6">
      <p aria-live="polite" className="hidden truncate text-2xl font-semibold tracking-tight text-foreground md:block">
        {pageTitle(pathname)}
      </p>

      <nav aria-label="Main" className="col-start-2 flex items-center gap-1 sm:gap-2">
        {items.map((item) => {
          const active = isActive(pathname, item.href)
          const Icon = item.icon
          return (
            <Tooltip key={item.href}>
              <TooltipTrigger asChild>
                <Link
                  href={item.href}
                  aria-label={item.label}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    round,
                    item.primary
                      ? "bg-brand text-brand-foreground hover:bg-brand/85"
                      : active
                        ? "bg-foreground text-background"
                        : "glass-button text-foreground/80 hover:text-foreground"
                  )}
                >
                  <Icon aria-hidden weight={active ? "fill" : "regular"} className="size-5" />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="top" sideOffset={8}>
                {item.label}
              </TooltipContent>
            </Tooltip>
          )
        })}
      </nav>

      <div className="col-start-3 flex items-center justify-end gap-3">
        {hydrated && user ? (
          <>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="/profile/settings"
                  aria-label="Settings"
                  className={cn(round, "glass-button hidden text-foreground/80 hover:text-foreground md:flex")}
                >
                  <SettingsIcon aria-hidden className="size-5" />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="top" sideOffset={8}>
                Settings
              </TooltipContent>
            </Tooltip>
            <AccountMenu>
              <button
                type="button"
                aria-label="Account menu"
                className="flex items-center gap-3 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <UserAvatar username={user.username} className="size-10 sm:size-12" />
                <span className="hidden max-w-32 truncate font-semibold lg:block">
                  {user.displayName ?? user.username}
                </span>
              </button>
            </AccountMenu>
          </>
        ) : hydrated ? (
          <>
            {/* Phones: one round button; the sign-in page offers both */}
            <Link
              href="/signin?mode=signup"
              aria-label="Log in or sign up"
              className={cn(round, "glass-button text-foreground/80 hover:text-foreground md:hidden")}
            >
              <UserIcon aria-hidden className="size-5" />
            </Link>
            <Button asChild size="pill" variant="ghost" className="glass-button hidden h-12 md:inline-flex">
              <Link href="/signin">Log in</Link>
            </Button>
            <Button asChild size="pill" className="hidden h-12 bg-foreground text-background hover:bg-foreground/90 md:inline-flex">
              <Link href="/signin?mode=signup">Sign up</Link>
            </Button>
          </>
        ) : (
          <span className="size-12 rounded-full bg-dock" />
        )}
      </div>
    </footer>
  )
}
