"use client"

import Link from "next/link"
import { useTheme } from "next-themes"

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { DarkIcon, LightIcon, SearchIcon } from "@/components/icons"
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

/** Light/dark switch as a round glass button. */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const dark = resolvedTheme !== "light"
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
          onClick={() => setTheme(dark ? "light" : "dark")}
          className={round}
        >
          {dark ? <LightIcon aria-hidden className="size-5" /> : <DarkIcon aria-hidden className="size-5" />}
        </button>
      </TooltipTrigger>
      <TooltipContent>{dark ? "Light mode" : "Dark mode"}</TooltipContent>
    </Tooltip>
  )
}

/** The top of the canvas: logo, optional centre scope, search and theme. */
export function CanvasHeader({
  center,
  showSearch = true,
  className,
}: {
  center?: React.ReactNode
  /** Pages with their own search field hide the shortcut */
  showSearch?: boolean
  className?: string
}) {
  return (
    <header className={cn("grid grid-cols-[1fr_auto_1fr] items-center gap-x-4 gap-y-4 px-3 pt-4 md:px-10 md:pt-8", className)}>
      <Logo />
      <div className="col-start-2 hidden md:block">{center}</div>
      <div className="col-start-3 flex items-center justify-end gap-2">
        {showSearch && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Link href="/explore" aria-label="Search" className={round}>
                <SearchIcon aria-hidden className="size-5" />
              </Link>
            </TooltipTrigger>
            <TooltipContent>Search</TooltipContent>
          </Tooltip>
        )}
        <ThemeToggle />
      </div>
      {center && <div className="col-span-3 md:hidden">{center}</div>}
    </header>
  )
}
