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

export interface Tool {
  id: ToolId
  name: string
  mediaTypes: MediaType[]
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
  tool: ToolId
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
  recipe: Recipe
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

export type ExploreType = "all" | MediaType
export type ExploreSort = "trending" | "newest" | "price-asc"

export interface ExploreFilters {
  type: ExploreType
  tool: ToolId | "all"
  sort: ExploreSort
  /** Free-text search over title, description, tags, tool and creator */
  q: string
  /** 1-based */
  page: number
}
