"use client"

import { createClient } from "@/lib/supabase/client"

const SIZE = 400

/** Centre-crop an image to a square and shrink it to SIZE×SIZE JPEG. */
async function squareJpeg(file: File): Promise<Blob> {
  const url = URL.createObjectURL(file)
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image()
      el.onload = () => resolve(el)
      el.onerror = () => reject(new Error("We couldn't read that image. Try another one."))
      el.src = url
    })
    const side = Math.min(img.width, img.height)
    const canvas = document.createElement("canvas")
    canvas.width = SIZE
    canvas.height = SIZE
    canvas
      .getContext("2d")!
      .drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, SIZE, SIZE)
    return await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Couldn't process that image."))), "image/jpeg", 0.86)
    )
  } finally {
    URL.revokeObjectURL(url)
  }
}

/**
 * Upload a profile picture into the user's own Storage folder and return its
 * public URL. New file name each time, so cached copies of the old photo never show.
 */
export async function uploadAvatar(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("Choose an image file.")
  if (file.size > 15 * 1024 * 1024) throw new Error("Images up to 15 MB.")
  const supabase = createClient()
  const { data: auth } = await supabase.auth.getUser()
  if (!auth.user) throw new Error("Your sign-in expired. Please sign in again.")
  const blob = await squareJpeg(file)
  const path = `${auth.user.id}/avatar/avatar-${Date.now().toString(36)}.jpg`
  const { error } = await supabase.storage.from("media").upload(path, blob, { contentType: "image/jpeg" })
  if (error) throw new Error(`Upload failed: ${error.message}`)
  return supabase.storage.from("media").getPublicUrl(path).data.publicUrl
}
