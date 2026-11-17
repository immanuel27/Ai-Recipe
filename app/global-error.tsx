"use client"

import { useEffect } from "react"

import { trackError } from "@/lib/analytics"
import { BRAND } from "@/lib/brand"

// Replaces the root layout when it crashes, so globals.css (and its tokens)
// aren't loaded: colours come from lib/brand.ts, which mirrors them.
export default function GlobalError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    trackError(error)
  }, [error])

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100dvh",
          display: "grid",
          placeItems: "center",
          padding: 16,
          background: BRAND.backgroundDark,
          color: BRAND.logoForeground,
          fontFamily: "system-ui, sans-serif",
          textAlign: "center",
        }}
      >
        <title>Something went wrong · Ai Recipy</title>
        <div>
          <h1 style={{ fontSize: 22, margin: "0 0 8px" }}>Something went wrong</h1>
          <p style={{ margin: "0 0 20px", opacity: 0.7 }}>Ai Recipy didn&apos;t load properly. Try again in a moment.</p>
          <button
            type="button"
            onClick={() => retry()}
            style={{
              border: 0,
              borderRadius: 999,
              padding: "10px 22px",
              fontWeight: 600,
              fontSize: 15,
              cursor: "pointer",
              background: BRAND.logo,
              color: BRAND.onPrimary,
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  )
}
