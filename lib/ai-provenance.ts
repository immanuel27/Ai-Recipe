// Checks an uploaded file for an "AI tag": provenance metadata that AI tools
// write into the files they export. Runs in the browser on the original file
// (before any re-encoding, which would strip the metadata).
//
// Accepted signals, strongest first:
//  1. Content Credentials (C2PA) whose digital source type is trained
//     algorithmic media (OpenAI, Adobe Firefly, Google, Microsoft, Sora…)
//  2. IPTC digital source type in XMP metadata (Midjourney, Google, Shutterstock AI…)
//  3. Generator metadata: Stable Diffusion / ComfyUI parameters embedded in PNGs,
//     or a known AI tool named in a software / creator-tool / generator field
//
// This is a client-side gate for the prototype. Metadata can be stripped or
// forged, so production should also verify C2PA signatures server-side.

export type AiTagMethod = "c2pa" | "iptc" | "generator"

export interface AiTag {
  method: AiTagMethod
  /** Human-readable source, e.g. "Content Credentials (C2PA)" or "Midjourney" */
  detail: string
}

export const AI_TAG_LABELS: Record<AiTagMethod, string> = {
  c2pa: "Content Credentials (C2PA)",
  iptc: "IPTC digital source type",
  generator: "AI generator metadata",
}

/** IPTC digital source types that mean "made by AI" (also used inside C2PA). */
const AI_SOURCE_TYPE =
  /digitalsourcetype\/(trainedAlgorithmicMedia|compositeWithTrainedAlgorithmicMedia|algorithmicMedia|compositeSynthetic)/i

/** Metadata keys that can name the generating software. */
const METADATA_KEYS =
  /(Software|CreatorTool|softwareAgent|claim_generator|Generator|generator|©too|©swr|encoder|Comment|Description|Credit|Make)/g

/** AI tools we recognise when named inside a metadata field. */
const AI_TOOLS: [RegExp, string][] = [
  [/Midjourney/i, "Midjourney"],
  [/DALL.{0,3}E/, "DALL·E"],
  [/OpenAI|ChatGPT/i, "OpenAI"],
  [/\bSora\b/, "Sora"],
  [/Adobe Firefly|\bFirefly\b/, "Adobe Firefly"],
  [/Stable ?Diffusion|SDXL|Automatic1111|stability\.ai/i, "Stable Diffusion"],
  [/ComfyUI/i, "ComfyUI"],
  [/NovelAI/i, "NovelAI"],
  [/Leonardo\.?Ai/i, "Leonardo.Ai"],
  [/Ideogram/i, "Ideogram"],
  [/Imagen|Made with Google AI|Gemini/i, "Google"],
  [/\bVeo\b/, "Veo"],
  [/Runway(ML)?|Gen-[234]/, "Runway"],
  [/Kling/i, "Kling"],
  [/Pika( Labs)?/, "Pika"],
  [/\bLuma (AI|Labs)\b|Dream Machine/, "Luma"],
  [/Black Forest Labs|FLUX\.1|\bFlux\b/, "Flux"],
  [/Bing Image Creator|Microsoft Designer/i, "Microsoft Designer"],
  [/Krea\.?ai|\bKrea\b/, "Krea"],
  [/Higgsfield/i, "Higgsfield"],
]

const HEAD_BYTES = 16 * 1024 * 1024
const TAIL_BYTES = 16 * 1024 * 1024

/** Read the parts of a file where metadata lives (all of it if small). */
async function readMetadataRegions(file: File) {
  const decoder = new TextDecoder("latin1")
  if (file.size <= HEAD_BYTES + TAIL_BYTES) {
    return decoder.decode(await file.arrayBuffer())
  }
  const [head, tail] = await Promise.all([
    file.slice(0, HEAD_BYTES).arrayBuffer(),
    file.slice(file.size - TAIL_BYTES).arrayBuffer(),
  ])
  return decoder.decode(head) + "\n" + decoder.decode(tail)
}

/** A known AI tool named shortly after a metadata key, or null. */
function toolInMetadata(text: string) {
  for (const key of text.matchAll(METADATA_KEYS)) {
    const window = text.slice(key.index, key.index + 240)
    for (const [pattern, name] of AI_TOOLS) {
      if (pattern.test(window)) return name
    }
  }
  return null
}

/** Returns the AI tag found in the file, or null if there isn't one. */
export async function detectAiTag(file: File): Promise<AiTag | null> {
  const text = await readMetadataRegions(file)

  // 1–2. Digital source type: inside a C2PA manifest, or plain IPTC/XMP
  if (AI_SOURCE_TYPE.test(text)) {
    const inC2pa = /c2pa/.test(text) && /jumb|jumd|caBX|c2pa\.(actions|created)/.test(text)
    return inC2pa
      ? { method: "c2pa", detail: AI_TAG_LABELS.c2pa }
      : { method: "iptc", detail: AI_TAG_LABELS.iptc }
  }

  // 3a. Stable Diffusion (Automatic1111 / Forge) settings in a PNG text chunk
  if (/parameters\0/.test(text) && /Steps: \d+/.test(text) && /Sampler: /.test(text)) {
    return { method: "generator", detail: "Stable Diffusion" }
  }
  // 3b. ComfyUI workflow embedded in a PNG
  if (/(prompt|workflow)\0/.test(text) && /"class_type"\s*:/.test(text)) {
    return { method: "generator", detail: "ComfyUI" }
  }
  // 3c. A known AI tool named in a software / generator field
  const tool = toolInMetadata(text)
  if (tool) return { method: "generator", detail: tool }

  return null
}

/** The error shown when a file has no AI tag. */
export function missingAiTagMessage(fileName: string) {
  return `“${fileName}” has no AI tag. AI Recipe only accepts images and videos made with AI. Upload the original file exported from your AI tool so its Content Credentials or generator tag stay in it (screenshots and edited copies lose them).`
}
