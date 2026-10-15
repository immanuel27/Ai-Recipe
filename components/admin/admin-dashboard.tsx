"use client"

import * as React from "react"
import Link from "next/link"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import { toast } from "sonner"

import {
  CreateIcon,
  CreatorsIcon,
  LikeIcon,
  LockIcon,
  OpenIcon,
  SpinnerIcon,
  VerifiedIcon,
  type IconType,
} from "@/components/icons"
import { PageHeader } from "@/components/shell/page-container"
import { EmptyState } from "@/components/shared/empty-state"
import { InsetPanel, Stat } from "@/components/shared/inset-panel"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { useRequireUser } from "@/hooks/use-require-user"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import {
  amIAdmin,
  fetchAdminOverview,
  setPostVerified,
  type AdminOverview,
} from "@/lib/supabase/admin"
import { formatRelative } from "@/lib/format"
import { supabaseConfigured } from "@/lib/supabase/env"

const REFRESH_MS = 30_000

const chartConfig = {
  signups: { label: "Sign-ups", color: "var(--chart-1)" },
} satisfies ChartConfig

const ACTIVITY: Record<AdminOverview["activity"][number]["kind"], { icon: IconType; verb: string }> = {
  signup: { icon: CreatorsIcon, verb: "joined" },
  post: { icon: CreateIcon, verb: "posted" },
  unlock: { icon: LockIcon, verb: "unlocked" },
  like: { icon: LikeIcon, verb: "liked" },
}

/** Private live stats for the team (the database checks who's an admin). */
export function AdminDashboard() {
  const { ready } = useRequireUser()
  const [allowed, setAllowed] = React.useState<boolean | null>(null)
  const [data, setData] = React.useState<AdminOverview | null>(null)
  const [now, setNow] = React.useState(() => new Date())

  const load = React.useCallback(async () => {
    try {
      setData(await fetchAdminOverview())
    } catch {
      // Keep showing the last numbers; the next refresh tries again
    }
  }, [])

  React.useEffect(() => {
    if (!ready || !supabaseConfigured) return
    let cancelled = false
    amIAdmin().then((ok) => {
      if (cancelled) return
      setAllowed(ok)
      if (ok) void load()
    })
    return () => {
      cancelled = true
    }
  }, [ready, load])

  React.useEffect(() => {
    if (!allowed) return
    const refresh = window.setInterval(() => {
      if (document.visibilityState === "visible") void load()
    }, REFRESH_MS)
    const tick = window.setInterval(() => setNow(new Date()), 5_000)
    return () => {
      window.clearInterval(refresh)
      window.clearInterval(tick)
    }
  }, [allowed, load])

  if (!supabaseConfigured || allowed === false) {
    return (
      <EmptyState
        icon={LockIcon}
        title="Nothing to see here"
        description="This page is only for the Ai Recipy team."
        action={{ label: "Back home", href: "/" }}
      />
    )
  }

  if (!data) {
    return (
      <div className="flex justify-center py-24 text-muted-foreground">
        <SpinnerIcon className="size-6 animate-spin" aria-label="Loading" />
      </div>
    )
  }

  const seconds = Math.max(0, Math.round((now.getTime() - new Date(data.generatedAt).getTime()) / 1000))

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Live stats" description="Only the team can see this page.">
        <p className="text-sm text-muted-foreground" aria-live="polite">
          Updated {seconds < 10 ? "just now" : `${seconds}s ago`} · refreshes every 30s
        </p>
      </PageHeader>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Online now"
          value={
            <span className="flex items-center gap-2">
              <span className="size-2.5 rounded-full bg-success" aria-hidden />
              {data.onlineNow}
            </span>
          }
          hint="Signed in, last 5 min"
        />
        <StatCard label="Active today" value={data.activeToday} hint={`${data.activeYesterday} yesterday`} />
        <StatCard label="Total users" value={data.totalUsers} hint={`${data.outsideUsers} outside the team`} />
        <StatCard label="Sign-ups today" value={data.signupsToday} hint={`${data.signupsYesterday} yesterday`} />
        <StatCard
          label="Unlocks today"
          value={data.unlocksToday}
          hint={`${data.unlocksTotal} all time · ${data.usersWhoUnlocked} people`}
        />
        <StatCard label="Likes today" value={data.likesToday} hint={`${data.likesTotal} likes · ${data.savesTotal} saves`} />
        <StatCard label="Posts today" value={data.postsToday} hint={`${data.postsTotal} real posts live`} />
        <StatCard
          label="Stuck sign-ups"
          value={data.stuckNoUsername}
          hint={`No username yet · ${data.withPhoto} have a photo`}
        />
      </div>

      <SignupsChart days={data.signupsByDay} />

      <div className="grid gap-6 lg:grid-cols-2">
        <TopPosts posts={data.topPosts} />
        <Activity items={data.activity} now={now} />
      </div>

      <PendingVerification items={data.pendingVerification} onChange={load} now={now} />
    </div>
  )
}

