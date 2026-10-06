"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  CircleDollarSignIcon,
  LayoutGridIcon,
  LibraryBigIcon,
  ListIcon,
  ReceiptIcon,
  SettingsIcon,
  SparklesIcon,
  StoreIcon,
  UserIcon,
} from "lucide-react"

import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { useSellerData } from "@/components/dashboard/use-seller-data"
import { EmptyState } from "@/components/shared/empty-state"
import { PageHeader } from "@/components/shell/page-container"
import { useRequireUser } from "@/hooks/use-require-user"
import { cn } from "@/lib/utils"

const NAV = [
  { href: "/profile", label: "Profile", icon: UserIcon },
  { href: "/profile/library", label: "Library", icon: LibraryBigIcon },
  { href: "/profile/settings", label: "Settings", icon: SettingsIcon },
  { href: "/profile/overview", label: "Overview", icon: LayoutGridIcon, seller: true },
  { href: "/profile/listings", label: "Listings", icon: ListIcon, seller: true },
  { href: "/profile/sales", label: "Sales", icon: ReceiptIcon, seller: true },
  { href: "/profile/payouts", label: "Payouts", icon: CircleDollarSignIcon, seller: true },
]

export function ProfileShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { ready, user, sampleData, setSampleData } = useRequireUser()
  const { hasData } = useSellerData()
  const current = NAV.find((n) => n.href === pathname)
  // Profile, Library and Settings are for everyone; the rest are seller tools
  const sellerPage = !!current?.seller
  const isProfile = pathname === "/profile"

  let content = children
  if (!ready || !user) {
    content = <ProfileSkeleton />
  } else if (sellerPage && !user.isSeller) {
    content = (
      <EmptyState
        icon={StoreIcon}
        title="Become a seller"
        description="Set up payouts once, then publish your first recipe."
        action={{ label: "Start selling", href: "/sell" }}
        className="mx-0 mt-4"
      />
    )
  } else if (sellerPage && !hasData) {
    content = (
      <EmptyState
        icon={SparklesIcon}
        title="Publish your first recipe"
        description="Your sales, earnings and payouts will show up here."
        action={{ label: "Create a listing", href: "/sell" }}
        className="mx-0 mt-4"
      />
    )
  }

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
      <aside className="lg:w-56 lg:shrink-0">
        <nav
          aria-label="Profile"
          className="no-scrollbar -mx-4 flex gap-1 overflow-x-auto px-4 lg:sticky lg:top-6 lg:mx-0 lg:flex-col lg:rounded-xl lg:bg-sidebar lg:p-3 lg:ring-1 lg:ring-foreground/10"
        >
          {NAV.map((item, i) => {
            const active = pathname === item.href
            const firstSeller = item.seller && !NAV[i - 1]?.seller
            const Icon = item.icon
            return (
              <React.Fragment key={item.href}>
                {firstSeller && (
                  <span className="label-caps hidden px-4 pt-4 pb-1 lg:block" aria-hidden>
                    Selling
                  </span>
                )}
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex shrink-0 items-center gap-3 rounded-full px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50",
                    "max-lg:bg-card max-lg:ring-1 max-lg:ring-foreground/10",
                    active &&
                      "bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground max-lg:bg-sidebar-accent max-lg:ring-transparent"
                  )}
                >
                  <Icon className="size-4" aria-hidden />
                  {item.label}
                </Link>
              </React.Fragment>
            )
          })}
        </nav>
      </aside>

      <div className="min-w-0 flex-1">
        {/* The Profile page's header card is its own title */}
        {!isProfile && (
          <PageHeader
            title={current?.label ?? "Profile"}
            description={user ? `Signed in as @${user.username}` : undefined}
          >
            {ready && user?.isSeller && sellerPage && (
              <div className="flex items-center gap-3 self-start rounded-full bg-card py-2 pr-2 pl-4 ring-1 ring-foreground/10 md:self-auto">
                <Label htmlFor="sample-data" className="text-sm text-muted-foreground">
                  Sample data
                </Label>
                <Switch id="sample-data" checked={sampleData} onCheckedChange={setSampleData} />
              </div>
            )}
          </PageHeader>
        )}
        {content}
      </div>
    </div>
  )
}

export function ProfileSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-3" role="status" aria-label="Loading">
      <Skeleton className="h-96 rounded-xl xl:col-span-2" />
      <Skeleton className="h-96 rounded-xl" />
      <Skeleton className="h-72 rounded-xl xl:col-span-2" />
      <Skeleton className="h-72 rounded-xl" />
    </div>
  )
}
