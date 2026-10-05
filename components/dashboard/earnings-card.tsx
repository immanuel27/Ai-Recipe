"use client"

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { InsetPanel, Stat } from "@/components/shared/inset-panel"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { formatDate, formatPrice } from "@/lib/format"
import type { MonthlyEarning } from "@/lib/types"

const chartConfig = {
  earnings: { label: "Earnings", color: "var(--chart-1)" },
} satisfies ChartConfig

export function EarningsCard({
  earnings,
  nextPayout,
}: {
  earnings: MonthlyEarning[]
  nextPayout: { date: string; amount: number } | null
}) {
  const reducedMotion = usePrefersReducedMotion()
  const total = earnings.reduce((s, m) => s + m.earnings, 0)
  const thisMonth = earnings.at(-1)
  const data = earnings.map((m) => ({ month: m.month, earnings: m.earnings / 100 }))

  return (
    <Card>
      <CardHeader>
        <Stat
          label="Earnings"
          value={formatPrice(total, { free: false })}
          hint="Net, last 6 months"
          size="lg"
        />
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-52 w-full"
          role="img"
          aria-label={`Monthly earnings: ${earnings
            .map((m) => `${m.month} ${formatPrice(m.earnings, { free: false })}`)
            .join(", ")}`}
        >
          <BarChart data={data} margin={{ left: 0, right: 0, top: 8 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
            <ChartTooltip
              cursor={{ fill: "var(--muted)" }}
              content={
                <ChartTooltipContent
                  hideLabel
                  formatter={(value) => (
                    <span className="font-semibold tabular-nums">
                      {formatPrice(Number(value) * 100, { free: false })}
                    </span>
                  )}
                />
              }
            />
            <Bar
              dataKey="earnings"
              fill="var(--color-earnings)"
              radius={[8, 8, 8, 8]}
              maxBarSize={48}
              isAnimationActive={!reducedMotion}
            />
          </BarChart>
        </ChartContainer>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <InsetPanel>
            <Stat
              label="Next payout"
              value={nextPayout ? formatPrice(nextPayout.amount, { free: false }) : "None"}
              hint={nextPayout ? formatDate(nextPayout.date) : "Once you make a sale"}
            />
          </InsetPanel>
          <InsetPanel>
            <Stat
              label="This month"
              value={thisMonth?.sales ?? 0}
              hint={`${thisMonth?.sales === 1 ? "sale" : "sales"} in ${thisMonth?.month ?? ""}`}
            />
          </InsetPanel>
        </div>
      </CardContent>
    </Card>
  )
}
