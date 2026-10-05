import { cn } from "@/lib/utils"

/** Three slanted stripes. Uses currentColor so it follows the theme. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 24" aria-hidden className={cn("h-6 w-8", className)}>
      <path d="M0 2h6l8 20H8z" fill="currentColor" opacity="0.55" />
      <path d="M9 2h6l8 20h-6z" fill="currentColor" opacity="0.8" />
      <path d="M18 2h6l8 20h-6z" fill="currentColor" />
    </svg>
  )
}
