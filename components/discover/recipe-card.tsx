"use client"

import * as React from "react"
import Link from "next/link"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  EditStackIcon,
  ImageMissingIcon,
  LockIcon,
  PromptsIcon,
  RecipeSettingsIcon,
} from "@/components/icons"
import { BuyDialog } from "@/components/listing/buy-dialog"
import { useOwnedRecipe } from "@/components/shared/use-owned-recipe"
import { useAppStore, userCreatorId } from "@/components/providers/app-store"
import { MediaImage } from "@/components/shared/media-image"
import { RecipeStep as Step, TeaserSnippet } from "@/components/shared/recipe-steps"
import { ToolBadge } from "@/components/shared/tool-badge"
import { formatCompact, formatPrice } from "@/lib/format"
import type { Listing } from "@/lib/types"
import { cn } from "@/lib/utils"
import { AiTagBadge } from "@/components/shared/ai-tag-badge"
import { VerifiedBadge } from "@/components/shared/verified-badge"

/** Fanned like prints; they spread a little more on hover. */
const TAKE_REST = ["-rotate-6", "rotate-1", "rotate-7"]
const TAKE_SPREAD = [
  "group-hover/takes:-translate-x-1 group-hover/takes:-rotate-12",
  "group-hover/takes:-translate-y-1",
  "group-hover/takes:translate-x-1 group-hover/takes:rotate-12",
]

/** What you're buying with a shot: its recipe, what's locked, and the unlock. */
export function RecipeCard({ listing: baseListing, className }: { listing: Listing; className?: string }) {
  const { user, purchased, purchase } = useAppStore()
  const [buying, setBuying] = React.useState(false)
  const owned =
    purchased.includes(baseListing.slug) || (!!user && baseListing.creatorId === userCreatorId(user.username))
  // Swap in the full recipe from Supabase once it's theirs
  const listing = useOwnedRecipe(baseListing, owned)
  const { prompts, settings, editStack, failures } = listing.recipe

  function unlock() {
    if (listing.price === 0) {
      purchase(listing.slug)
      toast.success("Recipe unlocked")
    } else {
      setBuying(true)
    }
  }

  return (
    <section aria-label={`Recipe for ${listing.title}`} className={cn("glass flex flex-col gap-6 rounded-3xl p-6", className)}>
      <header className="flex shrink-0 flex-col gap-2">
        <div className="flex items-center justify-between gap-3">
          <p className="type-meta text-muted-foreground">The recipe</p>
          <ToolBadge tool={listing.tool} version={listing.toolVersion} />
        </div>
        <h2 className="type-section text-balance">{listing.title}</h2>
        {(listing.verified || listing.aiTag) && (
          <div className="flex flex-wrap gap-2">
            {listing.verified && <VerifiedBadge tool={listing.tool} />}
            {listing.aiTag && <AiTagBadge tag={listing.aiTag} showSource />}
          </div>
        )}
      </header>

      <ol className="-mx-2 flex min-h-0 flex-col gap-5 overflow-y-auto px-2">
        <Step n={1} icon={PromptsIcon} label="Prompts" count={prompts.length}>
          {owned ? (
            <p className="line-clamp-3 type-meta text-muted-foreground">{prompts[0]?.text}</p>
          ) : (
            <TeaserSnippet text={prompts[0]?.text ?? ""} />
          )}
        </Step>
        <Step n={2} icon={RecipeSettingsIcon} label="Settings and seeds" count={settings.length}>
          <ul className="flex flex-wrap gap-2">
            {settings.slice(0, 4).map((s) => (
              <li key={s.key} className="rounded-md bg-dock px-2 py-1 type-meta">
                <span className="text-muted-foreground">{s.key}</span>{" "}
                <span className="font-semibold">{owned ? s.value : "••••"}</span>
              </li>
            ))}
          </ul>
        </Step>
        <Step n={3} icon={EditStackIcon} label="Edit steps" count={editStack.length}>
          <p className="type-meta text-muted-foreground">{[...new Set(editStack.map((e) => e.tool))].join(", ")}</p>
        </Step>
        <Step n={4} icon={ImageMissingIcon} label="Failed takes" count={failures.length} last>
          <div className="group/takes flex items-center gap-4">
            <ul className="flex shrink-0 items-center pl-1">
              {failures.slice(0, 3).map((f, i, shown) => (
                <li
                  key={i}
                  style={{ zIndex: shown.length - i }}
                  className={cn(
                    "relative size-12 overflow-hidden rounded-xl bg-dock shadow-md ring-2 ring-canvas transition-transform duration-240 ease-standard not-first:-ml-4",
                    TAKE_REST[i],
                    TAKE_SPREAD[i]
                  )}
                >
                  {f.imageUrl && (
                    <MediaImage
                      src={f.imageUrl}
                      alt={owned ? f.note : ""}
                      fill
                      sizes="48px"
                      className={cn("object-cover", !owned && "scale-125 blur-sm saturate-50")}
                    />
                  )}
                  {!owned && <span aria-hidden className="absolute inset-0 bg-scrim/25" />}
                  {i === shown.length - 1 && failures.length > shown.length && (
                    <span className="absolute inset-0 flex items-center justify-center bg-scrim/55 type-meta font-semibold text-on-media">
                      +{failures.length - shown.length}
                    </span>
                  )}
                </li>
              ))}
            </ul>
            {owned ? (
              <p className="line-clamp-2 type-meta text-muted-foreground">{failures[0]?.note}</p>
            ) : (
              <p className="flex items-center gap-2 type-meta text-muted-foreground">
                <LockIcon aria-hidden weight="fill" className="size-3.5 shrink-0" />
                What went wrong unlocks with the recipe
              </p>
            )}
          </div>
        </Step>
      </ol>

      <footer className="flex shrink-0 flex-col gap-4 border-t border-glass-border pt-5">
        <div className="flex items-baseline justify-between gap-4">
          <span className="type-title tabular-nums">{formatPrice(listing.price)}</span>
          <span className="type-meta text-muted-foreground">
            Unlocked by {formatCompact(listing.stats.sales)}
          </span>
        </div>
        {owned ? (
          <Button asChild size="pill" className="w-full">
            <Link href={`/r/${listing.slug}`}>View full recipe</Link>
          </Button>
        ) : (
          <Button size="pill" className="w-full" onClick={unlock}>
            {listing.price === 0 ? "Get free recipe" : "Unlock recipe"}
          </Button>
        )}
      </footer>

      <BuyDialog
        listing={listing}
        open={buying}
        onOpenChange={setBuying}
        onConfirm={() => {
          purchase(listing.slug)
          setBuying(false)
          toast.success("Recipe unlocked")
        }}
      />
    </section>
  )
}
