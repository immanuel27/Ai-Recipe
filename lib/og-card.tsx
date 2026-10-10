import { BRAND } from "@/lib/brand"
import { LogoGlyph } from "@/lib/logo-glyph"

/** The link preview card (Open Graph / X): the logo tile, name and tagline on violet. */
export function OgCard() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 40,
        background: BRAND.logo,
        color: BRAND.logoForeground,
      }}
    >
      <LogoGlyph fill={BRAND.logoForeground} width={180} height={200} />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
        <div style={{ fontSize: 76, fontWeight: 700, letterSpacing: -2 }}>{BRAND.name}</div>
        <div style={{ fontSize: 34, opacity: 0.85 }}>Steal the Recipy, make it your own.</div>
      </div>
    </div>
  )
}
