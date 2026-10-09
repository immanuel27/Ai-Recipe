"use client"

import { ThemeProvider as NextThemesProvider } from "next-themes"

/**
 * Dark by default for everyone; light and system are opt-in from Settings → Appearance.
 * Applied as a `.dark` class on <html>. The storage key was bumped so earlier toggles reset to dark.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="dark" storageKey="theme-v2" enableSystem disableTransitionOnChange>
      {children}
    </NextThemesProvider>
  )
}
