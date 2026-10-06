// Server only: reads files from public/
import fs from "node:fs"
import path from "node:path"

export interface Size {
  width: number
  height: number
}

const cache = new Map<string, Size | null>()

/** Width and height from a JPEG's start-of-frame or a PNG's header, without decoding pixels. */
function readImageSize(file: string): Size | null {
  const buf = fs.readFileSync(file)
  if (buf[0] === 0x89 && buf.toString("ascii", 1, 4) === "PNG") {
    return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) }
  }
  if (buf[0] !== 0xff || buf[1] !== 0xd8) return null
  let i = 2
  while (i < buf.length) {
    if (buf[i] !== 0xff) return null
    const marker = buf[i + 1]!
    const length = buf.readUInt16BE(i + 2)
    // SOF0-SOF15, except DHT (C4), JPG (C8) and DAC (CC)
    if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
      return { height: buf.readUInt16BE(i + 5), width: buf.readUInt16BE(i + 7) }
    }
    i += 2 + length
  }
  return null
}

/**
 * A poster's real shape, so masonry tiles reserve the right space before the
 * image loads. Picsum URLs carry their size; local files are read once.
 */
export function posterSize(url: string): Size | null {
  if (cache.has(url)) return cache.get(url)!
  let size: Size | null = null
  const picsum = url.match(/picsum\.photos\/(?:seed|id)\/[^/]+\/(\d+)\/(\d+)/)
  if (picsum) {
    size = { width: Number(picsum[1]), height: Number(picsum[2]) }
  } else if (url.startsWith("/")) {
    try {
      size = readImageSize(path.join(process.cwd(), "public", url))
    } catch {
      size = null
    }
  }
  cache.set(url, size)
  return size
}
