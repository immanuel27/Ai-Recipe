"use client"

import { createClient } from "@/lib/supabase/client"
import { previewFromRecipe } from "@/lib/supabase/mappers"
import type { Listing } from "@/lib/types"

const BUCKET = "media"

function extensionFor(type: string) {
  if (type.includes("png")) return "png"
  if (type.includes("webp")) return "webp"
  if (type.includes("gif")) return "gif"
  if (type.includes("mp4")) return "mp4"
  if (type.includes("webm")) return "webm"
  if (type.includes("quicktime")) return "mov"
  return "jpg"
}

/**
 * Upload a local data:/blob: URL to the user's folder in Storage and return
 * its public URL. Remote URLs are returned unchanged.
 */
async function upload(url: string, folder: string, name: string) {
  if (!url.startsWith("data:") && !url.startsWith("blob:")) return url
  const blob = await (await fetch(url)).blob()
  const path = `${folder}/${name}.${extensionFor(blob.type)}`
  const supabase = createClient()
  const { error } = await supabase.storage.from(BUCKET).upload(path, blob, {
    contentType: blob.type || undefined,
    upsert: true,
  })
  if (error) throw new Error(`Upload failed: ${error.message}`)
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl
}

/**
 * Publish a listing built by the sell form: upload its media to Storage, then
 * save the listing (public, with a recipe teaser) and its recipe (locked).
 * Returns the listing with its stored URLs and database id.
 */
export async function publishListing(draft: Listing, profileId: string): Promise<Listing> {
  const supabase = createClient()
  const { data: auth } = await supabase.auth.getUser()
  if (!auth.user) throw new Error("Your sign-in expired. Please sign in again.")
  const folder = `${auth.user.id}/${draft.slug}`

  // Media first, so the listing never points at missing files
  const images = draft.images
    ? await Promise.all(draft.images.map((src, i) => upload(src, folder, `image-${i + 1}`)))
    : undefined
  const mediaUrl = images?.[0] ?? (await upload(draft.mediaUrl, folder, "media"))
  const posterUrl =
    draft.posterUrl === draft.mediaUrl ? mediaUrl : await upload(draft.posterUrl, folder, "poster")
  const failures = await Promise.all(
    draft.recipe.failures.map(async (f, i) => ({
      ...f,
      imageUrl: f.imageUrl ? await upload(f.imageUrl, folder, `failure-${i + 1}`) : undefined,
    }))
  )
  const recipe = { ...draft.recipe, failures }

  const { data: row, error } = await supabase
    .from("listings")
    .insert({
      slug: draft.slug,
      creator_id: profileId,
      title: draft.title,
      description: draft.description,
      type: draft.type,
      media_url: mediaUrl,
      poster_url: posterUrl,
      images: images ?? null,
      clip: draft.clip ?? null,
      ai_tag: draft.aiTag ?? null,
      tool: draft.tool,
      tool_version: draft.toolVersion,
      tags: draft.tags,
      price_cents: draft.price,
      pricing: draft.pricing,
      is_adult: !!draft.isAdult,
      preview: previewFromRecipe(recipe),
    })
    .select("id, created_at")
    .single()
  if (error) throw new Error(error.message)

  const { error: recipeError } = await supabase.from("recipes").insert({
    listing_id: row.id,
    prompts: recipe.prompts,
    settings: recipe.settings,
    assets: recipe.assets,
    edit_stack: recipe.editStack,
    failures: recipe.failures,
  })
  if (recipeError) {
    // Don't leave a listing without its recipe
    await supabase.from("listings").delete().eq("id", row.id)
    throw new Error(recipeError.message)
  }

  return {
    ...draft,
    id: row.id,
    creatorId: profileId,
    mediaUrl,
    posterUrl,
    images,
    recipe,
    recipeLocked: false,
    createdAt: row.created_at,
  }
}
