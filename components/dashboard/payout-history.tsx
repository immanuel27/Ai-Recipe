import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { InsetPanel } from "@/components/shared/inset-panel"
import { formatPrice } from "@/lib/format"
import type { MonthlyEarning } from "@/lib/types"

export function PayoutHistoryCard({ earnings }: { earnings: MonthlyEarning[] }) {
  // Completed months are paid out on the 15th of the following month
  const paid = earnings.slice(0, -1).filter((m) => m.earnings > 0).reverse()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Payout history</CardTitle>
        <CardDescription>Paid on the 15th of the following month.</CardDescription>
      </CardHeader>
      <CardContent>
        {paid.length === 0 ? (
          <InsetPanel className="text-sm text-muted-foreground">No payouts yet.</InsetPanel>
        ) : (
          <ul className="flex flex-col divide-y divide-border">
            {paid.map((m) => (
              <li key={m.month} className="flex items-center justify-between gap-3 py-3">
                <div className="flex flex-col">
                  <span className="text-sm font-semibold">{m.month} earnings</span>
                  <span className="text-xs text-muted-foreground">{m.sales} sales</span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className="bg-success/15 text-success">Paid</Badge>
                  <span className="text-sm font-bold tabular-nums">
                    {formatPrice(m.earnings, { free: false })}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
