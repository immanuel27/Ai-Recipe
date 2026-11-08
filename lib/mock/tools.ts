import type { Listing, ListingKind, PostType, Tool, ToolId } from "@/lib/types"

export const TOOLS: Tool[] = [
  {
    id: "sora",
    name: "Sora",
    kind: "media",
    mediaTypes: ["video"],
    logo: "/logos/openai.webp",
    url: "https://sora.chatgpt.com",
    proofLinks: ["sora.chatgpt.com/", "sora.com/"],
    proofHint: "The share link of the video on Sora.",
  },
  { id: "veo", name: "Veo", kind: "media", mediaTypes: ["video"], logo: "/logos/gemini.svg", url: "https://deepmind.google/models/veo/" },
  { id: "kling", name: "Kling", kind: "media", mediaTypes: ["video"], logo: "/logos/kling.webp", url: "https://klingai.com" },
  {
    id: "higgsfield",
    name: "Higgsfield",
    kind: "media",
    mediaTypes: ["video", "image"],
    logo: "/logos/higgsfield.webp",
    url: "https://higgsfield.ai",
    proofLinks: ["higgsfield.ai/", "*.higgsfield.ai/"],
    proofHint: "Share → Copy link on the generation, e.g. higgsfield.ai/s/…",
  },
  { id: "runway", name: "Runway", kind: "media", mediaTypes: ["video", "image"], logo: "/logos/runway.webp", url: "https://runwayml.com" },
  {
    id: "midjourney",
    name: "Midjourney",
    kind: "media",
    mediaTypes: ["image", "video"],
    logo: "/logos/midjourney.webp",
    url: "https://www.midjourney.com",
    proofLinks: ["midjourney.com/", "*.midjourney.com/"],
    proofHint: "The job link, e.g. midjourney.com/jobs/…",
  },
  { id: "flux", name: "Flux", kind: "media", mediaTypes: ["image"], logo: "/logos/flux.webp", url: "https://bfl.ai" },
  { id: "ideogram", name: "Ideogram", kind: "media", mediaTypes: ["image"], logo: "/logos/ideogram.webp", url: "https://ideogram.ai" },
  { id: "imagen", name: "Imagen", kind: "media", mediaTypes: ["image"], logo: "/logos/gemini.svg", url: "https://deepmind.google/models/imagen/" },

  // Websites built from prompts. Their share links show the chat or project behind the site.
  {
    id: "chatgpt",
    name: "ChatGPT",
    kind: "website",
    mediaTypes: ["image", "video"],
    logo: "/logos/openai.webp",
    url: "https://chatgpt.com",
    proofLinks: ["chatgpt.com/share/", "chatgpt.com/canvas/shared/", "chat.openai.com/share/", "*.chatgpt.site/"],
    proofHint: "Share the chat and paste its link, e.g. chatgpt.com/share/…",
  },
  {
    id: "claude",
    name: "Claude",
    kind: "website",
    mediaTypes: ["image", "video"],
    logo: "/logos/claude.webp",
    url: "https://claude.ai",
    proofLinks: ["claude.ai/share/", "claude.ai/public/"],
    proofHint: "Share the chat (claude.ai/share/…) or publish the artifact (claude.ai/public/artifacts/…).",
  },
  {
    id: "lovable",
    name: "Lovable",
    kind: "website",
    mediaTypes: ["image", "video"],
    logo: "/logos/lovable.webp",
    url: "https://lovable.dev",
    proofLinks: ["lovable.dev/", "*.lovable.app/", "*.lovableproject.com/"],
    proofHint: "Your public project link (lovable.dev/projects/…) or the published app.",
  },
  {
    id: "figma-make",
    name: "Figma Make",
    kind: "website",
    mediaTypes: ["image", "video"],
    logo: "/logos/figma-make.webp",
    url: "https://www.figma.com/make/",
    proofLinks: ["figma.com/make/", "figma.com/proto/", "*.figma.com/make/", "*.figma.site/"],
    proofHint: "The Make file's share link (figma.com/make/…) with viewing turned on.",
  },
  {
    id: "framer",
    name: "Framer",
    kind: "website",
    mediaTypes: ["image", "video"],
    logo: "/logos/framer.webp",
    url: "https://www.framer.com",
    proofLinks: ["framer.com/", "*.framer.com/", "framer.link/", "*.framer.website/", "*.framer.app/", "*.framer.ai/", "*.framer.media/"],
    proofHint: "Your Framer share or remix link (framer.link/…), or the published framer.website address.",
  },

  // Motion graphics, often written as code and rendered on the creator's own computer,
  // so the video carries no AI tag. Proof is any link or a few screenshots.
  { id: "claude-code", name: "Claude Code", kind: "motion", mediaTypes: ["video"], logo: "/logos/claude.webp", url: "https://claude.com/product/claude-code" },
  { id: "codex", name: "Codex", kind: "motion", mediaTypes: ["video"], logo: "/logos/openai.webp", url: "https://openai.com/codex/" },
  { id: "cursor", name: "Cursor", kind: "motion", mediaTypes: ["video"], logo: "/logos/cursor.webp", url: "https://cursor.com" },
  { id: "remotion", name: "Remotion", kind: "motion", mediaTypes: ["video"], logo: "/logos/remotion.webp", url: "https://www.remotion.dev" },
  { id: "after-effects", name: "After Effects", kind: "motion", mediaTypes: ["video"], logo: "/logos/after-effects.webp", url: "https://www.adobe.com/products/aftereffects.html" },
  { id: "jitter", name: "Jitter", kind: "motion", mediaTypes: ["video"], logo: "/logos/jitter.webp", url: "https://jitter.video" },
]

