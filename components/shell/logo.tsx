import Link from "next/link"

import { LogoMark } from "@/components/shell/logo-mark"
import { BRAND } from "@/lib/brand"
import { cn } from "@/lib/utils"

export function Logo({ className, onMedia }: { className?: string; onMedia?: boolean }) {
  return (
    <Link
      href="/"
      aria-label={`${BRAND.name} home`}
      className={cn(
        "flex items-center gap-2 rounded-full text-foreground outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        onMedia && "text-on-media",
        className
      )}
    >
      <LogoMark />
      <span className="type-section font-bold whitespace-nowrap">{BRAND.name}</span>
    </Link>
  )
}
