import { BRAND } from "@/lib/brand"

/**
 * App icon artwork for ImageResponse: the logo mark on the primary colour.
 * The mark stays inside the central ~60% so the same image works as maskable.
 */
export function BrandIcon({ size }: { size: number }) {
  const mark = size * 0.56
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: BRAND.primary,
      }}
    >
      <svg width={mark} height={mark * 0.75} viewBox="0 0 32 24">
        <path d="M0 2h6l8 20H8z" fill={BRAND.onPrimary} opacity="0.55" />
        <path d="M9 2h6l8 20h-6z" fill={BRAND.onPrimary} opacity="0.8" />
        <path d="M18 2h6l8 20h-6z" fill={BRAND.onPrimary} />
      </svg>
    </div>
  )
}
