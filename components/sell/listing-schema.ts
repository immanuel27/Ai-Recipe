import { z } from "zod"

import { PAYMENTS_ENABLED } from "@/lib/flags"
import { TOOLS, isProofLinkForAny, listingTools, parseHttpsUrl, toolKind, toolsForPostType } from "@/lib/mock/tools"
import type { Listing, PostType, ToolId } from "@/lib/types"

export const MAX_IMAGES = 8

const TOOL_IDS = TOOLS.map((t) => t.id) as [ToolId, ...ToolId[]]

/** A new upload whose file carried no AI tag: the proof link is required instead */
export function needsProofLink(v: { postType: string; media: { url: string; aiTag?: unknown } }) {
  return v.postType !== "website" && !!v.media.url && !v.media.aiTag && !/^https?:/.test(v.media.url)
}

export const listingSchema = z
  .object({
    /** Step 1: videos, photos, or websites & apps */
    postType: z.enum(["video", "photo", "website"], "Choose what you're posting."),
    media: z.object({
      /** The video, the cover photo, or (websites) the captured screenshot of the live site */
      url: z.string(),
      posterUrl: z.string(),
      type: z.enum(["video", "image"]),
      /** Image posts: all images in order (first is the cover). Empty for video. */
      images: z.array(z.string()).max(MAX_IMAGES, `Up to ${MAX_IMAGES} images.`),
      /** The AI tag found in the uploaded file(s); required to publish */
      aiTag: z
        .object({ method: z.enum(["c2pa", "iptc", "generator"]), detail: z.string() })
        .optional(),
    }),
    title: z.string().trim().min(4, "At least 4 characters.").max(80, "80 characters max."),
    description: z.string().trim().max(280, "280 characters max."),
    /** Every tool used, main one first */
    tools: z.array(z.enum(TOOL_IDS)).min(1, "Choose at least one tool.").max(5, "Up to 5 tools."),
    /** Private: the tool's share link for the generation, chat or project. Checked by the team. */
    proofUrl: z.string().trim().max(500, "That link is too long."),
    /** Websites & apps: the live site (public). Its screenshot is the cover. */
    liveUrl: z.string().trim().max(500, "That link is too long."),
    tags: z
      .array(z.string().trim().min(1).max(24, "Tags are 24 characters max."))
      .max(10, "Up to 10 tags."),
    adult: z.boolean(),
    prompts: z
      .array(
        z.object({
          label: z.string().trim().min(1, "Name this prompt."),
          text: z.string().trim().min(10, "Paste the full prompt."),
        })
      )
      .min(1, "Add at least one prompt."),
    settings: z.array(
      z.object({
        key: z.string().trim().min(1, "Required."),
        value: z.string().trim().min(1, "Required."),
      })
    ),
    assets: z.array(z.object({ name: z.string().trim().min(1, "Required."), note: z.string() })),
    editSteps: z.array(
      z.object({
        tool: z.string().trim().min(1, "Required."),
        note: z.string().trim().min(1, "Required."),
      })
    ),
    failures: z.array(
      z.object({
        imageUrl: z.string(),
        note: z.string().trim().min(1, "Say why it failed."),
      })
    ),
    pricingMode: z.enum(["single", "bundle"]),
    price: z
      .number("Enter a price.")
      .min(0, "Can't be negative.")
      .max(500, "$500 max.")
      .refine((n) => Number.isInteger(n * 100), "Use whole cents."),
    bundleSlugs: z.array(z.string()),
  })
  .refine((v) => v.postType === "website" || !!v.media.url, {
    path: ["media", "url"],
    message: "Add your video or photos.",
  })
  .refine((v) => v.postType !== "website" || !!v.liveUrl, {
    path: ["liveUrl"],
    message: "Paste the link to your site.",
  })
  .refine((v) => v.postType !== "website" || !v.liveUrl || !!v.media.url, {
    path: ["liveUrl"],
    message: "Get a preview of your site first.",
  })
  // New media without an AI tag in the file (many tools don't embed one) needs the proof
  // link instead; already-published media was checked when posted
  .refine((v) => !needsProofLink(v) || !!v.proofUrl, {
    path: ["proofUrl"],
    message: "Your file has no AI tag, so paste the share link from your AI tool to prove it's AI-made.",
  })
  .refine((v) => {
    const allowed = new Set(toolsForPostType(v.postType).map((t) => t.id))
    return v.tools.every((t) => allowed.has(t))
  }, {
    path: ["tools"],
    message: "Choose tools for this kind of post.",
  })
  // Websites need proof: a share link, unless the live link itself is one (e.g. a lovable.app site)
  .refine((v) => v.postType !== "website" || !!v.proofUrl || (!!v.liveUrl && isProofLinkForAny(v.tools, v.liveUrl)), {
    path: ["proofUrl"],
    message: "Paste the share link so we can check where the site came from.",
  })
  .refine((v) => !v.proofUrl || !!parseHttpsUrl(v.proofUrl), {
    path: ["proofUrl"],
    message: "Paste the full link, starting with https://",
  })
  .refine((v) => !v.proofUrl || !v.tools.length || !parseHttpsUrl(v.proofUrl) || isProofLinkForAny(v.tools, v.proofUrl), {
    path: ["proofUrl"],
    message: "This doesn't look like a share link from the tools you chose.",
  })
  .refine((v) => !v.liveUrl || !!parseHttpsUrl(v.liveUrl), {
    path: ["liveUrl"],
    message: "Paste the full link, starting with https://",
  })
  // (Pricing is hidden while payments are off, so it can't block publishing then)
  .refine((v) => !PAYMENTS_ENABLED || v.pricingMode === "single" || v.bundleSlugs.length > 0, {
    path: ["bundleSlugs"],
    message: "Pick at least one other recipe for the bundle.",
  })

