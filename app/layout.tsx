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
  // Absolute URLs for link previews (Open Graph / X)
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://airecipy.com"),
  title: { default: `${BRAND.name}: recipes for AI-made media`, template: `%s · ${BRAND.name}` },
  description: BRAND.description,
  openGraph: { siteName: BRAND.name, type: "website" },
  twitter: { card: "summary_large_image" },
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
      {/* Phones: the page itself scrolls, so the browser can hide its toolbar and the dock is a
          full-width bar. md and up: a fixed frame with the canvas scrolling inside it. */}
      <body className="min-h-dvh bg-frame md:h-dvh md:overflow-hidden">
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
            <div className="flex min-h-dvh flex-col md:h-full md:min-h-0 md:px-4 md:pt-4">
              {/* The canvas: everything scrolls in here (md+), over a light rising from the bottom */}
              <div className="relative flex flex-1 flex-col bg-canvas pb-dock-bar md:min-h-0 md:overflow-hidden md:rounded-canvas md:pb-0">
                <div aria-hidden className="canvas-glow pointer-events-none fixed inset-0 md:absolute" />
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
