"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { LogoMark } from "@/components/shell/logo-mark"
import {
  FacebookIcon,
  InstagramIcon,
  LinkedInIcon,
  XIcon,
} from "@/components/shell/social-icons"
import { BRAND, SOCIAL_LINKS } from "@/lib/brand"

const linkClass =
  "flex items-center gap-2 rounded-sm text-sm text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"

const COLUMNS = [
  {
    title: "Explore",
    links: [
      { label: "Feed", href: "/" },
      { label: "Explore recipes", href: "/explore" },
      { label: "Videos", href: "/explore?type=video" },
      { label: "Images", href: "/explore?type=image" },
      { label: "Start selling", href: "/sell" },
      { label: "Your profile", href: "/profile" },
    ],
  },
  {
    title: "Follow us",
    links: [
      { label: "Facebook", href: SOCIAL_LINKS.facebook, icon: FacebookIcon },
      { label: "Instagram", href: SOCIAL_LINKS.instagram, icon: InstagramIcon },
      { label: "X (Twitter)", href: SOCIAL_LINKS.x, icon: XIcon },
      { label: "LinkedIn", href: SOCIAL_LINKS.linkedin, icon: LinkedInIcon },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy policy", href: "/privacy" },
      { label: "Terms of use", href: "/terms" },
      { label: "Media credits", href: "/credits" },
    ],
  },
]

export function SiteFooter() {
  const pathname = usePathname()
  // The feed is a full-screen experience
  if (pathname === "/") return null

  return (
    <footer className="mt-auto border-t border-border bg-card/60">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-10 px-4 pt-12 pb-10 md:grid-cols-4 md:px-6">
        <div className="col-span-2 flex flex-col gap-3 md:col-span-1">
          <Link
            href="/"
            className="flex items-center gap-2 self-start rounded-full text-primary outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <LogoMark />
            <span className="text-xl font-bold tracking-tight">{BRAND.name}</span>
          </Link>
          <p className="max-w-60 text-sm text-muted-foreground">{BRAND.tagline}</p>
        </div>
        {COLUMNS.map((col) => (
          <nav key={col.title} aria-label={col.title} className="flex flex-col gap-4">
            <h2 className="text-sm font-semibold">{col.title}</h2>
            <ul className="flex flex-col gap-3">
              {col.links.map((l) => {
                const Icon = "icon" in l ? l.icon : null
                const external = l.href.startsWith("http")
                return (
                  <li key={l.label}>
                    {external ? (
                      <a href={l.href} target="_blank" rel="noreferrer" className={linkClass}>
                        {Icon && <Icon className="size-4" />}
                        {l.label}
                      </a>
                    ) : (
                      <Link href={l.href} className={linkClass}>
                        {l.label}
                      </Link>
                    )}
                  </li>
                )
              })}
            </ul>
          </nav>
        ))}
      </div>
      <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
        <p className="border-t border-border pt-6 pb-28 text-center text-xs text-muted-foreground md:pb-8">
          © {new Date().getFullYear()} {BRAND.name}. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
