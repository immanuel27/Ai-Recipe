/**
 * Shrink an uploaded video in the browser before it's stored, so every play in
 * the feed downloads less (storage traffic is what the hosting plan limits).
 * H.264 MP4, at most 720p on the short side, medium quality: looks the same on a
 * phone and is typically several times smaller. Falls back to the original file
 * whenever the browser can't convert it or the result isn't meaningfully smaller.
 * Run detectAiTag() on the ORIGINAL first: conversion drops provenance metadata.
 */

/** Small files aren't worth converting */
const MIN_BYTES = 3 * 1024 * 1024
/** Short side of the output, in pixels (720 = 720p) */
const MAX_SHORT_SIDE = 720

export async function compressVideo(file: File, onProgress?: (fraction: number) => void): Promise<File> {
  if (file.size < MIN_BYTES || typeof VideoEncoder === "undefined") return file
  try {
    const {
      ALL_FORMATS,
      BlobSource,
      BufferTarget,
      Conversion,
      Input,
      Mp4OutputFormat,
      Output,
      QUALITY_MEDIUM,
      canEncode,
    } = await import("mediabunny")
    if (!(await canEncode("avc"))) return file

    const input = new Input({ source: new BlobSource(file), formats: ALL_FORMATS })
    const track = await input.getPrimaryVideoTrack()
    if (!track) return file
    const { displayWidth: w, displayHeight: h } = track
    // Only scale down, keeping the shape: cap the short side
    const scale = Math.min(1, MAX_SHORT_SIDE / Math.min(w, h))
    const size = w <= h ? { width: even(w * scale) } : { height: even(h * scale) }

    const target = new BufferTarget()
    const output = new Output({ format: new Mp4OutputFormat({ fastStart: "in-memory" }), target })
    const conversion = await Conversion.init({
      input,
      output,
      video: { ...size, codec: "avc", quality: QUALITY_MEDIUM },
      audio: { codec: "aac", quality: QUALITY_MEDIUM },
    })
    if (!conversion.isValid) return file
    conversion.onProgress = (p) => onProgress?.(p)
    await conversion.execute()

    const buffer = target.buffer
    // Keep the original unless we saved at least 15%
    if (!buffer || buffer.byteLength > file.size * 0.85) return file
    const name = file.name.replace(/\.[^.]+$/, "") + ".mp4"
    return new File([buffer], name, { type: "video/mp4" })
  } catch (error) {
    console.warn("[video] Couldn't optimise the video, uploading the original", error)
    return file
  }
}

/** Video encoders need even dimensions */
function even(n: number) {
  return Math.max(2, Math.round(n / 2) * 2)
}
