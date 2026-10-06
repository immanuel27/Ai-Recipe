import { SuccessIcon } from "@/components/icons"
import { AI_TAG_LABELS, type AiTag } from "@/lib/ai-provenance"
import { cn } from "@/lib/utils"

/** "Made with AI" label for media whose file carried a verified AI tag. */
export function AiTagBadge({
  tag,
  onMedia,
  showSource,
  className,
}: {
  tag: AiTag
  /** Frosted style for use over images and video */
  onMedia?: boolean
  /** Also say where the tag came from, e.g. "· Content Credentials (C2PA)" */
  showSource?: boolean
  className?: string
}) {
  const source = tag.method === "generator" ? tag.detail : AI_TAG_LABELS[tag.method]
  return (
    <span
      title={`AI tag verified from the original file: ${source}`}
      className={cn(
        "inline-flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold",
        onMedia
          ? "bg-scrim/60 text-on-media backdrop-blur-md"
          : "bg-success/15 text-success",
        className
      )}
    >
      <SuccessIcon className="size-3.5" aria-hidden />
      Made with AI
      {showSource && <span className="font-normal opacity-80">· {source}</span>}
    </span>
  )
}
