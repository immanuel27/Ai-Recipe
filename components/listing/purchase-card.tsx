import Link from "next/link"
import { CheckIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { CreatorAvatar } from "@/components/shared/creator-avatar"
import { LikeButton } from "@/components/shared/like-button"
import { ToolBadge } from "@/components/shared/tool-badge"
import { formatCompact, formatPrice } from "@/lib/format"
import { profileHref } from "@/lib/profile"
import type { Creator, Listing } from "@/lib/types"
import { VerifiedBadge } from "@/components/shared/verified-badge"
import { DeleteIcon, EditIcon, OpenIcon, WebsiteIcon } from "@/components/icons"
import { getToolName, listingTools } from "@/lib/mock/tools"
import { PAYMENTS_ENABLED } from "@/lib/flags"

export function PurchaseCard({
  listing,
  creator,
  unlocked,
  proofUrl,
  isOwner,
  onDelete,
  onBuy,
}: {
  listing: Listing
  creator: Creator
  unlocked: boolean
  /** Your own post: show Edit and Delete */
  isOwner?: boolean
  onDelete?: () => void
  /** The creator's share link from the tool, for owners and buyers */
  proofUrl?: string | null
  onBuy: () => void
}) {
  const free = listing.price === 0

  return (
    <Card>
      <CardContent className="flex flex-col gap-5">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <ToolBadge tools={listingTools(listing)} />
              {listing.isAdult && (
                <Badge variant="outline" aria-label="Adult content">
                  18+
                </Badge>
              )}
            </div>
            <LikeButton listing={listing} />
          </div>
          {listing.verified && <VerifiedBadge tool={listing.tool} />}
          <h1 className="text-2xl leading-tight font-bold tracking-tight text-balance">
            {listing.title}
          </h1>
          <p className="text-sm text-muted-foreground">{listing.description}</p>
          {listing.liveUrl && (
            <a
              href={listing.liveUrl}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="inline-flex items-center gap-1.5 self-start text-sm font-semibold text-primary underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
            >
              <WebsiteIcon className="size-4" aria-hidden />
              Visit the live site
              <OpenIcon className="size-3.5" aria-hidden />
            </a>
          )}
        </div>

        <Link
          href={profileHref(creator.username)}
          className="flex items-center gap-3 self-start rounded-full pr-3 outline-none hover:[&_.name]:underline focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <CreatorAvatar creator={creator} className="size-10" />
          <div className="flex min-w-0 flex-col">
            <span className="name truncate font-semibold">{creator.displayName}</span>
            <span className="truncate text-sm text-muted-foreground">@{creator.username}</span>
          </div>
        </Link>

        <div className="flex items-end justify-between gap-4">
          {PAYMENTS_ENABLED ? (
            <div className="flex flex-col gap-1">
              <span className="label-caps">Price</span>
              <span className="text-5xl font-bold tracking-tight tabular-nums">
                {formatPrice(listing.price)}
              </span>
            </div>
          ) : (
            <span className="label-caps">Free recipe</span>
          )}
          {unlocked ? (
            <Badge className="mb-2 bg-success/15 text-success">
              <CheckIcon aria-hidden />
              Unlocked
            </Badge>
          ) : (
            listing.stats.sales > 0 && (
              <span className="mb-2 text-sm text-muted-foreground">
                {formatCompact(listing.stats.sales)} {PAYMENTS_ENABLED ? "sold" : "unlocked"}
              </span>
            )
          )}
        </div>
      </CardContent>
      <CardFooter className="flex-col items-stretch gap-3">
        {unlocked ? (
          <Button asChild size="pill" className="w-full">
            <Link href="#recipe">View full recipe</Link>
          </Button>
        ) : (
          <Button size="pill" className="w-full" onClick={onBuy}>
            {free ? "Get for free" : "Buy recipe"}
          </Button>
        )}
        <p className="text-center text-xs text-muted-foreground">
          Includes prompts, settings, assets, edit stack and failed attempts.
        </p>
        {isOwner && !listing.archived && (
          <div className="flex gap-2 border-t pt-3">
            <Button asChild variant="ghost" size="sm" className="flex-1">
              <Link href={`/r/${listing.slug}/edit`}>
                <EditIcon aria-hidden />
                Edit post
              </Link>
            </Button>
            <Button variant="ghost" size="sm" className="flex-1 text-destructive hover:text-destructive" onClick={onDelete}>
              <DeleteIcon aria-hidden />
              Delete
            </Button>
          </div>
        )}
        {unlocked && proofUrl && (
          <a
            href={proofUrl}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="inline-flex items-center justify-center gap-1 text-xs font-semibold text-primary underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
          >
            See the original on {getToolName(listing.tool)}
            <OpenIcon className="size-3" aria-hidden />
          </a>
        )}
      </CardFooter>
    </Card>
  )
}
