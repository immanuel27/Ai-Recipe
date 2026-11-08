"use client"

import * as React from "react"
import { useController, useFormContext } from "react-hook-form"

import { FieldError } from "@/components/ui/field"
import { CloseIcon, UploadIcon } from "@/components/icons"
import { MAX_PROOF_SHOTS, type ListingFormValues } from "@/components/sell/listing-schema"
import { imageToDataUrl } from "@/lib/media"

const MAX_SHOT_MB = 15

/**
 * Up to 3 private screenshots of the generation (the chat, the terminal, the
 * project), as proof instead of a share link. Downscaled so drafts can keep
 * them; uploaded to the private proofs bucket on publish.
 */
export function ProofShotsField({ describedBy }: { describedBy?: string }) {
  const { control } = useFormContext<ListingFormValues>()
  const { field, fieldState } = useController({ control, name: "proofShots" })
  const [fileError, setFileError] = React.useState<string | null>(null)
  const shots = field.value
  const room = MAX_PROOF_SHOTS - shots.length

  async function onFiles(files: FileList | null) {
    const picked = Array.from(files ?? [])
    if (!picked.length) return
    if (picked.some((f) => !f.type.startsWith("image/"))) return setFileError("Add image files (screenshots).")
    if (picked.some((f) => f.size > MAX_SHOT_MB * 1024 * 1024)) return setFileError(`Screenshots up to ${MAX_SHOT_MB} MB.`)
    setFileError(picked.length > room ? `Up to ${MAX_PROOF_SHOTS} screenshots: kept the first ${room}.` : null)
    const added = await Promise.all(picked.slice(0, room).map((f) => imageToDataUrl(f, 1600, 0.85)))
    field.onChange([...shots, ...added.map((src) => ({ src, path: "" }))])
  }

  return (
    <div className="flex flex-col gap-2">
      <ul className="flex flex-wrap gap-3" aria-label="Proof screenshots" aria-describedby={describedBy}>
        {shots.map((shot, i) => (
          <li key={shot.path || shot.src} className="relative">
            <div className="size-20 overflow-hidden rounded-xl bg-muted ring-1 ring-foreground/10">
              {shot.src && (
                // eslint-disable-next-line @next/next/no-img-element -- local or signed preview
                <img src={shot.src} alt={`Proof screenshot ${i + 1}`} className="size-full object-cover" />
              )}
            </div>
            <button
              type="button"
              aria-label={`Remove proof screenshot ${i + 1}`}
              onClick={() => field.onChange(shots.filter((_, j) => j !== i))}
              className="absolute -top-2 -right-2 flex size-7 items-center justify-center rounded-full bg-foreground text-background outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <CloseIcon aria-hidden className="size-3.5" />
            </button>
          </li>
        ))}
        {room > 0 && (
          <li>
            <input
              id="proofShots"
              type="file"
              accept="image/*"
              multiple
              className="peer sr-only"
              onChange={(e) => {
                void onFiles(e.target.files)
                e.target.value = ""
              }}
            />
            <label
              htmlFor="proofShots"
              className="flex size-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl bg-muted text-xs font-semibold text-muted-foreground ring-1 ring-foreground/10 transition-colors hover:bg-muted/70 peer-focus-visible:ring-2 peer-focus-visible:ring-ring"
            >
              <UploadIcon className="size-5" aria-hidden />
              Screenshot
            </label>
          </li>
        )}
      </ul>
      {fileError && <p className="type-meta text-destructive">{fileError}</p>}
      <FieldError errors={[fieldState.error]} />
    </div>
  )
}
