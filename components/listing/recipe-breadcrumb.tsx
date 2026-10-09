"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"

import { BackIcon, CaretRightIcon } from "@/components/icons"
import { ToolLogo } from "@/components/shared/tool-logo"
import { exploreHref } from "@/lib/explore-params"
import { getToolName } from "@/lib/mock/tools"
import type { Listing } from "@/lib/types"

/** Back to wherever you came from, plus where this recipe sits: Explore › tool › recipe. */
export function RecipeBreadcrumb({ listing }: { listing: Listing }) {
  const router = useRouter()

  function back() {
    // A direct visit has nothing in-app to go back to, so land on Explore
    if (window.history.length > 1 && document.referrer.startsWith(window.location.origin)) router.back()
    else router.push("/explore")
  }

  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        onClick={back}
        aria-label="Back"
        className="glass-button flex size-11 shrink-0 items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <BackIcon aria-hidden className="size-5" />
      </button>
      <nav aria-label="Breadcrumb" className="min-w-0">
        <ol className="flex min-w-0 items-center gap-2 type-body text-muted-foreground">
          <li className="shrink-0">
            <Link href="/explore" className="rounded-sm outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring">
              Explore
            </Link>
          </li>
          <li aria-hidden className="shrink-0">
            <CaretRightIcon className="size-4" />
          </li>
          <li className="shrink-0">
            <Link
              href={exploreHref({ type: "all", tool: listing.tool })}
              className="flex items-center gap-2 rounded-sm outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
            >
              <ToolLogo tool={listing.tool} className="size-4" />
              {getToolName(listing.tool)}
            </Link>
          </li>
          <li aria-hidden className="shrink-0">
            <CaretRightIcon className="size-4" />
          </li>
          <li className="min-w-0">
            <span aria-current="page" className="block truncate font-semibold text-foreground">
              {listing.title}
            </span>
          </li>
        </ol>
      </nav>
    </div>
  )
}
