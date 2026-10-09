"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { FacebookIcon, InstagramIcon, LinkedInIcon, XBrandIcon } from "@/components/icons"
import { BRAND, SOCIAL_LINKS } from "@/lib/brand"
import { cn } from "@/lib/utils"

const LINKS = [
  { label: "Explore", href: "/explore" },
  { label: "Videos", href: "/explore?type=video" },
  { label: "Images", href: "/explore?type=image" },
  { label: "Websites", href: "/explore?type=website" },
  { label: "Start selling", href: "/sell" },
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
  { label: "Media credits", href: "/credits" },
]

const SOCIAL = [
  { label: "Facebook", href: SOCIAL_LINKS.facebook, icon: FacebookIcon },
  { label: "Instagram", href: SOCIAL_LINKS.instagram, icon: InstagramIcon },
  { label: "X", href: SOCIAL_LINKS.x, icon: XBrandIcon },
  { label: "LinkedIn", href: SOCIAL_LINKS.linkedin, icon: LinkedInIcon },
]

const link = "rounded-sm outline-none transition-colors duration-160 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"

/** Quiet site links: in Home's sidebar and at the foot of other pages. */
export function SiteLinks({ className, align = "start" }: { className?: string; align?: "start" | "center" }) {
  return (
    <div className={cn("flex flex-col gap-4 type-meta text-foreground/80", align === "center" && "items-center", className)}>
      <ul className={cn("flex flex-wrap gap-x-4 gap-y-2", align === "center" && "justify-center")}>
        {LINKS.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className={link}>
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
      <div className="flex items-center gap-4">
        <ul className="flex items-center gap-3">
          {SOCIAL.map(({ label, href, icon: Icon }) => (
            <li key={label}>
              <a href={href} target="_blank" rel="noreferrer" aria-label={label} className={cn(link, "flex")}>
                <Icon aria-hidden className="size-4" />
              </a>
            </li>
          ))}
        </ul>
        <span>
          © {new Date().getFullYear()} {BRAND.name}
        </span>
      </div>
    </div>
  )
}

export function SiteFooter() {
  const pathname = usePathname()
  // Discover is a full-canvas reel; New recipe is a focused flow
  if (pathname === "/" || pathname.startsWith("/sell")) return null
  return (
    <footer className="relative flex justify-center px-3 pt-16 pb-6">
      {/* Dark glass keeps the links readable over the brightest part of the glow */}
      <SiteLinks align="center" className="glass rounded-3xl px-6 py-4" />
    </footer>
  )
}
