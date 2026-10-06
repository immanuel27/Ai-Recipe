"use client"

import { toast } from "sonner"

import {
  CopyIcon,
  DocumentIcon,
  EditStackIcon,
  ImageMissingIcon,
  LockIcon,
  PromptsIcon,
  RecipeSettingsIcon,
} from "@/components/icons"
import { RecipeStep, TeaserSnippet } from "@/components/shared/recipe-steps"
import { ToolBadge } from "@/components/shared/tool-badge"
import { formatPrice } from "@/lib/format"
import type { Listing } from "@/lib/types"

const chip = "flex items-center gap-2 rounded-lg bg-dock px-3 py-2 type-meta"

async function copy(text: string, label: string) {
  try {
    await navigator.clipboard.writeText(text)
    toast.success(`${label} copied`)
  } catch {
    toast.error("Couldn't copy. Select the text and copy it instead.")
  }
}

/**
 * The recipe, part by part. Locked: what each part holds, with a taste of
 * the first prompt. Unlocked: everything, with copy buttons on the prompts.
 */
export function WhatsInside({
  listing,
  unlocked,
  onBuy,
}: {
  listing: Listing
  unlocked: boolean
  onBuy: () => void
}) {
  const { prompts, settings, assets, editStack, failures } = listing.recipe
  const tools = [...new Set(editStack.map((e) => e.tool))]

  return (
    <section id="recipe" aria-labelledby="recipe-heading" className="glass flex scroll-mt-24 flex-col gap-8 rounded-3xl p-6 md:p-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h2 id="recipe-heading" className="type-section">
            {unlocked ? "Your recipe" : "What's inside"}
          </h2>
          <p className="text-muted-foreground">
            {unlocked
              ? "Everything the creator used to make this, in the order they used it."
              : "Five parts, from first prompt to the takes that didn't work."}
          </p>
        </div>
        <ToolBadge tool={listing.tool} version={listing.toolVersion} className="glass rounded-full px-3 py-2" />
      </header>

      <ol className="flex flex-col gap-6">
        <RecipeStep n={1} icon={PromptsIcon} label="Prompts" count={prompts.length}>
          {unlocked ? (
            <ul className="flex flex-col divide-y divide-foreground/10">
              {prompts.map((p) => (
                <li key={p.label} className="flex flex-col gap-2 py-4 first:pt-0 last:pb-0">
                  <div className="flex items-center justify-between gap-4">
                    <span className="type-meta font-semibold text-muted-foreground">{p.label}</span>
                    <button
                      type="button"
                      onClick={() => copy(p.text, "Prompt")}
                      aria-label={`Copy prompt: ${p.label}`}
                      className="glass-button flex h-8 items-center gap-2 rounded-full px-3 type-meta font-semibold"
                    >
                      <CopyIcon aria-hidden className="size-4" />
                      Copy
                    </button>
                  </div>
                  <p className="type-body leading-6 break-words">{p.text}</p>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col gap-2">
              <span className="type-meta font-semibold text-muted-foreground">{prompts[0]?.label}</span>
              <TeaserSnippet text={prompts[0]?.text ?? ""} className="type-body leading-6" />
              {prompts.length > 1 && (
                <span className="type-meta text-muted-foreground">
                  And {prompts.length - 1} more {prompts.length - 1 === 1 ? "prompt" : "prompts"}
                </span>
              )}
            </div>
          )}
        </RecipeStep>

        <RecipeStep n={2} icon={RecipeSettingsIcon} label="Settings and seeds" count={settings.length}>
          {unlocked ? (
            <dl className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {settings.map((s) => (
                <div key={s.key} className={`${chip} justify-between`}>
                  <dt className="text-muted-foreground">{s.key}</dt>
                  <dd className="text-right font-semibold">{s.value}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <ul className="flex flex-wrap gap-2">
              {settings.map((s) => (
                <li key={s.key} className={chip}>
                  <span className="text-muted-foreground">{s.key}</span>
                  <span className="font-semibold">••••</span>
                </li>
              ))}
            </ul>
          )}
        </RecipeStep>

        <RecipeStep n={3} icon={DocumentIcon} label="Reference assets" count={assets.length}>
          <ul className="flex flex-col gap-2">
            {assets.map((a) => (
              <li key={a.name} className="flex flex-col gap-2">
                <span className="type-body font-semibold">{a.name}</span>
                {unlocked && a.note && <span className="type-meta text-muted-foreground">{a.note}</span>}
              </li>
            ))}
          </ul>
        </RecipeStep>

        <RecipeStep n={4} icon={EditStackIcon} label="Edit stack" count={editStack.length}>
          {unlocked ? (
            <ol className="flex flex-col gap-3">
              {editStack.map((e, i) => (
                <li key={i} className="flex flex-col gap-2">
                  <span className="type-body font-semibold">{e.tool}</span>
                  <span className="type-meta text-muted-foreground">{e.note}</span>
                </li>
              ))}
            </ol>
          ) : (
            <ul className="flex flex-wrap gap-2">
              {tools.map((t) => (
                <li key={t} className={`${chip} font-semibold`}>
                  {t}
                </li>
              ))}
            </ul>
          )}
        </RecipeStep>

        <RecipeStep n={5} icon={ImageMissingIcon} label="Failed takes" count={failures.length} last>
          <a href="#failed-takes" className="type-meta font-semibold text-link hover:underline">
            {unlocked ? "See what went wrong and why" : "Preview the takes below"}
          </a>
        </RecipeStep>
      </ol>

      {!unlocked && (
        <footer className="flex flex-col gap-4 border-t border-glass-border pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-3 text-muted-foreground">
            <LockIcon aria-hidden weight="fill" className="size-4 shrink-0" />
            Full prompts, setting values and every note unlock with the recipe.
          </p>
          <button
            type="button"
            onClick={onBuy}
            className="glass-button flex h-10 shrink-0 items-center justify-center gap-2 rounded-full px-5 font-semibold outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {listing.price === 0 ? "Unlock for free" : `Unlock for ${formatPrice(listing.price)}`}
          </button>
        </footer>
      )}
    </section>
  )
}