function StatCard({ label, value, hint }: { label: string; value: React.ReactNode; hint: string }) {
  return (
    <Card size="sm">
      <CardContent>
        <Stat label={label} value={value} hint={hint} />
      </CardContent>
    </Card>
  )
}

function SignupsChart({ days }: { days: AdminOverview["signupsByDay"] }) {
  const reducedMotion = usePrefersReducedMotion()
  const data = days.map((d) => ({
    day: new Date(`${d.day}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    signups: d.count,
  }))
  const total = days.reduce((s, d) => s + d.count, 0)

  return (
    <Card>
      <CardHeader>
        <Stat label="Sign-ups, last 14 days" value={total} />
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-56 w-full"
          role="img"
          aria-label={`Sign-ups per day: ${data.map((d) => `${d.day} ${d.signups}`).join(", ")}`}
        >
          <BarChart data={data} margin={{ left: 0, right: 0, top: 8 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} minTickGap={16} />
            <ChartTooltip
              cursor={{ fill: "var(--muted)" }}
              content={<ChartTooltipContent />}
            />
            <Bar
              dataKey="signups"
              fill="var(--color-signups)"
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
              isAnimationActive={!reducedMotion}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

function TopPosts({ posts }: { posts: AdminOverview["topPosts"] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top posts</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {posts.length === 0 && <p className="text-sm text-muted-foreground">No posts yet.</p>}
        {posts.map((p) => (
          <InsetPanel key={p.slug} className="flex items-center justify-between gap-3 p-3">
            <div className="flex min-w-0 flex-col">
              <Link href={`/r/${p.slug}`} className="flex items-center gap-1.5 truncate font-medium hover:underline">
                <span className="truncate">{p.title}</span>
                {p.verified && <VerifiedIcon weight="fill" className="size-4 shrink-0 text-primary" aria-label="Verified" />}
              </Link>
              <span className="truncate text-sm text-muted-foreground">@{p.creator}</span>
            </div>
            <div className="shrink-0 text-right text-sm tabular-nums">
              <div className="font-semibold">{p.unlocks} unlocks</div>
              <div className="text-muted-foreground">
                {p.likes} likes · {p.saves} saves
              </div>
            </div>
          </InsetPanel>
        ))}
      </CardContent>
    </Card>
  )
}

function Activity({ items, now }: { items: AdminOverview["activity"]; now: Date }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Latest activity</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="flex flex-col gap-3">
          {items.map((a, i) => {
            const { icon: Icon, verb } = ACTIVITY[a.kind]
            return (
              <li key={`${a.kind}-${a.at}-${i}`} className="flex items-start gap-3 text-sm">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <Icon className="size-4" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate">
                    <span className="font-medium">{a.who ? `@${a.who}` : "Someone new"}</span> {verb}
                    {a.title && a.slug && (
                      <>
                        {" "}
                        <Link href={`/r/${a.slug}`} className="text-primary hover:underline">
                          {a.title}
                        </Link>
                      </>
                    )}
                  </p>
                  <p className="text-muted-foreground">{formatRelative(a.at, now)}</p>
                </div>
              </li>
            )
          })}
        </ul>
      </CardContent>
    </Card>
  )
}

function PendingVerification({
  items,
  onChange,
  now,
}: {
  items: AdminOverview["pendingVerification"]
  onChange: () => Promise<void>
  now: Date
}) {
  const [busy, setBusy] = React.useState<string | null>(null)

  async function verify(id: string, title: string) {
    setBusy(id)
    try {
      await setPostVerified(id, true)
      toast.success(`Verified "${title}"`)
      await onChange()
    } catch {
      toast.error("Couldn't verify that post. Try again.")
    } finally {
      setBusy(null)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Waiting for verification</CardTitle>
        <p className="text-sm text-muted-foreground">
          Open the proof link, check it matches the post, then verify. The post gets the Verified badge.
        </p>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {items.length === 0 && <p className="text-sm text-muted-foreground">All caught up.</p>}
        {items.map((p) => (
          <InsetPanel key={p.id} className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 flex-col">
              <Link href={`/r/${p.slug}`} className="truncate font-medium hover:underline">
                {p.title}
              </Link>
              <span className="truncate text-sm text-muted-foreground">
                @{p.creator} · {p.unlocks} unlocks · {formatRelative(p.created_at, now)}
              </span>
            </div>
            <div className="flex shrink-0 gap-2">
              <Button asChild variant="outline" size="sm">
                <a href={p.proof} target="_blank" rel="noopener noreferrer nofollow">
                  <OpenIcon aria-hidden />
                  Open proof
                </a>
              </Button>
              <Button size="sm" disabled={busy === p.id} onClick={() => verify(p.id, p.title)}>
                {busy === p.id ? <SpinnerIcon className="animate-spin" aria-hidden /> : null}
                Verify
              </Button>
            </div>
          </InsetPanel>
        ))}
      </CardContent>
    </Card>
  )
}
