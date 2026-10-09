"use client"

import * as React from "react"
import { usePathname } from "next/navigation"

/** md and up, the canvas scrolls, not the page (phones scroll the page). Back to the top on every new page. */
export function CanvasScroll({ children }: { children: React.ReactNode }) {
  const ref = React.useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  React.useEffect(() => {
    ref.current?.scrollTo({ top: 0 })
    window.scrollTo({ top: 0 })
  }, [pathname])

  return (
    <div ref={ref} id="canvas" className="relative flex flex-1 flex-col md:h-full md:overflow-y-auto md:overscroll-contain">
      {children}
    </div>
  )
}