export function getTool(id: string) {
  return TOOLS.find((t) => t.id === id)
}

export function getToolName(id: string) {
  return TOOLS.find((t) => t.id === id)?.name ?? id
}

/** "website" for site builders and chat tools, "motion" for motion graphics tools, "media" for video and image tools */
export function toolKind(id: string): ListingKind {
  return getTool(id)?.kind ?? "media"
}

/** The value as an https URL, or null */
export function parseHttpsUrl(value: string) {
  try {
    const url = new URL(value.trim())
    return url.protocol === "https:" ? url : null
  } catch {
    return null
  }
}

/** Does this look like a share link from the tool? (Any https link for tools without a known format.) */
export function isProofLinkFor(toolId: string, value: string) {
  const url = parseHttpsUrl(value)
  if (!url) return false
  const patterns = getTool(toolId)?.proofLinks
  if (!patterns?.length) return true
  const host = url.hostname.replace(/^www\./, "")
  const path = url.pathname.endsWith("/") ? url.pathname : `${url.pathname}/`
  return patterns.some((p) => {
    const slash = p.indexOf("/")
    const pHost = p.slice(0, slash)
    const pPath = p.slice(slash)
    const hostOk = pHost.startsWith("*.") ? host.endsWith(pHost.slice(1)) : host === pHost
    return hostOk && path.startsWith(pPath)
  })
}

/** Every tool a listing used, main one first */
export function listingTools(listing: Pick<Listing, "tool" | "tools">): ToolId[] {
  return listing.tools?.length ? listing.tools : [listing.tool]
}

/** Tools offered for each kind of post */
export function toolsForPostType(type: PostType) {
  if (type === "website" || type === "motion") return TOOLS.filter((t) => t.kind === type)
  const media = type === "video" ? "video" : "image"
  return TOOLS.filter((t) => t.kind === "media" && t.mediaTypes.includes(media))
}

/** A share link from any of the tools used */
export function isProofLinkForAny(toolIds: string[], value: string) {
  return toolIds.some((id) => isProofLinkFor(id, value))
}
