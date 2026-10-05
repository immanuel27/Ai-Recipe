// Browser-only helpers for local media uploads (mock storage).

/** Read an image file and downscale it to a JPEG data URL small enough for localStorage. */
export async function imageToDataUrl(file: File, maxSize = 1080, quality = 0.82) {
  const url = URL.createObjectURL(file)
  try {
    const img = await loadImage(url)
    const scale = Math.min(1, maxSize / Math.max(img.width, img.height))
    const canvas = document.createElement("canvas")
    canvas.width = Math.round(img.width * scale)
    canvas.height = Math.round(img.height * scale)
    canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height)
    return canvas.toDataURL("image/jpeg", quality)
  } finally {
    URL.revokeObjectURL(url)
  }
}

/** Grab an early frame of a video as a poster image. */
export async function captureVideoPoster(src: string, maxSize = 1080) {
  const video = document.createElement("video")
  video.muted = true
  video.playsInline = true
  video.preload = "auto"
  video.src = src
  await new Promise<void>((resolve, reject) => {
    video.onloadeddata = () => resolve()
    video.onerror = () => reject(new Error("Could not read video"))
  })
  video.currentTime = Math.min(0.5, video.duration / 2 || 0)
  await new Promise<void>((resolve) => {
    video.onseeked = () => resolve()
  })
  const scale = Math.min(1, maxSize / Math.max(video.videoWidth, video.videoHeight))
  const canvas = document.createElement("canvas")
  canvas.width = Math.round(video.videoWidth * scale)
  canvas.height = Math.round(video.videoHeight * scale)
  canvas.getContext("2d")!.drawImage(video, 0, 0, canvas.width, canvas.height)
  return canvas.toDataURL("image/jpeg", 0.8)
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error("Could not read image"))
    img.src = src
  })
}