export type ListingFormValues = z.infer<typeof listingSchema>

export const listingDefaults: ListingFormValues = {
  postType: "" as PostType,
  proofUrl: "",
  liveUrl: "",
  media: { url: "", posterUrl: "", type: "image", images: [] },
  title: "",
  description: "",
  tools: [],
  tags: [],
  adult: false,
  prompts: [{ label: "Main prompt", text: "" }],
  settings: [],
  assets: [],
  editSteps: [],
  failures: [],
  pricingMode: "single",
  price: 10,
  bundleSlugs: [],
}

/** Older drafts had `kind`, a single `tool` and a version */
type LegacyDraft = Partial<ListingFormValues> & { kind?: "media" | "website"; tool?: ToolId }

/** Fill gaps in older drafts so they still match the current schema. */
export function withDefaults(values: LegacyDraft): ListingFormValues {
  const { kind, tool, ...rest } = values
  const postType: PostType | undefined =
    rest.postType ?? (kind === "website" ? "website" : kind ? (rest.media?.type === "video" ? "video" : "photo") : undefined)
  return {
    ...listingDefaults,
    ...rest,
    postType: postType ?? listingDefaults.postType,
    tools: rest.tools ?? (tool ? [tool] : []),
    media: { ...listingDefaults.media, ...rest.media },
  }
}

/** An existing post as form values, for editing it */
export function valuesFromListing(l: Listing, proofUrl = ""): ListingFormValues {
  const r = l.recipe
  return {
    ...listingDefaults,
    postType: toolKind(l.tool) === "website" ? "website" : l.type === "video" ? "video" : "photo",
    media: {
      url: l.mediaUrl,
      posterUrl: l.posterUrl,
      type: l.type,
      images: l.type === "image" ? (l.images ?? [l.mediaUrl]) : [],
      aiTag: l.aiTag,
    },
    title: l.title,
    description: l.description,
    tools: listingTools(l),
    proofUrl,
    liveUrl: l.liveUrl ?? "",
    tags: l.tags,
    adult: !!l.isAdult,
    prompts: r.prompts.length ? r.prompts : listingDefaults.prompts,
    settings: r.settings,
    assets: r.assets.map((a) => ({ name: a.name, note: a.note ?? "" })),
    editSteps: r.editStack,
    failures: r.failures.map((f) => ({ imageUrl: f.imageUrl ?? "", note: f.note })),
    pricingMode: l.pricing.mode,
    price: l.price / 100,
    bundleSlugs: l.pricing.bundleSlugs ?? [],
  }
}

export const STEP_FIELDS = [
  ["postType"],
  [
    "media",
    "proofUrl",
    "liveUrl",
    "title",
    "description",
    "tools",
    "tags",
    "adult",
    "pricingMode",
    "price",
    "bundleSlugs",
  ],
  ["prompts", "settings", "assets", "editSteps", "failures"],
] as const satisfies readonly (readonly (keyof ListingFormValues)[])[]
