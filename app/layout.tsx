import type { Metadata, Viewport } from "next"
import localFont from "next/font/local"

import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { AccountSync } from "@/components/providers/account-sync"
import { ThemeProvider } from "@/components/providers/theme-provider"
import { CanvasScroll } from "@/components/shell/canvas-scroll"
import { Dock } from "@/components/shell/dock"
import { SiteFooter } from "@/components/shell/site-footer"
import { WelcomeDialog } from "@/components/shell/welcome-dialog"
import { BRAND } from "@/lib/brand"
import "./globals.css"

/** Uncut Sans everywhere, three weights only. SIL OFL, see ./fonts. */
const uncut = localFont({
  variable: "--font-uncut",
  display: "swap",
  src: [
    { path: "./fonts/UncutSans-Regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/UncutSans-Semibold.woff2", weight: "600", style: "normal" },
    { path: "./fonts/UncutSans-Bold.woff2", weight: "700", style: "normal" },
  ],
  fallback: ["ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
})

export const metadata: Metadata = {
  title: { default: `${BRAND.name}: recipes for AI-made media`, template: `%s · ${BRAND.name}` },
  description: BRAND.description,
  applicationName: BRAND.name,
  appleWebApp: { capable: true, title: BRAND.name, statusBarStyle: "black-translucent" },
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: BRAND.background },
    { media: "(prefers-color-scheme: dark)", color: BRAND.backgroundDark },
  ],
  viewportFit: "cover",
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // next-themes sets the theme class before React hydrates
    <html
      lang="en"
      suppressHydrationWarning
      className={`${uncut.variable} antialiased`}
    >
      <body className="h-dvh overflow-hidden bg-frame">
        <a
          href="#main"
          className="sr-only z-50 rounded-full bg-primary px-4 py-2 text-primary-foreground focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
        >
          Skip to content
        </a>
        <ThemeProvider>
          <TooltipProvider>
            {/* The frame's inset lives here, not on <body>: menus and sheets lock scroll by
                rewriting body padding, which would make the canvas jump */}
            <div className="flex h-full flex-col px-1 pt-1 md:px-4 md:pt-4">
              {/* The canvas: everything scrolls in here, over a light rising from the bottom */}
              <div className="relative min-h-0 flex-1 overflow-hidden rounded-2xl bg-canvas md:rounded-canvas">
                <div aria-hidden className="canvas-glow pointer-events-none absolute inset-0" />
                <CanvasScroll>
                  <main id="main" className="relative flex flex-1 flex-col">
                    {children}
                  </main>
                  <SiteFooter />
                </CanvasScroll>
              </div>
              <Dock />
            </div>
            <Toaster position="top-center" />
            <WelcomeDialog />
            <AccountSync />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
