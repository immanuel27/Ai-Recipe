import type { Metadata } from "next"
import Link from "next/link"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PageContainer, PageHeader } from "@/components/shell/page-container"
import { LISTINGS } from "@/lib/mock/listings"
import type { MediaCredit } from "@/lib/types"

export const metadata: Metadata = { title: "Media credits" }

/** Other placeholder sources used across the demo (not tied to one credit record). */
const OTHER_SOURCES = [
  {
    name: "Big Buck Bunny, Sintel",
    detail: "Blender Foundation, CC BY 3.0, via test-videos.co.uk",
    url: "https://test-videos.co.uk/",
  },
  { name: "Jellyfish test clip", detail: "via test-videos.co.uk (see source for terms)", url: "https://test-videos.co.uk/" },
  { name: "Flower, Friday clips", detail: "MDN Web Docs CC0 sample media", url: "https://github.com/mdn/interactive-examples" },
  { name: "Photos", detail: "Lorem Picsum (Unsplash photographers; see source for terms)", url: "https://picsum.photos/" },
  { name: "Avatars", detail: "DiceBear “Notionists” style (see source for terms)", url: "https://www.dicebear.com/styles/notionists/" },
]

export default function CreditsPage() {
  // One entry per credited work, with the listings that use it
  const byWork = new Map<string, { credit: MediaCredit; listings: { slug: string; title: string }[] }>()
  for (const l of LISTINGS) {
    if (!l.credit) continue
    const entry = byWork.get(l.credit.work) ?? { credit: l.credit, listings: [] }
    entry.listings.push({ slug: l.slug, title: l.title })
    byWork.set(l.credit.work, entry)
  }

  return (
    <PageContainer className="max-w-3xl">
      <PageHeader
        title="Media credits"
        description="This demo uses openly licensed animation and stock footage as placeholder content. None of it is AI-generated, and the recipes are illustrative."
      />
      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Featured footage</CardTitle>
            <CardDescription>Short clips of these works play in the feed and on listings.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col divide-y divide-border">
              {[...byWork.values()].map(({ credit, listings }) => (
                <li key={credit.work} className="flex flex-col gap-1 py-3">
                  <a
                    href={credit.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="font-semibold hover:underline"
                  >
                    {credit.work}
                  </a>
                  <span className="text-sm text-muted-foreground">
                    {credit.author} ·{" "}
                    {credit.licenseUrl ? (
                      <a href={credit.licenseUrl} target="_blank" rel="noreferrer license" className="underline">
                        {credit.license}
                      </a>
                    ) : (
                      credit.license
                    )}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    Used in:{" "}
                    {listings.map((l, i) => (
                      <span key={l.slug}>
                        {i > 0 && ", "}
                        <Link href={`/r/${l.slug}`} className="underline hover:text-foreground">
                          {l.title}
                        </Link>
                      </span>
                    ))}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Other placeholder media</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col divide-y divide-border">
              {OTHER_SOURCES.map((s) => (
                <li key={s.name} className="flex flex-col gap-0.5 py-3">
                  <a href={s.url} target="_blank" rel="noreferrer" className="font-semibold hover:underline">
                    {s.name}
                  </a>
                  <span className="text-sm text-muted-foreground">{s.detail}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  )
}
