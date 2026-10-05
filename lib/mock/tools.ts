import type { Tool } from "@/lib/types"

export const TOOLS: Tool[] = [
  { id: "sora", name: "Sora", mediaTypes: ["video"] },
  { id: "veo", name: "Veo", mediaTypes: ["video"] },
  { id: "kling", name: "Kling", mediaTypes: ["video"] },
  { id: "runway", name: "Runway", mediaTypes: ["video", "image"] },
  { id: "midjourney", name: "Midjourney", mediaTypes: ["image", "video"] },
  { id: "flux", name: "Flux", mediaTypes: ["image"] },
  { id: "ideogram", name: "Ideogram", mediaTypes: ["image"] },
  { id: "imagen", name: "Imagen", mediaTypes: ["image"] },
]

export function getToolName(id: string) {
  return TOOLS.find((t) => t.id === id)?.name ?? id
}
