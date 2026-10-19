"use client"

import * as React from "react"
import { toast } from "sonner"

import { SpinnerIcon } from "@/components/icons"
import { InsetPanel } from "@/components/shared/inset-panel"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { fetchAdminVideos, refreshCatalog, replaceWithOptimised, type AdminVideo } from "@/lib/supabase/admin"
import { compressVideo } from "@/lib/video-compress"

const MB = 1024 * 1024
/** Already small enough: not worth re-encoding */
const WORTH_IT = 3 * MB

const mb = (bytes: number) => `${(bytes / MB).toFixed(1)} MB`

type Status = { state: "waiting" } | { state: "working"; progress: number } | { state: "done"; bytes: number } | { state: "skipped" } | { state: "failed" }

/**
 * Shrink the videos already posted (new uploads are optimised automatically).
 * Runs in this browser: downloads each big video, re-encodes it, uploads the
 * smaller copy and switches the post to it. Keep the tab open until it's done.
 */
export function OptimiseVideos() {
  const [videos, setVideos] = React.useState<AdminVideo[] | null>(null)
  const [status, setStatus] = React.useState<Record<string, Status>>({})
  const [running, setRunning] = React.useState(false)

  React.useEffect(() => {
    fetchAdminVideos().then(setVideos, () => setVideos([]))
  }, [])

  const big = (videos ?? []).filter((v) => v.bytes >= WORTH_IT && !v.media_url.includes("/media-opt-"))
  const total = big.reduce((s, v) => s + v.bytes, 0)

  async function run() {
    setRunning(true)
    let saved = 0
    for (const video of big) {
      const set = (s: Status) => setStatus((all) => ({ ...all, [video.id]: s }))
      set({ state: "working", progress: 0 })
      try {
        const blob = await (await fetch(video.media_url)).blob()
        const original = new File([blob], "media.mp4", { type: blob.type || "video/mp4" })
        const optimised = await compressVideo(original, (p) => set({ state: "working", progress: p }))
        if (optimised === original) {
          set({ state: "skipped" })
          continue
        }
        const bytes = await replaceWithOptimised(video, optimised)
        saved += video.bytes - bytes
        set({ state: "done", bytes })
      } catch (error) {
        console.warn("[optimise] failed", video.slug, error)
        set({ state: "failed" })
      }
    }
    await refreshCatalog()
    setRunning(false)
    toast.success(`Done: saved ${mb(saved)} per full round of plays`)
    fetchAdminVideos().then(setVideos, () => {})
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Optimise videos</CardTitle>
        <p className="text-sm text-muted-foreground">
          Big videos use up the monthly storage traffic every time they play. This shrinks the ones already posted
          (they look the same on a phone). New uploads are optimised automatically. Keep this tab open while it runs.
        </p>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {videos === null && <p className="text-sm text-muted-foreground">Loading…</p>}
        {videos && big.length === 0 && <p className="text-sm text-muted-foreground">All videos are already small. 🎉</p>}
        {big.map((v) => {
          const s = status[v.id] ?? { state: "waiting" }
          return (
            <InsetPanel key={v.id} className="flex items-center justify-between gap-3 p-3 text-sm">
              <span className="min-w-0 truncate font-medium">{v.title}</span>
              <span className="shrink-0 tabular-nums text-muted-foreground">
                {s.state === "working" && `Optimising… ${Math.round(s.progress * 100)}%`}
                {s.state === "done" && (
                  <span className="text-success">
                    {mb(v.bytes)} → {mb(s.bytes)}
                  </span>
                )}
                {s.state === "skipped" && "Already as small as it gets"}
                {s.state === "failed" && <span className="text-destructive">Couldn&apos;t optimise</span>}
                {s.state === "waiting" && mb(v.bytes)}
              </span>
            </InsetPanel>
          )
        })}
      </CardContent>
      {big.length > 0 && (
        <CardFooter>
          <Button size="pill" className="w-full" disabled={running} onClick={() => void run()}>
            {running && <SpinnerIcon className="animate-spin" aria-hidden />}
            {running ? "Optimising… keep this tab open" : `Optimise ${big.length} videos (${mb(total)})`}
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
