"use client"

import { createClient } from "@/lib/supabase/client"
import { supabaseConfigured } from "@/lib/supabase/env"
import type { Listing, RecipePrompt } from "@/lib/types"

/** Every prompt with text, ready to paste (labelled when there's more than one) */
export function promptsText(prompts: RecipePrompt[]) {
  const withText = prompts.filter((p) => p.text.trim())
  if (withText.length === 1) return withText[0]!.text.trim()
  return withText.map((p) => `${p.label}:\n${p.text.trim()}`).join("\n\n")
}

async function fullPrompts(listing: Listing): Promise<RecipePrompt[]> {
  if (!listing.recipeLocked || !supabaseConfigured) return listing.recipe.prompts
  const { data, error } = await createClient()
    .from("recipes")
    .select("prompts")
    .eq("listing_id", listing.id)
    .maybeSingle()
  if (error || !data) throw new Error("locked")
  return (data.prompts ?? []) as RecipePrompt[]
}

/**
 * Copy a post's prompt in one tap, fetching the full recipe if it's still a teaser.
 * The clipboard write starts inside the tap (Safari needs that), with the text
 * arriving a moment later. Resolves "copied", "pdf" (the prompt is only in a PDF:
 * open the recipe page) or "locked" (can't read it: open the recipe page).
 */
export async function copyPrompt(listing: Listing): Promise<"copied" | "pdf" | "locked"> {
  const text = fullPrompts(listing).then(promptsText)
  try {
    if (typeof ClipboardItem !== "undefined" && navigator.clipboard?.write) {
      const blob = text.then((t) => {
        if (!t) throw new Error("pdf")
        return new Blob([t], { type: "text/plain" })
      })
      await navigator.clipboard.write([new ClipboardItem({ "text/plain": blob })])
      return "copied"
    }
    const t = await text
    if (!t) return "pdf"
    const { writeClipboard } = await import("@/components/shared/copy-button")
    return (await writeClipboard(t)) ? "copied" : "locked"
  } catch (error) {
    const t = await text.catch(() => null)
    if (t === "") return "pdf"
    if (t) {
      // The modern clipboard call failed for another reason: try the simple one
      const { writeClipboard } = await import("@/components/shared/copy-button")
      if (await writeClipboard(t)) return "copied"
    }
    console.warn("[copy] couldn't copy the prompt", error)
    return "locked"
  }
}
