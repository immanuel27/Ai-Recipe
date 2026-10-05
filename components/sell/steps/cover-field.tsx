"use client"

import * as React from "react"
import {
  BookmarkIcon,
  HeartIcon,
  ImagePlusIcon,
  Loader2Icon,
  PlusIcon,
  SquarePenIcon,
  XIcon,
} from "lucide-react"
import { useController, useFormContext, useWatch } from "react-hook-form"
import { toast } from "sonner"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { FieldError } from "@/components/ui/field"
import { FitImage, useFitMode, useVideoAspect } from "@/components/shared/fit-media"
import {
  MAX_IMAGES,
  listingDefaults,
  type ListingFormValues,
} from "@/components/sell/listing-schema"
import { useAppStore } from "@/components/providers/app-store"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { initials } from "@/lib/format"
import { captureVideoPoster, imageToDataUrl } from "@/lib/media"
import { cn } from "@/lib/utils"

const MAX_VIDEO_MB = 200
const MAX_IMAGE_MB = 25

/**
 * Left column of the Details step: upload one video or up to 8 images (any
 * shape), pick the cover, and see a live preview of the post.
 */
export function CoverField() {
  const { setValue, control } = useFormContext<ListingFormValues>()
  const [media, title] = useWatch({ control, name: ["media", "title"] })
  // Registers media.url so validation can report on it
  const { fieldState } = useController({ control, name: "media.url" })
  const { user } = useAppStore()
  const reducedMotion = usePrefersReducedMotion()
  const inputRef = React.useRef<HTMLInputElement>(null)
  const frameRef = React.useRef<HTMLDivElement>(null)
  const videoRef = React.useRef<HTMLVideoElement>(null)
  
  const videoAspect = useVideoAspect(videoRef, media.url)
  const videoFit = useFitMode(frameRef, videoAspect)
  const [selected, setSelected] = React.useState(0)
  const [busy, setBusy] = React.useState(false)
  const [dragging, setDragging] = React.useState(false)
  const [localError, setLocalError] = React.useState<string | null>(null)
  const error = localError ?? fieldState.error?.message

  const images = media.type === "image" ? media.images : []
  const isVideo = media.type === "video" && !!media.url
  const hasMedia = !!media.url
  const full = images.length >= MAX_IMAGES
  const current = Math.min(selected, Math.max(0, images.length - 1))

  function setImages(next: string[]) {
    if (next.length === 0) {
      setValue("media", listingDefaults.media, { shouldValidate: true })
      return
    }
    setValue(
      "media",
      { url: next[0]!, posterUrl: next[0]!, type: "image", images: next },
      { shouldValidate: true }
    )
  }

  async function handleFiles(list: FileList | File[] | null | undefined) {
    const files = Array.from(list ?? [])
    if (!files.length) return
    setLocalError(null)
    const videos = files.filter((f) => f.type.startsWith("video/"))
    const photos = files.filter((f) => f.type.startsWith("image/"))
    if (!videos.length && !photos.length) return setLocalError("Upload images or a video.")

    setBusy(true)
    try {
      // One video on its own...
      if (!photos.length) {
        const file = videos[0]!
        if (file.size > MAX_VIDEO_MB * 1024 * 1024) return setLocalError(`Videos up to ${MAX_VIDEO_MB} MB.`)
        // Mock storage: the video lives in memory for this session; the poster is persisted.
        const url = URL.createObjectURL(file)
        const posterUrl = await captureVideoPoster(url)
        setValue("media", { url, posterUrl, type: "video", images: [] }, { shouldValidate: true })
        if (videos.length > 1) toast("Only one video per post: we used the first one.")
        return
      }

      // ...or a set of images, added after any already there
      if (videos.length) toast("Posts are photos or one video, not both: we added the photos.")
      const ok = photos.filter((f) => f.size <= MAX_IMAGE_MB * 1024 * 1024)
      if (ok.length < photos.length) toast(`Skipped images over ${MAX_IMAGE_MB} MB.`)
      const room = MAX_IMAGES - images.length
      if (room <= 0) return setLocalError(`Up to ${MAX_IMAGES} images per post.`)
      if (ok.length > room) toast(`Up to ${MAX_IMAGES} images: added the first ${room}.`)
      const urls = await Promise.all(ok.slice(0, room).map((f) => imageToDataUrl(f, 1080, 0.8)))
      setImages([...images, ...urls])
      setSelected(images.length) // show the first new image
    } catch {
      setLocalError("We couldn't read that file. Try another one.")
    } finally {
      setBusy(false)
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  function removeImage(i: number) {
    setImages(images.filter((_, j) => j !== i))
    setSelected((s) => (s >= i ? Math.max(0, s - 1) : s))
  }

  function makeCover(i: number) {
    setImages([images[i]!, ...images.filter((_, j) => j !== i)])
    setSelected(0)
  }

  function replaceVideo() {
    setValue("media", listingDefaults.media)
    inputRef.current?.click()
  }

  const browse = () => inputRef.current?.click()

  return (
    <div className="flex flex-col gap-3">
      <div className="flex min-h-8 items-center justify-between gap-3">
        <h2 className="text-xl font-bold tracking-tight">Cover</h2>
        {hasMedia && (isVideo || !full) && (
          <Button
            type="button"
            variant="link"
            size="sm"
            className="gap-1.5 px-0 font-semibold"
            onClick={isVideo ? replaceVideo : browse}
          >
            {isVideo ? <SquarePenIcon aria-hidden /> : <ImagePlusIcon aria-hidden />}
            {isVideo ? "Replace video" : "Add images"}
          </Button>
        )}
      </div>

      <input
        ref={inputRef}
        id="media-upload"
        type="file"
        accept="video/*,image/*"
        multiple
        className="sr-only"
        tabIndex={-1}
        aria-describedby={error ? "media-error" : undefined}
        onChange={(e) => handleFiles(e.target.files)}
      />

      <div
        ref={frameRef}
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          handleFiles(e.dataTransfer.files)
        }}
        className={cn(
          "relative aspect-4/5 w-full overflow-hidden rounded-2xl border border-border transition-colors",
          hasMedia ? "bg-scrim" : "flex flex-col items-center justify-center gap-5 bg-card p-8 text-center",
          dragging && "border-primary bg-primary/5",
          error && !hasMedia && "border-destructive/60"
        )}
      >
        {hasMedia ? (
          <>
            {isVideo ? (
              <video
                ref={videoRef}
                src={media.url}
                poster={media.posterUrl}
                muted
                loop
                playsInline
                autoPlay={!reducedMotion}
                aria-label="Cover video preview"
                className={cn(
                  "absolute inset-0 size-full",
                  videoFit === "contain" ? "object-contain" : "object-cover"
                )}
              />
            ) : (
              <FitImage
                src={images[current]!}
                alt={`Image ${current + 1} preview`}
                sizes="(min-width: 768px) 420px, 100vw"
                className="absolute inset-0"
              />
            )}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-linear-to-t from-scrim/90 via-scrim/40 to-transparent px-6 pt-24 pb-6">
              <p
                className={cn(
                  "line-clamp-2 text-2xl font-semibold tracking-tight text-on-media",
                  !title && "opacity-60"
                )}
              >
                {title || "Your recipe title"}
              </p>
            </div>
          </>
        ) : (
          <>
            <Button type="button" size="pill" onClick={browse} disabled={busy}>
              {busy && <Loader2Icon className="animate-spin" aria-hidden />}
              {busy ? "Processing…" : "Upload images or video"}
            </Button>
            <p className="max-w-64 text-sm text-muted-foreground">
              Up to {MAX_IMAGES} images or one video. Vertical, square and landscape all work.
              Or drag files here.
            </p>
          </>
        )}
      </div>

      {error && <FieldError id="media-error">{error}</FieldError>}

      {/* Image strip: pick, reorder the cover, remove, add */}
      {images.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground tabular-nums">
              {images.length} of {MAX_IMAGES} images · first is the cover
            </span>
            {current > 0 && (
              <Button
                type="button"
                variant="link"
                size="sm"
                className="h-auto px-0 font-semibold"
                onClick={() => makeCover(current)}
              >
                Set as cover
              </Button>
            )}
          </div>
          <ul className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 py-1">
            {images.map((src, i) => (
              <li key={src.slice(-24) + i} className="relative shrink-0">
                <button
                  type="button"
                  onClick={() => setSelected(i)}
                  aria-label={`Show image ${i + 1}${i === 0 ? " (cover)" : ""}`}
                  aria-pressed={i === current}
                  className={cn(
                    "relative block size-16 overflow-hidden rounded-lg bg-muted outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                    i === current ? "ring-2 ring-primary" : "ring-1 ring-foreground/10"
                  )}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- local data URL thumbnail */}
                  <img src={src} alt="" className="size-full object-cover" />
                  {i === 0 && (
                    <span className="absolute inset-x-0 bottom-0 bg-scrim/70 text-[0.625rem] font-semibold text-on-media">
                      Cover
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  aria-label={`Remove image ${i + 1}`}
                  className="absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full bg-foreground text-background shadow outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <XIcon className="size-3" aria-hidden />
                </button>
              </li>
            ))}
            {!full && (
              <li className="shrink-0">
                <button
                  type="button"
                  onClick={browse}
                  disabled={busy}
                  aria-label="Add images"
                  className="flex size-16 items-center justify-center rounded-lg border-2 border-dashed border-border text-muted-foreground outline-none hover:border-primary/50 hover:text-primary focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  {busy ? <Loader2Icon className="size-5 animate-spin" aria-hidden /> : <PlusIcon className="size-5" aria-hidden />}
                </button>
              </li>
            )}
          </ul>
        </div>
      )}

      {/* How you'll appear on the post */}
      <div className="flex items-center justify-between gap-3" aria-label="Preview of your post's stats">
        <div className="flex min-w-0 items-center gap-2.5">
          <Avatar className="size-9">
            <AvatarFallback className="bg-primary font-semibold text-primary-foreground">
              {user ? initials(user.username) : "?"}
            </AvatarFallback>
          </Avatar>
          <span className="truncate font-medium">{user ? `@${user.username}` : "You"}</span>
        </div>
        <div className="flex items-center gap-4 text-muted-foreground tabular-nums">
          <span className="flex items-center gap-1.5" aria-label="0 likes">
            <HeartIcon className="size-5" aria-hidden />0
          </span>
          <span className="flex items-center gap-1.5" aria-label="0 saves">
            <BookmarkIcon className="size-5" aria-hidden />0
          </span>
        </div>
      </div>
    </div>
  )
}
