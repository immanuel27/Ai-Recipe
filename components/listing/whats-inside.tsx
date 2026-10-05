"use client"

import { CopyIcon, LockIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { InsetPanel } from "@/components/shared/inset-panel"
import { formatPrice } from "@/lib/format"
import { getToolName } from "@/lib/mock/tools"
import type { Listing } from "@/lib/types"

const TEASER_CHARS = 72

export function WhatsInside({
  listing,
  unlocked,
  onBuy,
}: {
  listing: Listing
  unlocked: boolean
  onBuy: () => void
}) {
  const { recipe } = listing
  const toolLabel = `${getToolName(listing.tool)} ${listing.toolVersion}`
  const counts = [
    { label: "Prompts", value: recipe.prompts.length },
    { label: "Tool & version", value: toolLabel },
    { label: "Settings", value: recipe.settings.length },
    { label: "Assets", value: recipe.assets.length },
    { label: "Edit stack", value: recipe.editStack.length },
    { label: "Failures", value: recipe.failures.length },
  ]

  return (
    <Card id="recipe" className="scroll-mt-24">
      <CardHeader>
        <CardTitle className="text-lg">{unlocked ? "Your recipe" : "What's inside"}</CardTitle>
        <CardDescription>
          {unlocked
            ? "Everything the creator used to make this, step by step."
            : "The full recipe, unlocked after purchase."}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {counts.map((c) => (
            <li key={c.label}>
              <InsetPanel className="flex h-full flex-col gap-1">
                <span className="label-caps">{c.label}</span>
                <span
                  className={
                    typeof c.value === "number"
                      ? "text-2xl font-bold tabular-nums"
                      : "truncate text-lg font-bold"
                  }
                >
                  {c.value}
                </span>
              </InsetPanel>
            </li>
          ))}
        </ul>

        {unlocked ? <RecipeContent listing={listing} toolLabel={toolLabel} /> : <Teaser listing={listing} />}
      </CardContent>
      {!unlocked && (
        <CardFooter>
          <Button size="pill" variant="secondary" className="w-full" onClick={onBuy}>
            <LockIcon aria-hidden />
            {listing.price === 0
              ? "Unlock for free"
              : `Unlock for ${formatPrice(listing.price)}`}
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}

/** One prompt line partially visible. The hidden part is filler, not the real text. */
function Teaser({ listing }: { listing: Listing }) {
  const prompt = listing.recipe.prompts[0]
  if (!prompt) return null
  const visible = prompt.text.slice(0, TEASER_CHARS)

  return (
    <InsetPanel className="relative flex flex-col gap-2 overflow-hidden">
      <span className="label-caps">Prompt preview · {prompt.label}</span>
      <p className="font-mono text-sm leading-relaxed">
        {visible}
        <span aria-hidden className="blur-[5px] select-none">
          {" "}
          lens and lighting details continue here with the exact camera move, subject
          reference notes, negative prompt and seed that lock the look across every shot
        </span>
      </p>
      <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
        <LockIcon className="size-4" aria-hidden />
        <span>
          {listing.recipe.prompts.length > 1
            ? `${listing.recipe.prompts.length - 1} more prompts, settings and assets locked`
            : "Full prompt, settings and assets locked"}
        </span>
      </div>
    </InsetPanel>
  )
}

function RecipeContent({ listing, toolLabel }: { listing: Listing; toolLabel: string }) {
  const { recipe } = listing

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text)
      toast.success("Prompt copied")
    } catch {
      toast.error("Couldn't copy to clipboard")
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Section label="Prompts">
        {recipe.prompts.map((p, i) => (
          <InsetPanel key={i} className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-semibold">{p.label}</span>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => copy(p.text)}
                aria-label={`Copy prompt: ${p.label}`}
              >
                <CopyIcon />
              </Button>
            </div>
            <p className="font-mono text-sm leading-relaxed break-words">{p.text}</p>
          </InsetPanel>
        ))}
      </Section>

      <Section label="Tool & version">
        <InsetPanel className="font-semibold">{toolLabel}</InsetPanel>
      </Section>

      <Section label="Settings" empty={recipe.settings.length === 0}>
        <InsetPanel>
          <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
            {recipe.settings.map((s) => (
              <div key={s.key} className="flex justify-between gap-3 text-sm">
                <dt className="text-muted-foreground">{s.key}</dt>
                <dd className="text-right font-mono font-medium">{s.value}</dd>
              </div>
            ))}
          </dl>
        </InsetPanel>
      </Section>

      <Section label="Assets" empty={recipe.assets.length === 0}>
        <InsetPanel>
          <ul className="flex flex-col gap-2 text-sm">
            {recipe.assets.map((a) => (
              <li key={a.name} className="flex flex-col">
                <span className="font-medium">{a.name}</span>
                {a.note && <span className="text-muted-foreground">{a.note}</span>}
              </li>
            ))}
          </ul>
        </InsetPanel>
      </Section>

      <Section label="Edit stack" empty={recipe.editStack.length === 0}>
        <InsetPanel>
          <ol className="flex flex-col gap-3 text-sm">
            {recipe.editStack.map((e, i) => (
              <li key={i} className="flex gap-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-card text-xs font-semibold tabular-nums ring-1 ring-foreground/10">
                  {i + 1}
                </span>
                <span>
                  <span className="font-medium">{e.tool}</span>
                  <span className="text-muted-foreground">: {e.note}</span>
                </span>
              </li>
            ))}
          </ol>
        </InsetPanel>
      </Section>
    </div>
  )
}

function Section({
  label,
  empty,
  children,
}: {
  label: string
  empty?: boolean
  children: React.ReactNode
}) {
  return (
    <section className="flex flex-col gap-2">
      <h3 className="label-caps">{label}</h3>
      {empty ? (
        <p className="text-sm text-muted-foreground">None for this recipe.</p>
      ) : (
        <div className="flex flex-col gap-2">{children}</div>
      )}
    </section>
  )
}
