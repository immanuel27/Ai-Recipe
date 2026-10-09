import type { AiTag } from "@/lib/ai-provenance"

export type MediaType = "video" | "image"

export type ToolId =
  | "sora"
  | "veo"
  | "kling"
  | "runway"
  | "midjourney"
  | "flux"
  | "ideogram"
  | "imagen"
  | "higgsfield"
  | "chatgpt"
  | "claude"
  | "lovable"
  | "figma-make"
  | "framer"

/** What a recipe makes: AI video/images, or a website built from prompts */
export type ListingKind = "media" | "website"

/** The first choice when posting */
export type PostType = "video" | "photo" | "website"

export interface Tool {
  id: ToolId
  name: string
  kind: ListingKind
  /** For media tools, what it makes. Website posts show screenshots or a screen recording. */
  mediaTypes: MediaType[]
  /** Maker's logo in public/logos (their trademark). Missing ones fall back to an initial. */
  logo?: string
  /** Where to make something with it */
  url: string
  /**
   * Share links that prove a post was made with this tool, as "host/path-prefix"
   * ("*." matches subdomains), e.g. "claude.ai/share/". Empty: any https link.
   */
  proofLinks?: string[]
  /** What to paste, shown under the proof link field */
  proofHint?: string
}

export interface Creator {
  id: string
  username: string
  displayName: string
  avatarUrl?: string
  bio: string
}

export interface RecipePrompt {
  label: string
  text: string
}

export interface RecipeSetting {
  key: string
  value: string
}

export interface RecipeAsset {
  name: string
  note?: string
  url?: string
}

export interface RecipeEditStep {
  tool: string
  note: string
}

export interface RecipeFailure {
  imageUrl?: string
  note: string
}

export interface Recipe {
  prompts: RecipePrompt[]
  settings: RecipeSetting[]
  assets: RecipeAsset[]
  editStack: RecipeEditStep[]
  failures: RecipeFailure[]
}

export type PricingMode = "single" | "bundle"

export interface MediaCredit {
  /** e.g. "Sprite Fright" */
  work: string
  author: string
  license: string
  licenseUrl?: string
  sourceUrl: string
}

export interface Listing {
  id: string
  slug: string
  title: string
  description: string
  creatorId: string
  type: MediaType
  /** Video file or full-size image */
  mediaUrl: string
  /** Always set: still frame for videos, same as mediaUrl for images */
  posterUrl: string
  /** Image listings: every image in order (first = mediaUrl). Any aspect ratio. */
  images?: string[]
  /** Video listings: play only this range (seconds) of a longer file, looping */
  clip?: { start: number; end: number }
  /** Attribution for third-party placeholder footage (required by CC BY) */
  credit?: MediaCredit
  /** Verified "made with AI" tag read from the uploaded file(s) */
  aiTag?: AiTag
  /** The main tool (first of `tools`) */
  tool: ToolId
  /** Every tool used, main one first. Older listings only have `tool`. */
  tools?: ToolId[]
  /** No longer collected (kept for older listings); not shown */
  toolVersion: string
  tags: string[]
  /** In cents. 0 = free. */
  price: number
  pricing: { mode: PricingMode; bundleSlugs?: string[] }
  createdAt: string
  stats: { views: number; sales: number; saves: number; likes: number }
  trendingScore: number
  /** Creator flagged the media as adult content */
  isAdult?: boolean
  /** Website recipes: the live site */
  liveUrl?: string
  /** The team checked the creator's private proof link (share link from the tool) */
  verified?: boolean
  recipe: Recipe
  /**
   * True when `recipe` is only the public teaser (counts, a cut-off first
   * prompt, the first failure): the viewer hasn't bought it. The full recipe
   * is fetched from Supabase once they own it.
   */
  recipeLocked?: boolean
}

export interface Sale {
  id: string
  listingSlug: string
  buyer: string
  /** In cents */
  price: number
  date: string
}

export interface MonthlyEarning {
  month: string
  /** Net, in cents */
  earnings: number
  sales: number
}

export interface SessionUser {
  username: string
  /** Supabase profile id (absent in demo mode without Supabase) */
  profileId?: string
  displayName?: string
  bio?: string
  email: string
  provider: "google" | "email"
  isSeller: boolean
  seller?: {
    payoutMethod: string
    country: string
    proofOfWorkUrl: string
  }
}

export type ExploreType = "all" | MediaType | "website"
export type ExploreSort = "trending" | "newest" | "price-asc"
export type ExplorePrice = "any" | "free" | "under-10" | "10-20" | "over-20"

export interface ExploreFilters {
  type: ExploreType
  tool: ToolId | "all"
  /** A style tag such as "cartoon"; empty for any */
  tag: string
  price: ExplorePrice
  sort: ExploreSort
  /** Free-text search over title, description, tags, tool and creator */
  q: string
  /** 1-based */
  page: number
}
