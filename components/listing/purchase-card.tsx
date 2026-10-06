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
import { AiTagBadge } from "@/components/shared/ai-tag-badge"

export function PurchaseCard({
  listing,
  creator,
  unlocked,
  onBuy,
}: {
  listing: Listing
  creator: Creator
  unlocked: boolean
  onBuy: () => void
}) {
  const free = listing.price === 0

  return (
    <Card>
      <CardContent className="flex flex-col gap-5">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <ToolBadge tool={listing.tool} version={listing.toolVersion} />
              {listing.isAdult && (
                <Badge variant="outline" aria-label="Adult content">
                  18+
                </Badge>
              )}
            </div>
            <LikeButton listing={listing} />
          </div>
          {listing.aiTag && <AiTagBadge tag={listing.aiTag} showSource />}
          <h1 className="text-2xl leading-tight font-bold tracking-tight text-balance">
            {listing.title}
          </h1>
          <p className="text-sm text-muted-foreground">{listing.description}</p>
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
          <div className="flex flex-col gap-1">
            <span className="label-caps">Price</span>
            <span className="text-5xl font-bold tracking-tight tabular-nums">
              {formatPrice(listing.price)}
            </span>
          </div>
          {unlocked ? (
            <Badge className="mb-2 bg-success/15 text-success">
              <CheckIcon aria-hidden />
              Unlocked
            </Badge>
          ) : (
            listing.stats.sales > 0 && (
              <span className="mb-2 text-sm text-muted-foreground">
                {formatCompact(listing.stats.sales)} sold
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
      </CardFooter>
    </Card>
  )
}
