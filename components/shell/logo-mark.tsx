import { LogoGlyph } from "@/lib/logo-glyph"
import { cn } from "@/lib/utils"

/** The app mark: a cream R with a star, on a violet rounded tile. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn("flex size-8 shrink-0 items-center justify-center rounded-lg bg-logo text-logo-foreground", className)}
    >
      <LogoGlyph fill="currentColor" width="50%" height="56%" />
    </span>
  )
}
