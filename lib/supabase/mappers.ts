import type { AiTag } from "@/lib/ai-provenance"
import type { Creator, Listing, MediaCredit, Recipe, ToolId } from "@/lib/types"

// Convert Supabase rows to the app's types (and back). Safe on server and client.

export interface ProfileRow {
  id: string
  username: string
  display_name: string
  bio: string
  avatar_url: string | null
}

/** Public teaser of a locked recipe, stored on listings.preview */
export interface RecipePreview {
  counts?: { prompts: number; settings: number; assets: number; editStack: number; failures: number }
  teaser?: { label: string; text: string } | null
  failures?: { imageUrl: string | null; note: string | null }[]
  /** Names shown on locked recipes (values, notes and prompts stay hidden) */
  settingKeys?: string[]
  assetNames?: string[]
  editTools?: string[]
}

export interface ListingRow {
  id: string
  slug: string
  creator_id: string
  title: string
  description: string
  type: "video" | "image"
  media_url: string
  poster_url: string
  images: string[] | null
  clip: { start: number; end: number } | null
  credit: MediaCredit | null
  ai_tag: AiTag | null
  tool: string
  tool_version: string
  tags: string[]
  price_cents: number
  pricing: Listing["pricing"]
  is_adult: boolean
  views: number
  sales: number
  saves: number
  likes: number
  trending_score: number | string
  preview: RecipePreview
  created_at: string
}

export interface RecipeRow {
  prompts: Recipe["prompts"]
  settings: Recipe["settings"]
  assets: Recipe["assets"]
  edit_stack: Recipe["editStack"]
  failures: Recipe["failures"]
}

export function profileToCreator(p: ProfileRow): Creator {
  return {
    id: p.id,
    username: p.username,
    displayName: p.display_name,
    bio: p.bio,
    avatarUrl: p.avatar_url ?? undefined,
  }
}

/**
 * The public teaser as a Recipe with the right number of parts, so the UI can
 * show counts and the locked state. Hidden parts are empty placeholders: the
 * real text never leaves the database until the viewer owns the recipe.
 */
export function recipeFromPreview(preview: RecipePreview): Recipe {
  const counts = preview.counts ?? { prompts: 0, settings: 0, assets: 0, editStack: 0, failures: 0 }
  // Each placeholder gets a unique label: the UI keys list items by them
  const fill = <T,>(n: number, make: (i: number) => T) =>
    Array.from({ length: Math.max(0, n) }, (_, i) => make(i))
  const teaser = preview.teaser
  return {
    prompts: [
      ...(teaser ? [{ label: teaser.label, text: teaser.text }] : []),
      ...fill(counts.prompts - (teaser ? 1 : 0), (i) => ({ label: `Locked prompt ${i + 2}`, text: "" })),
    ],
    settings: fill(counts.settings, (i) => ({ key: preview.settingKeys?.[i] ?? `Setting ${i + 1}`, value: "" })),
    assets: fill(counts.assets, (i) => ({ name: preview.assetNames?.[i] ?? `Asset ${i + 1}` })),
    editStack: fill(counts.editStack, (i) => ({ tool: preview.editTools?.[i] ?? `Step ${i + 1}`, note: "" })),
    failures: (preview.failures ?? []).map((f) => ({
      imageUrl: f.imageUrl ?? undefined,
      note: f.note ?? "",
    })),
  }
}

export function recipeFromRow(r: RecipeRow): Recipe {
  return {
    prompts: r.prompts ?? [],
    settings: r.settings ?? [],
    assets: r.assets ?? [],
    editStack: r.edit_stack ?? [],
    failures: r.failures ?? [],
  }
}

export function listingFromRow(row: ListingRow, recipe?: RecipeRow): Listing {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    creatorId: row.creator_id,
    type: row.type,
    mediaUrl: row.media_url,
    posterUrl: row.poster_url,
    images: row.images ?? undefined,
    clip: row.clip ?? undefined,
    credit: row.credit ?? undefined,
    aiTag: row.ai_tag ?? undefined,
    tool: row.tool as ToolId,
    toolVersion: row.tool_version,
    tags: row.tags ?? [],
    price: row.price_cents,
    pricing: row.pricing ?? { mode: "single" },
    isAdult: row.is_adult || undefined,
    createdAt: row.created_at,
    stats: { views: row.views, sales: row.sales, saves: row.saves, likes: row.likes },
    trendingScore: Number(row.trending_score),
    recipe: recipe ? recipeFromRow(recipe) : recipeFromPreview(row.preview ?? {}),
    recipeLocked: !recipe,
  }
}

const TEASER_CHARS = 72

/** Public teaser for a new listing's recipe (stored on listings.preview). */
export function previewFromRecipe(r: Recipe): RecipePreview {
  return {
    counts: {
      prompts: r.prompts.length,
      settings: r.settings.length,
      assets: r.assets.length,
      editStack: r.editStack.length,
      failures: r.failures.length,
    },
    teaser: r.prompts[0] ? { label: r.prompts[0].label, text: r.prompts[0].text.slice(0, TEASER_CHARS) } : null,
    failures: r.failures.map((f, i) => ({ imageUrl: f.imageUrl ?? null, note: i === 0 ? f.note : null })),
    settingKeys: r.settings.map((s) => s.key),
    assetNames: r.assets.map((a) => a.name),
    editTools: r.editStack.map((e) => e.tool),
  }
}
