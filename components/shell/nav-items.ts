import { CompassIcon, HouseIcon, PlusIcon, UserIcon } from "lucide-react"

export const NAV_ITEMS = [
  { href: "/", label: "Feed", icon: HouseIcon },
  { href: "/explore", label: "Explore", icon: CompassIcon },
  { href: "/sell", label: "Sell", icon: PlusIcon },
  { href: "/profile", label: "Profile", icon: UserIcon },
] as const

export function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`)
}
