"use client"

import { useController, useFormContext } from "react-hook-form"

import { FieldError } from "@/components/ui/field"
import { ImageIcon, VideoIcon, WebsiteIcon, type IconType } from "@/components/icons"
import { listingDefaults, type ListingFormValues } from "@/components/sell/listing-schema"
import { toolsForPostType } from "@/lib/mock/tools"
import type { PostType } from "@/lib/types"
import { cn } from "@/lib/utils"

const TYPES: { value: PostType; title: string; description: string; icon: IconType }[] = [
  { value: "video", title: "Videos", description: "A clip made with an AI video tool.", icon: VideoIcon },
  { value: "photo", title: "Photos", description: "Up to 8 images made with AI.", icon: ImageIcon },
  {
    value: "website",
    title: "Websites & apps",
    description: "A site or app built with Lovable, Claude, ChatGPT, Figma Make or Framer. Just paste its link.",
    icon: WebsiteIcon,
  },
]

/** Step 1: videos, photos, or websites & apps. Picking one moves on. */
export function TypeStep({ onPick }: { onPick: () => void }) {
  const { control, getValues, setValue } = useFormContext<ListingFormValues>()
  const { field, fieldState } = useController({ control, name: "postType" })

  function pick(type: PostType) {
    if (type !== field.value) {
      // Keep only what still fits the new type
      const allowed = new Set(toolsForPostType(type).map((t) => t.id))
      setValue("tools", getValues("tools").filter((t) => allowed.has(t)))
      const media = getValues("media")
      const fits = type === "video" ? media.type === "video" : type === "photo" ? media.type === "image" : false
      if (media.url && !fits) setValue("media", listingDefaults.media)
      field.onChange(type)
    }
    onPick()
  }

  return (
    <div className="flex flex-col gap-3">
      <div role="radiogroup" aria-label="What are you posting?" className="grid gap-3 sm:grid-cols-3">
        {TYPES.map(({ value, title, description, icon: Icon }) => {
          const selected = field.value === value
          return (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => pick(value)}
              className={cn(
                "flex flex-col items-start gap-3 rounded-xl p-5 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
                selected ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/70"
              )}
            >
              <span
                className={cn(
                  "flex size-11 items-center justify-center rounded-lg",
                  selected ? "bg-primary-foreground/15" : "bg-card"
                )}
              >
                <Icon aria-hidden className="size-5" />
              </span>
              <span className="text-lg font-bold">{title}</span>
              <span className={cn("text-sm", selected ? "text-primary-foreground/80" : "text-muted-foreground")}>
                {description}
              </span>
            </button>
          )
        })}
      </div>
      <FieldError errors={[fieldState.error]} />
    </div>
  )
}
