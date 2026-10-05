"use client"

import * as React from "react"
import { Loader2Icon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { InsetPanel } from "@/components/shared/inset-panel"
import { MediaImage } from "@/components/shared/media-image"
import { formatPrice } from "@/lib/format"
import type { Listing } from "@/lib/types"

/** Fake checkout: confirms the price, then unlocks locally. No real payment. */
export function BuyDialog({
  listing,
  open,
  onOpenChange,
  onConfirm,
}: {
  listing: Listing
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}) {
  const [processing, setProcessing] = React.useState(false)

  async function confirm() {
    setProcessing(true)
    await new Promise((r) => setTimeout(r, 700))
    setProcessing(false)
    onConfirm()
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !processing && onOpenChange(o)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Buy this recipe</DialogTitle>
          <DialogDescription>You&apos;ll get instant access to the full recipe.</DialogDescription>
        </DialogHeader>

        <InsetPanel className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="relative size-12 shrink-0 overflow-hidden rounded-md bg-background">
              <MediaImage src={listing.posterUrl} alt="" fill sizes="48px" className="object-cover" />
            </div>
            <span className="line-clamp-2 font-medium">{listing.title}</span>
          </div>
          <Separator />
          <dl className="flex flex-col gap-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Recipe</dt>
              <dd className="tabular-nums">{formatPrice(listing.price)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Service fee</dt>
              <dd className="tabular-nums">{formatPrice(0, { free: false })}</dd>
            </div>
          </dl>
          <Separator />
          <div className="flex items-end justify-between">
            <span className="label-caps">Total</span>
            <span className="text-3xl font-bold tracking-tight tabular-nums">
              {formatPrice(listing.price)}
            </span>
          </div>
        </InsetPanel>

        <DialogFooter className="flex-col gap-3 sm:flex-col">
          <Button size="pill" className="w-full" onClick={confirm} disabled={processing}>
            {processing && <Loader2Icon className="animate-spin" aria-hidden />}
            {processing ? "Processing…" : `Pay ${formatPrice(listing.price)}`}
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            Demo checkout. No payment is taken.
          </p>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
