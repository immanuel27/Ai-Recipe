/**
 * Ambient colour: reads a shot's palette so the canvas glow can take on its
 * feel. Remote images go through the Next image optimiser so the pixels are
 * same-origin and the canvas stays readable.
 */

export interface Ambient {
  core: string
  mid: string
  rim: string
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255
  g /= 255
  b /= 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  if (max === min) return [0, 0, l]
  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  const h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4
  return [h * 60, s, l]
}

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n))
const hsl = (h: number, s: number, l: number, a = 1) =>
  `hsl(${Math.round(h)} ${Math.round(s * 100)}% ${Math.round(l * 100)}% / ${a})`

function sameOrigin(src: string) {
  if (src.startsWith("/") || src.startsWith("data:") || src.startsWith("blob:")) return src
  return `/_next/image?url=${encodeURIComponent(src)}&w=64&q=75`
}

const cache = new Map<string, Promise<Ambient | null>>()

export function sampleAmbient(src: string, dark: boolean): Promise<Ambient | null> {
  const key = `${src}|${dark}`
  const hit = cache.get(key)
  if (hit) return hit
  const job = read(src, dark).catch(() => null)
  cache.set(key, job)
  return job
}

async function read(src: string, dark: boolean): Promise<Ambient | null> {
  const img = new Image()
  img.decoding = "async"
  img.src = sameOrigin(src)
  await img.decode()

  const size = 32
  const canvas = document.createElement("canvas")
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext("2d", { willReadFrequently: true })
  if (!ctx) return null
  ctx.drawImage(img, 0, 0, size, size)
  const { data } = ctx.getImageData(0, 0, size, size)

  // Twelve hue buckets, weighted towards saturated mid-tones (the colours you notice)
  const buckets = Array.from({ length: 12 }, () => ({ w: 0, h: 0, s: 0 }))
  let sumS = 0
  let sumL = 0
  let sumX = 0
  let sumY = 0
  const px = data.length / 4
  for (let i = 0; i < data.length; i += 4) {
    const [h, s, l] = rgbToHsl(data[i]!, data[i + 1]!, data[i + 2]!)
    sumS += s
    sumL += l
    sumX += Math.cos((h * Math.PI) / 180) * s
    sumY += Math.sin((h * Math.PI) / 180) * s
    const w = s * Math.max(0, 1 - Math.abs(l - 0.5) * 1.8)
    const b = buckets[Math.floor(h / 30) % 12]!
    b.w += w
    b.h += h * w
    b.s += s * w
  }

  const ranked = buckets
    .map((b, i) => ({ i, w: b.w, h: b.w ? b.h / b.w : i * 30 + 15, s: b.w ? b.s / b.w : 0 }))
    .sort((a, b) => b.w - a.w)
  const top = ranked[0]!
  // A second colour that is clearly different, if the shot has one
  const second = ranked.find((b) => b.w > top.w * 0.25 && Math.min(Math.abs(b.i - top.i), 12 - Math.abs(b.i - top.i)) >= 2) ?? top
  const avgHue = ((Math.atan2(sumY, sumX) * 180) / Math.PI + 360) % 360
  const avgS = sumS / px
  const avgL = sumL / px
  // Near-greyscale shots keep a quiet, desaturated glow instead of inventing colour
  const grey = top.w / px < 0.04

  const coreS = grey ? clamp(avgS, 0.05, 0.25) : clamp(top.s * 1.25, 0.4, 0.95)
  const midS = grey ? clamp(avgS, 0.05, 0.2) : clamp(second.s * 1.2, 0.35, 0.9)
  const rimS = clamp(avgS * 0.9, 0.08, 0.5)

  if (dark) {
    return {
      core: hsl(top.h, coreS, clamp(avgL * 0.6 + 0.12, 0.28, 0.45)),
      mid: hsl(second.h, midS, 0.52),
      rim: hsl(avgHue, rimS, 0.84),
    }
  }
  return {
    core: hsl(top.h, coreS, 0.6, 0.5),
    mid: hsl(second.h, midS, 0.72, 0.38),
    rim: hsl(avgHue, rimS, 0.9, 0.7),
  }
}

const PROPS = ["--glow-core", "--glow-mid", "--glow-rim"] as const

/** Paint the canvas glow (or hand it back to the theme with null). */
export function applyAmbient(a: Ambient | null) {
  const root = document.documentElement.style
  if (!a) {
    PROPS.forEach((p) => root.removeProperty(p))
    return
  }
  root.setProperty("--glow-core", a.core)
  root.setProperty("--glow-mid", a.mid)
  root.setProperty("--glow-rim", a.rim)
}
