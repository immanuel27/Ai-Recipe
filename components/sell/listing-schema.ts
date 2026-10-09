import { z } from "zod"

import { TOOLS, isProofLinkFor, parseHttpsUrl, toolKind } from "@/lib/mock/tools"
import type { ToolId } from "@/lib/types"

export const MAX_IMAGES = 8

const TOOL_IDS = TOOLS.map((t) => t.id) as [ToolId, ...ToolId[]]

export const listingSchema = z
  .object({
    /** An AI video/image, or a website built with an AI tool */
    kind: z.enum(["media", "website"]),
    media: z.object({
      url: z.string().min(1, "Add a video or image."),
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
    tool: z.enum(TOOL_IDS, "Choose the tool you used."),
    toolVersion: z.string().trim().min(1, "Add the version, e.g. 3.1 or v7."),
    /** Private: the tool's share link for the generation, chat or project. Checked by the team. */
    proofUrl: z.string().trim().max(500, "That link is too long."),
    /** Website recipes: where the site is live (public) */
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
  // AI media must carry an AI tag; website screenshots can't, so their proof link stands in for it
  .refine((v) => v.kind === "website" || !v.media.url || !!v.media.aiTag, {
    path: ["media", "url"],
    message: "This file has no AI tag. Upload the original export from your AI tool.",
  })
  .refine((v) => !v.tool || toolKind(v.tool) === v.kind, {
    path: ["tool"],
    message: "Choose a tool for this kind of post.",
  })
  .refine((v) => v.kind === "media" || !!v.proofUrl, {
    path: ["proofUrl"],
    message: "Paste the share link so we can check where the site came from.",
  })
  .refine((v) => !v.proofUrl || !!parseHttpsUrl(v.proofUrl), {
    path: ["proofUrl"],
    message: "Paste the full link, starting with https://",
  })
  .refine((v) => !v.proofUrl || !v.tool || !parseHttpsUrl(v.proofUrl) || isProofLinkFor(v.tool, v.proofUrl), {
    path: ["proofUrl"],
    message: "This doesn't look like a share link from the tool you chose.",
  })
  .refine((v) => !v.liveUrl || !!parseHttpsUrl(v.liveUrl), {
    path: ["liveUrl"],
    message: "Paste the full link, starting with https://",
  })
  .refine((v) => v.pricingMode === "single" || v.bundleSlugs.length > 0, {
    path: ["bundleSlugs"],
    message: "Pick at least one other recipe for the bundle.",
  })

export type ListingFormValues = z.infer<typeof listingSchema>

export const listingDefaults: ListingFormValues = {
  kind: "media",
  proofUrl: "",
  liveUrl: "",
  media: { url: "", posterUrl: "", type: "image", images: [] },
  title: "",
  description: "",
  tool: "" as ToolId,
  toolVersion: "",
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

/** Fill gaps in older drafts so they still match the current schema. */
export function withDefaults(values: Partial<ListingFormValues>): ListingFormValues {
  return {
    ...listingDefaults,
    ...values,
    media: { ...listingDefaults.media, ...values.media },
  }
}

export const STEP_FIELDS = [
  [
    "kind",
    "media",
    "proofUrl",
    "liveUrl",
    "title",
    "description",
    "tool",
    "toolVersion",
    "tags",
    "adult",
    "pricingMode",
    "price",
    "bundleSlugs",
  ],
  ["prompts", "settings", "assets", "editSteps", "failures"],
] as const satisfies readonly (readonly (keyof ListingFormValues)[])[]
