import { z } from "zod"

import { TOOLS } from "@/lib/mock/tools"
import type { ToolId } from "@/lib/types"

export const MAX_IMAGES = 8

const TOOL_IDS = TOOLS.map((t) => t.id) as [ToolId, ...ToolId[]]

export const listingSchema = z
  .object({
    media: z.object({
      url: z.string().min(1, "Add a video or image."),
      posterUrl: z.string(),
      type: z.enum(["video", "image"]),
      /** Image posts: all images in order (first is the cover). Empty for video. */
      images: z.array(z.string()).max(MAX_IMAGES, `Up to ${MAX_IMAGES} images.`),
    }),
    title: z.string().trim().min(4, "At least 4 characters.").max(80, "80 characters max."),
    description: z.string().trim().max(280, "280 characters max."),
    tool: z.enum(TOOL_IDS, "Choose the tool you used."),
    toolVersion: z.string().trim().min(1, "Add the version, e.g. 3.1 or v7."),
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
  .refine((v) => v.pricingMode === "single" || v.bundleSlugs.length > 0, {
    path: ["bundleSlugs"],
    message: "Pick at least one other recipe for the bundle.",
  })

export type ListingFormValues = z.infer<typeof listingSchema>

export const listingDefaults: ListingFormValues = {
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
    "media",
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
