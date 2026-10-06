"use client"

import * as React from "react"
import { usePathname } from "next/navigation"

/** The canvas scrolls, not the page. Back to the top on every new page. */
export function CanvasScroll({ children }: { children: React.ReactNode }) {
  const ref = React.useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  React.useEffect(() => {
    ref.current?.scrollTo({ top: 0 })
  }, [pathname])

  return (
    <div ref={ref} id="canvas" className="relative flex h-full flex-col overflow-y-auto overscroll-contain">
      {children}
    </div>
  )
}
