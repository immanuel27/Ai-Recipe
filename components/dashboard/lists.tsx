"use client"

import * as React from "react"
import Link from "next/link"
import { PencilIcon, ReceiptIcon, Trash2Icon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DeletePostDialog } from "@/components/listing/delete-post-dialog"
import { useAppStore } from "@/components/providers/app-store"
import { InsetPanel } from "@/components/shared/inset-panel"
import { MediaImage } from "@/components/shared/media-image"
import { formatCompact, formatDate, formatPrice, formatRelative } from "@/lib/format"
import type { Listing, Sale } from "@/lib/types"

function Thumb({ src, alt = "" }: { src?: string; alt?: string }) {
  return (
    <div className="relative size-11 shrink-0 overflow-hidden rounded-md bg-muted">
      {src && <MediaImage src={src} alt={alt} fill sizes="44px" className="object-cover" />}
    </div>
  )
}

function EmptyRow({ children }: { children: React.ReactNode }) {
  return (
    <InsetPanel className="flex items-center gap-3 text-sm text-muted-foreground">
      <ReceiptIcon className="size-4" aria-hidden />
      {children}
    </InsetPanel>
  )
}

export function RecentSalesCard({
  sales,
  listings,
  limit,
}: {
  sales: Sale[]
  listings: Listing[]
  limit?: number
}) {
  const rows = limit ? sales.slice(0, limit) : sales

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Recent sales</CardTitle>
        <CardDescription>Who bought what, newest first.</CardDescription>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <EmptyRow>No sales yet. Share your listing to get the first one.</EmptyRow>
        ) : (
          <ul className="-mx-2 flex flex-col">
            {rows.map((s) => {
              const listing = listings.find((l) => l.slug === s.listingSlug)
              return (
                <li key={s.id} className="flex items-center gap-3 rounded-lg px-2 py-2.5">
                  <Thumb src={listing?.posterUrl} />
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-sm font-semibold">@{s.buyer}</span>
                    <span className="truncate text-sm text-muted-foreground">
                      {listing?.title ?? s.listingSlug}
                    </span>
                  </div>
                  <div className="flex shrink-0 flex-col items-end">
                    <span className="text-sm font-bold tabular-nums">
                      {formatPrice(s.price)}
                    </span>
                    <time dateTime={s.date} className="text-xs text-muted-foreground">
                      {formatRelative(s.date)}
                    </time>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}

export function MyListingsCard({ listings }: { listings: Listing[] }) {
  const [deleting, setDeleting] = React.useState<Listing | null>(null)
  // Sample listings (demo data) can't be edited or deleted
  const { createdListings } = useAppStore()
  const mine = new Set(createdListings.map((l) => l.slug))
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">My listings</CardTitle>
        <CardDescription>
          {listings.length} {listings.length === 1 ? "recipe" : "recipes"} published
        </CardDescription>
      </CardHeader>
      <CardContent>
        {listings.length === 0 ? (
          <EmptyRow>No listings yet.</EmptyRow>
        ) : (
          <ul className="-mx-2 flex flex-col">
            {listings.map((l) => (
              <li
                key={l.id}
                className="flex items-center gap-3 rounded-lg px-2 py-2.5 hover:bg-muted/60"
              >
                <Thumb src={l.posterUrl} />
                <div className="flex min-w-0 flex-1 flex-col">
                  <Link
                    href={`/r/${l.slug}`}
                    className="truncate rounded-sm text-sm font-semibold outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    {l.title}
                  </Link>
                  <span className="truncate text-xs text-muted-foreground tabular-nums">
                    {formatCompact(l.stats.views)} views · {formatCompact(l.stats.likes)} likes ·{" "}
                    {formatCompact(l.stats.sales)} sales ·{" "}
                    {formatDate(l.createdAt)}
                  </span>
                </div>
                {l.pricing.mode === "bundle" && (
                  <Badge variant="secondary" className="hidden sm:inline-flex">
                    Bundle
                  </Badge>
                )}
                <span className="shrink-0 text-sm font-bold tabular-nums">
                  {formatPrice(l.price)}
                </span>
                {mine.has(l.slug) && (
                  <>
                    <Button asChild variant="ghost" size="icon-sm">
                      <Link href={`/r/${l.slug}/edit`} aria-label={`Edit ${l.title}`}>
                        <PencilIcon />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Delete ${l.title}`}
                      className="text-destructive hover:text-destructive"
                      onClick={() => setDeleting(l)}
                    >
                      <Trash2Icon />
                    </Button>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
        {deleting && (
          <DeletePostDialog
            listing={deleting}
            open
            onOpenChange={(open) => !open && setDeleting(null)}
          />
        )}
        {deleting && (
          <DeletePostDialog
            listing={deleting}
            open
            onOpenChange={(open) => !open && setDeleting(null)}
          />
        )}
      </CardContent>
    </Card>
  )
}
