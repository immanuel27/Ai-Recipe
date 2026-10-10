import { ImageResponse } from "next/og"

import { BRAND } from "@/lib/brand"
import { OgCard } from "@/lib/og-card"

// The preview shown when any Ai Recipy link is pasted (pages and posts inherit it)
export const alt = `${BRAND.name}: steal the recipy, make it your own`
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function OpenGraphImage() {
  return new ImageResponse(<OgCard />, size)
}
