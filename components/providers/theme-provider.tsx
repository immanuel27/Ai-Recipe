"use client"

import { ThemeProvider as NextThemesProvider } from "next-themes"

/** Dark by default; light and system stay available. Applied as a `.dark` class on <html>. */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
      {children}
    </NextThemesProvider>
  )
}
