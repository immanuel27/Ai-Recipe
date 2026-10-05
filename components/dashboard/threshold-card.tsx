"use client"

import * as React from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { useAppStore } from "@/components/providers/app-store"

const CURRENCIES = ["USD", "EUR", "GBP"] as const
type Currency = (typeof CURRENCIES)[number]
const MIN = 10
const MAX = 1000

function money(amount: number, currency: Currency) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function ThresholdCard() {
  const { payoutThreshold, setPayoutThreshold } = useAppStore()
  const [currency, setCurrency] = React.useState<Currency>(payoutThreshold.currency)
  const [amount, setAmount] = React.useState(payoutThreshold.amount)
  const dirty = currency !== payoutThreshold.currency || amount !== payoutThreshold.amount

  return (
    <Card>
      <CardHeader className="gap-1">
        <span className="label-caps">Payout threshold</span>
        <CardDescription>We pay out automatically once your balance reaches this.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <Label htmlFor="currency">Currency</Label>
          <Select value={currency} onValueChange={(v) => setCurrency(v as Currency)}>
            <SelectTrigger id="currency" className="h-11! w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CURRENCIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex items-end justify-between">
            <Label id="threshold-label">Threshold</Label>
            <output
              htmlFor="threshold"
              className="text-3xl font-bold tracking-tight tabular-nums"
              aria-live="polite"
            >
              {money(amount, currency)}
            </output>
          </div>
          <Slider
            id="threshold"
            min={MIN}
            max={MAX}
            step={10}
            value={[amount]}
            onValueChange={([v]) => setAmount(v ?? MIN)}
            aria-labelledby="threshold-label"
          />
          <div className="flex justify-between text-xs text-muted-foreground tabular-nums">
            <span>{money(MIN, currency)}</span>
            <span>{money(MAX, currency)}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          size="pill"
          className="w-full"
          disabled={!dirty}
          onClick={() => {
            setPayoutThreshold({ currency, amount })
            toast.success(`Threshold saved: ${money(amount, currency)}`)
          }}
        >
          Save threshold
        </Button>
      </CardFooter>
    </Card>
  )
}
