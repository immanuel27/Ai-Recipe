import type { Tool } from "@/lib/types"

export const TOOLS: Tool[] = [
  { id: "sora", name: "Sora", mediaTypes: ["video"], logo: "/logos/openai.webp", url: "https://sora.chatgpt.com" },
  { id: "veo", name: "Veo", mediaTypes: ["video"], logo: "/logos/gemini.svg", url: "https://deepmind.google/models/veo/" },
  { id: "kling", name: "Kling", mediaTypes: ["video"], logo: "/logos/kling.webp", url: "https://klingai.com" },
  { id: "runway", name: "Runway", mediaTypes: ["video", "image"], url: "https://runwayml.com" },
  { id: "midjourney", name: "Midjourney", mediaTypes: ["image", "video"], url: "https://www.midjourney.com" },
  { id: "flux", name: "Flux", mediaTypes: ["image"], url: "https://bfl.ai" },
  { id: "ideogram", name: "Ideogram", mediaTypes: ["image"], url: "https://ideogram.ai" },
  { id: "imagen", name: "Imagen", mediaTypes: ["image"], logo: "/logos/gemini.svg", url: "https://deepmind.google/models/imagen/" },
]

export function getTool(id: string) {
  return TOOLS.find((t) => t.id === id)
}

export function getToolName(id: string) {
  return TOOLS.find((t) => t.id === id)?.name ?? id
}
