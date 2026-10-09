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

/** Upload any new local media (data:/blob:) for a listing; remote URLs are kept. */
async function uploadMedia(draft: Listing, folder: string, suffix = "") {
  const images = draft.images
    ? await Promise.all(draft.images.map((src, i) => upload(src, folder, `image-${i + 1}${suffix}`)))
    : undefined
  const mediaUrl = images?.[0] ?? (await upload(draft.mediaUrl, folder, `media${suffix}`))
  const posterUrl =
    draft.posterUrl === draft.mediaUrl ? mediaUrl : await upload(draft.posterUrl, folder, `poster${suffix}`)
  const failures = await Promise.all(
    draft.recipe.failures.map(async (f, i) => ({
      ...f,
      imageUrl: f.imageUrl ? await upload(f.imageUrl, folder, `failure-${i + 1}${suffix}`) : undefined,
    }))
  )
  return { images, mediaUrl, posterUrl, recipe: { ...draft.recipe, failures } }
}

/** The editable columns of a listing, from the app's shape */
function listingColumns(draft: Listing, media: { images?: string[]; mediaUrl: string; posterUrl: string }, recipe: Listing["recipe"]) {
  return {
    title: draft.title,
    description: draft.description,
    type: draft.type,
    media_url: media.mediaUrl,
    poster_url: media.posterUrl,
    images: media.images ?? null,
    ai_tag: draft.aiTag ?? null,
    tool: draft.tool,
    tools: draft.tools ?? [draft.tool],
    tags: draft.tags,
    price_cents: draft.price,
    pricing: draft.pricing,
    is_adult: !!draft.isAdult,
    live_url: draft.liveUrl ?? null,
    preview: previewFromRecipe(recipe),
  }
}

function recipeColumns(recipe: Listing["recipe"]) {
  return {
    prompts: recipe.prompts,
    settings: recipe.settings,
    assets: recipe.assets,
    edit_stack: recipe.editStack,
    failures: recipe.failures,
  }
}

/** Refresh the cached public catalog so changes show everywhere right away */
async function refreshCatalog() {
  await fetch("/api/revalidate", { method: "POST" }).catch(() => {})
}

async function currentUserId() {
  const { data: auth } = await createClient().auth.getUser()
  if (!auth.user) throw new Error("Your sign-in expired. Please sign in again.")
  return auth.user.id
}

/**
 * Save an edited listing: upload any replaced media, then update the listing,
 * its recipe and its private proof link (a new proof link clears Verified).
 */
export async function updateListing(original: Listing, draft: Listing, proofUrl?: string): Promise<Listing> {
  const supabase = createClient()
  const uid = await currentUserId()
  // New file names, so cached copies of the old media never show
  const media = await uploadMedia(draft, `${uid}/${original.slug}`, `-${Date.now().toString(36)}`)

  const { data: saved, error } = await supabase
    .from("listings")
    .update(listingColumns(draft, media, media.recipe))
    .eq("id", original.id)
    .select("id")
  if (error) throw new Error(error.message)
  // Row-level security silently skips rows you don't own
  if (!saved?.length) throw new Error("You can only edit your own posts.")

  const { error: recipeError } = await supabase
    .from("recipes")
    .update(recipeColumns(media.recipe))
    .eq("listing_id", original.id)
  if (recipeError) throw new Error(recipeError.message)

  const proof = proofUrl
    ? await supabase.from("listing_proofs").upsert({ listing_id: original.id, url: proofUrl })
    : await supabase.from("listing_proofs").delete().eq("listing_id", original.id)
  if (proof.error) console.warn("[edit] Couldn't save the proof link", proof.error.message)

  await refreshCatalog()
  return {
    ...draft,
    mediaUrl: media.mediaUrl,
    posterUrl: media.posterUrl,
    images: media.images,
    recipe: media.recipe,
    recipeLocked: false,
  }
}

/**
 * Delete a listing. It's archived rather than erased: it disappears for everyone
 * except its creator and the people who already bought it, who keep their recipe.
 */
export async function deleteListing(listingId: string) {
  const { data, error } = await createClient()
    .from("listings")
    .update({ archived_at: new Date().toISOString() })
    .eq("id", listingId)
    .select("id")
  if (error) throw new Error(error.message)
  if (!data?.length) throw new Error("You can only delete your own posts.")
  await refreshCatalog()
}

/**
 * Publish a listing built by the sell form: upload its media to Storage, then
 * save the listing (public, with a recipe teaser) and its recipe (locked).
 * The proof link (the tool's share link) is stored privately for review.
 * Returns the listing with its stored URLs and database id.
 */
export async function publishListing(draft: Listing, profileId: string, proofUrl?: string): Promise<Listing> {
  const supabase = createClient()
  const uid = await currentUserId()

  // Media first, so the listing never points at missing files
  const media = await uploadMedia(draft, `${uid}/${draft.slug}`)
  const { images, mediaUrl, posterUrl, recipe } = media

  const { data: row, error } = await supabase
    .from("listings")
    .insert({
      slug: draft.slug,
      creator_id: profileId,
      clip: draft.clip ?? null,
      tool_version: draft.toolVersion,
      ...listingColumns(draft, media, recipe),
    })
    .select("id, created_at")
    .single()
  if (error) throw new Error(error.message)

  const { error: recipeError } = await supabase.from("recipes").insert({
    listing_id: row.id,
    ...recipeColumns(recipe),
  })
  if (recipeError) {
    // Don't leave a listing without its recipe
    await supabase.from("listings").delete().eq("id", row.id)
    throw new Error(recipeError.message)
  }

  if (proofUrl) {
    const { error: proofError } = await supabase.from("listing_proofs").insert({ listing_id: row.id, url: proofUrl })
    // The post is live either way; the creator can't be verified without it
    if (proofError) console.warn("[publish] Couldn't save the proof link", proofError.message)
  }

  // Show the new listing everywhere right away (the public catalog is cached)
  await refreshCatalog()

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
