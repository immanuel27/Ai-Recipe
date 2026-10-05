"use client"

import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { InsetPanel, Stat } from "@/components/shared/inset-panel"
import { useAppStore } from "@/components/providers/app-store"
import { PLATFORM_FEE, formatPrice } from "@/lib/format"

export function ClaimableCard({ gross }: { gross: number }) {
  const { payoutThreshold } = useAppStore()
  const fee = Math.round(gross * PLATFORM_FEE)
  const net = gross - fee
  const ready = net > 0 && net >= payoutThreshold.amount * 100

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-3">
        <Stat label="Claimable balance" value={formatPrice(net, { free: false })} size="lg" />
        <Badge
          className={
            ready ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"
          }
        >
          {ready ? "Ready to claim" : "Below threshold"}
        </Badge>
      </CardHeader>
      <CardContent>
        <InsetPanel>
          <dl className="flex flex-col gap-3 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Gross sales</dt>
              <dd className="font-medium tabular-nums">{formatPrice(gross, { free: false })}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Platform fee ({PLATFORM_FEE * 100}%)</dt>
              <dd className="font-medium tabular-nums">−{formatPrice(fee, { free: false })}</dd>
            </div>
            <Separator />
            <div className="flex justify-between gap-3">
              <dt className="font-semibold">Total ready to claim</dt>
              <dd className="font-bold tabular-nums">{formatPrice(net, { free: false })}</dd>
            </div>
          </dl>
        </InsetPanel>
      </CardContent>
      <CardFooter className="flex-col items-stretch gap-2">
        <Button
          size="pill"
          className="w-full"
          disabled={!ready}
          onClick={() => toast.success(`Payout of ${formatPrice(net, { free: false })} requested`)}
        >
          Claim balance
        </Button>
        {!ready && (
          <p className="text-center text-xs text-muted-foreground">
            Claimable once you reach your {formatPrice(payoutThreshold.amount * 100, { free: false })}{" "}
            threshold.
          </p>
        )}
      </CardFooter>
    </Card>
  )
}
