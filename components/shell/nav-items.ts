import {
  CreateIcon,
  ExploreIcon,
  HomeIcon,
  SaveIcon,
  type IconType,
} from "@/components/icons"

export interface NavItem {
  href: string
  label: string
  icon: IconType
  /** Only for signed-in sellers */
  seller?: boolean
  /** The one action in the dock, filled with the brand colour */
  primary?: boolean
}

/** The dock's round buttons, in order */
export const DOCK_ITEMS: NavItem[] = [
  { href: "/", label: "Discover", icon: HomeIcon },
  { href: "/explore", label: "Explore", icon: ExploreIcon },
  { href: "/sell", label: "New recipe", icon: CreateIcon, primary: true },
  { href: "/profile/library", label: "Library", icon: SaveIcon },
]

/** Seller tools live under /profile but belong to Studio */
const STUDIO_PATHS = ["/profile/overview", "/profile/listings", "/profile/sales", "/profile/payouts"]

export function isStudio(pathname: string) {
  return STUDIO_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))
}

export function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/"
  if (href === "/profile/overview") return isStudio(pathname)
  return pathname === href || pathname.startsWith(`${href}/`)
}

/** The page name shown at the left of the dock */
export function pageTitle(pathname: string) {
  if (pathname === "/") return "Discover"
  if (pathname.startsWith("/explore")) return "Explore"
  if (pathname.startsWith("/sell")) return "New recipe"
  if (pathname.startsWith("/profile/library")) return "Library"
  if (pathname.startsWith("/profile/settings")) return "Settings"
  if (isStudio(pathname)) return "Studio"
  if (pathname.startsWith("/profile")) return "Profile"
  if (pathname.startsWith("/r/")) return "Recipe"
  if (pathname.startsWith("/u/")) return "Creator"
  if (pathname.startsWith("/signin")) return "Log in"
  if (pathname.startsWith("/credits")) return "Credits"
  if (pathname.startsWith("/privacy")) return "Privacy"
  if (pathname.startsWith("/terms")) return "Terms"
  return "Ai Recipy"
}
