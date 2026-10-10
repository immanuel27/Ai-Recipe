import { BRAND } from "@/lib/brand"
import { LogoGlyph } from "@/lib/logo-glyph"

/**
 * App icon artwork for ImageResponse: the cream R on the logo violet.
 * The glyph stays inside the central ~60% so the same image works as maskable.
 */
export function BrandIcon({ size }: { size: number }) {
  const h = Math.round(size * 0.5)
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: BRAND.logo,
      }}
    >
      <LogoGlyph fill={BRAND.logoForeground} width={Math.round((h * 110) / 122)} height={h} />
    </div>
  )
}
