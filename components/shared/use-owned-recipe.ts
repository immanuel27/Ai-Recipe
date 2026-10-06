"use client"

import * as React from "react"

import { createClient } from "@/lib/supabase/client"
import { supabaseConfigured } from "@/lib/supabase/env"
import { recipeFromRow, type RecipeRow } from "@/lib/supabase/mappers"
import type { Listing } from "@/lib/types"

/**
 * Once the viewer owns a listing whose recipe arrived as the locked teaser
 * (e.g. they just bought it), fetch the full recipe from Supabase. RLS only
 * returns it after the purchase exists, so retry briefly while that write lands.
 */
export function useOwnedRecipe(listing: Listing, owned: boolean): Listing {
  const [recipe, setRecipe] = React.useState<Listing["recipe"] | null>(null)
  const needsFetch = supabaseConfigured && owned && !!listing.recipeLocked

  React.useEffect(() => {
    if (!needsFetch) return
    let cancelled = false
    const supabase = createClient()
    async function load(attempt: number) {
      const { data } = await supabase
        .from("recipes")
        .select("prompts, settings, assets, edit_stack, failures")
        .eq("listing_id", listing.id)
        .maybeSingle()
      if (cancelled) return
      if (data) setRecipe(recipeFromRow(data as RecipeRow))
      else if (attempt < 5) window.setTimeout(() => void load(attempt + 1), 600)
    }
    void load(0)
    return () => {
      cancelled = true
    }
  }, [needsFetch, listing.id])

  return recipe ? { ...listing, recipe, recipeLocked: false } : listing
}
