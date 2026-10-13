"use client"


import { NotificationBell } from "@/components/notifications/notification-bell"
import { Logo } from "@/components/shell/logo"
import { cn } from "@/lib/utils"

const round =
  "glass-button flex size-12 items-center justify-center rounded-full text-foreground/80 outline-none transition-colors duration-160 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"

/** A scope switch for the header's centre: filled tabs in a rounded track. */
export function ScopeTabs({
  options,
  value,
  onChange,
  label,
}: {
  options: { value: string; label: string }[]
  value: string
  onChange: (v: string) => void
  label: string
}) {
  return (
    <div role="tablist" aria-label={label} className="glass inline-flex items-center gap-1 rounded-full p-1">
      {options.map((o) => {
        const active = o.value === value
        return (
          <button
            key={o.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(o.value)}
            className={cn(
              "h-9 rounded-full px-4 type-body font-semibold outline-none transition-colors duration-160 focus-visible:ring-2 focus-visible:ring-ring",
              active
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:bg-foreground/8 hover:text-foreground"
            )}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}

/** The top of the canvas: logo, optional centre scope and the notification bell. Theme lives in Settings. */
export function CanvasHeader({
  center,
  showSearch = true,
  className,
}: {
  center?: React.ReactNode
  /** Show the notification bell (it replaced the search shortcut; Explore has search) */
  showSearch?: boolean
  className?: string
}) {
  return (
    <header className={cn("grid grid-cols-[1fr_auto_1fr] items-center gap-x-4 gap-y-4 px-3 pt-4 md:px-10 md:pt-8", className)}>
      <Logo />
      <div className="col-start-2 hidden md:block">{center}</div>
      <div className="col-start-3 flex items-center justify-end gap-2">
        {showSearch && <NotificationBell className={round} />}
      </div>
      {center && <div className="col-span-3 md:hidden">{center}</div>}
    </header>
  )
}
