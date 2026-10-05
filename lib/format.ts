export const PLATFORM_FEE = 0.2

export function formatPrice(cents: number, { free = true } = {}) {
  if (cents === 0 && free) return "Free"
  const dollars = cents / 100
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: Number.isInteger(dollars) ? 0 : 2,
  }).format(dollars)
}

export function sellerEarnings(cents: number) {
  return Math.round(cents * (1 - PLATFORM_FEE))
}

export function formatCompact(n: number) {
  return new Intl.NumberFormat("en-US", { notation: "compact" }).format(n)
}

export function formatRelative(iso: string, now = new Date()) {
  const diff = (new Date(iso).getTime() - now.getTime()) / 1000
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" })
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 31536000],
    ["month", 2592000],
    ["week", 604800],
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ]
  for (const [unit, secs] of units) {
    if (Math.abs(diff) >= secs) return rtf.format(Math.round(diff / secs), unit)
  }
  return "just now"
}

export function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(
    new Date(iso)
  )
}

export function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 48)
}

export function initials(name: string) {
  return name
    .replace(/[._]/g, " ")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("")
}
