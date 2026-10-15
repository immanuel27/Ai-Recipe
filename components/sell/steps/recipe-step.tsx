"use client"

import * as React from "react"
import { useFieldArray, useFormContext, useWatch } from "react-hook-form"

import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  DeleteIcon,
  DocumentIcon,
  EditStackIcon,
  ImageMissingIcon,
  PlusIcon,
  PromptsIcon,
  RecipeSettingsIcon,
  UploadIcon,
  type IconType,
} from "@/components/icons"
import type { ListingFormValues } from "@/components/sell/listing-schema"
import { imageToDataUrl } from "@/lib/media"
import { cn } from "@/lib/utils"

const item = "flex items-start gap-3 rounded-2xl bg-muted/50 p-4"
const field = "bg-background/60"

/**
 * The recipe, in the same five numbered parts buyers see. Prompts is the only
 * required part; the rest stay one line until you add something.
 */
export function RecipeStep() {
  return (
    <div className="flex flex-col gap-8">
      <Strength />
      <ol className="flex flex-col gap-8">
        <PromptsPart />
        <ModelPart />
        <AssetsPart />
        <PairPart
          n={4}
          icon={EditStackIcon}
          title="Edit stack"
          why="What you did after generating, in order."
          name="editSteps"
          first={{ key: "tool", label: "Tool", placeholder: "DaVinci Resolve" }}
          second={{ key: "note", label: "What you did", placeholder: "Speed ramp into shot 3" }}
        />
        <FailuresPart />
      </ol>
    </div>
  )
}

/** How much of the recipe buyers will get, with the one nudge that matters most. */
function Strength() {
  const { control } = useFormContext<ListingFormValues>()
  const [prompts, model, assets, editSteps, failures] = useWatch({
    control,
    name: ["prompts", "model", "assets", "editSteps", "failures"],
  })
  const parts = [
    (prompts ?? []).some((p) => !!p.fileUrl || p.text.trim().length >= 10),
    !!model?.trim(),
    (assets ?? []).length > 0,
    (editSteps ?? []).length > 0,
    (failures ?? []).length > 0,
  ]
  const filled = parts.filter(Boolean).length
  const nudge =
    filled === parts.length
      ? "Complete. Buyers get the whole story."
      : !parts[4]
        ? "Recipes with failed takes sell better."
        : "Each part you add makes it easier to buy."

  return (
    <div className="glass flex flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl p-4" aria-live="polite">
      <span aria-hidden className="flex gap-1">
        {parts.map((on, i) => (
          <span key={i} className={cn("h-2 w-6 rounded-full transition-colors duration-240", on ? "bg-brand" : "bg-foreground/15")} />
        ))}
      </span>
      <span className="font-semibold">
        Your recipe shows {filled} of {parts.length} parts.
      </span>
      <span className="text-muted-foreground">{nudge}</span>
    </div>
  )
}

/** One numbered part: badge, a thread to the next part, a one-line pitch while empty, and its items. */
function Part({
  n,
  icon: Icon,
  title,
  why,
  count,
  optional = true,
  last = false,
  addLabel,
  onAdd,
  children,
}: {
  n: number
  icon: IconType
  title: string
  why: string
  count: number
  optional?: boolean
  last?: boolean
  addLabel?: string
  onAdd?: () => void
  children?: React.ReactNode
}) {
  return (
    <li className="relative grid grid-cols-[24px_minmax(0,1fr)] gap-x-4">
      <span
        aria-hidden
        className="flex size-6 items-center justify-center rounded-full bg-brand/15 type-meta font-semibold text-link tabular-nums ring-1 ring-brand/35 ring-inset"
      >
        {n}
      </span>
      {!last && <span aria-hidden className="absolute top-8 -bottom-6 left-3 w-px -translate-x-1/2 bg-foreground/12" />}
      <div className="flex min-w-0 flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 flex-col gap-2">
            <h3 className="flex min-h-6 flex-wrap items-center gap-2 font-semibold">
              <span className="sr-only">Part {n}:</span>
              <Icon aria-hidden className="size-4 text-muted-foreground" />
              {title}
              {count > 0 && <span className="font-normal text-muted-foreground tabular-nums">{count}</span>}
              {optional ? (
                <span className="rounded-full bg-muted px-2 type-meta font-normal text-muted-foreground">Optional</span>
              ) : (
                <span className="rounded-full bg-brand/15 px-2 type-meta font-normal text-link">Required</span>
              )}
            </h3>
            {count === 0 && <p className="type-body text-muted-foreground">{why}</p>}
          </div>
          {onAdd && <button
            type="button"
            onClick={onAdd}
            aria-label={addLabel}
            className="glass-button flex h-9 shrink-0 items-center gap-2 rounded-full px-4 type-body font-semibold outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <PlusIcon aria-hidden weight="bold" className="size-4" />
            Add
          </button>}
        </div>
        {children}
      </div>
    </li>
  )
}

function RemoveButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex size-9 shrink-0 items-center justify-center rounded-full text-muted-foreground outline-none transition-colors duration-160 hover:bg-destructive/10 hover:text-destructive focus-visible:ring-2 focus-visible:ring-ring"
    >
      <DeleteIcon aria-hidden className="size-4" />
    </button>
  )
}

function PromptsPart() {
  const { control, register, setValue, formState } = useFormContext<ListingFormValues>()
  const { fields, append, remove } = useFieldArray({ control, name: "prompts" })
  const values = useWatch({ control, name: "prompts" })
  const errors = formState.errors.prompts
  const [fileError, setFileError] = React.useState<{ i: number; message: string } | null>(null)

  function onPdf(i: number, file: File | undefined) {
    if (!file) return
    if (file.type !== "application/pdf") return setFileError({ i, message: "Attach a PDF file." })
    if (file.size > MAX_PDF_MB * 1024 * 1024) return setFileError({ i, message: `PDFs up to ${MAX_PDF_MB} MB.` })
    setFileError(null)
    // Kept for this visit, uploaded on publish
    setValue(`prompts.${i}.fileUrl`, URL.createObjectURL(file), { shouldValidate: true })
    setValue(`prompts.${i}.fileName`, file.name)
  }

  function clearPdf(i: number) {
    setValue(`prompts.${i}.fileUrl`, "", { shouldValidate: true })
    setValue(`prompts.${i}.fileName`, "")
  }

  return (
    <Part
      n={1}
      icon={PromptsIcon}
      title="Prompts"
      why="Every prompt you used, word for word. Long, detailed ones can go in a PDF."
      count={fields.length}
      optional={false}
      addLabel="Add a prompt"
      onAdd={() => append({ label: `Prompt ${fields.length + 1}`, text: "", fileUrl: "", fileName: "" })}
    >
      <ul className="flex flex-col gap-3">
        {fields.map((f, i) => (
          <li key={f.id} className={cn(item, "flex-col items-stretch")}>
            <div className="flex items-end gap-2">
              <Field data-invalid={!!errors?.[i]?.label} className="flex-1">
                <FieldLabel htmlFor={`prompts.${i}.label`}>Name</FieldLabel>
                <Input
                  id={`prompts.${i}.label`}
                  className={field}
                  aria-invalid={!!errors?.[i]?.label}
                  {...register(`prompts.${i}.label`)}
                />
              </Field>
              {fields.length > 1 && <RemoveButton label={`Remove prompt ${i + 1}`} onClick={() => remove(i)} />}
            </div>
            <FieldError errors={[errors?.[i]?.label]} />
            <Field data-invalid={!!errors?.[i]?.text}>
              <FieldLabel htmlFor={`prompts.${i}.text`}>Prompt</FieldLabel>
              <Textarea
                id={`prompts.${i}.text`}
                rows={4}
                placeholder={
                  values?.[i]?.fileUrl
                    ? "Optional: a short version, or notes on the PDF"
                    : "Paste the full prompt, exactly as you ran it"
                }
                className={field}
                aria-invalid={!!errors?.[i]?.text}
                {...register(`prompts.${i}.text`)}
              />
              <FieldError errors={[errors?.[i]?.text]} />
            </Field>
            {values?.[i]?.fileUrl ? (
              <div className="flex items-center gap-3 rounded-xl bg-background/60 p-3 ring-1 ring-foreground/10">
                <DocumentIcon aria-hidden className="size-5 shrink-0 text-muted-foreground" />
                <span className="min-w-0 flex-1 truncate type-body font-semibold">{values[i]!.fileName || "Prompt.pdf"}</span>
                <RemoveButton label={`Remove the PDF from prompt ${i + 1}`} onClick={() => clearPdf(i)} />
              </div>
            ) : (
              <div>
                <input
                  id={`prompts.${i}.file`}
                  type="file"
                  accept="application/pdf"
                  className="peer sr-only"
                  onChange={(e) => {
                    onPdf(i, e.target.files?.[0])
                    e.target.value = ""
                  }}
                />
                <label
                  htmlFor={`prompts.${i}.file`}
                  className="glass-button inline-flex h-9 cursor-pointer items-center gap-2 rounded-full px-4 type-body font-semibold peer-focus-visible:ring-2 peer-focus-visible:ring-ring"
                >
                  <UploadIcon aria-hidden className="size-4" />
                  Attach a PDF
                </label>
              </div>
            )}
            {fileError?.i === i && <p className="type-meta text-destructive">{fileError.message}</p>}
          </li>
        ))}
      </ul>
      <FieldError errors={[errors?.root, errors as { message?: string } | undefined]} />
    </Part>
  )
}

const MAX_PDF_MB = 20
const MAX_ASSET_MB = 15

function ModelPart() {
  const { register, formState } = useFormContext<ListingFormValues>()
  const error = formState.errors.model

  return (
    <Part
      n={2}
      icon={RecipeSettingsIcon}
      title="AI model"
      why="The exact model, so buyers get the same look."
      count={0}
    >
      <Field data-invalid={!!error} className={cn(item, "flex-col items-stretch gap-2")}>
        <FieldLabel htmlFor="model">Model</FieldLabel>
        <Input
          id="model"
          className={field}
          placeholder="e.g. Seedance 2, Veo 3, Midjourney v7"
          aria-invalid={!!error}
          {...register("model")}
        />
        <FieldError errors={[error]} />
      </Field>
    </Part>
  )
}

function AssetsPart() {
  const { control, register, setValue, getValues, formState } = useFormContext<ListingFormValues>()
  const { fields, append, remove } = useFieldArray({ control, name: "assets" })
  const values = useWatch({ control, name: "assets" })
  const errors = formState.errors.assets
  const [fileError, setFileError] = React.useState<{ i: number; message: string } | null>(null)

  function onImage(i: number, file: File | undefined) {
    if (!file) return
    if (!file.type.startsWith("image/")) return setFileError({ i, message: "Add an image file." })
    if (file.size > MAX_ASSET_MB * 1024 * 1024) return setFileError({ i, message: `Images up to ${MAX_ASSET_MB} MB.` })
    setFileError(null)
    // Full size, so buyers can reuse it; kept for this visit and uploaded on publish
    setValue(`assets.${i}.url`, URL.createObjectURL(file))
    if (!getValues(`assets.${i}.name`).trim()) {
      setValue(`assets.${i}.name`, file.name.replace(/\.[^.]+$/, "").slice(0, 60), { shouldValidate: true })
    }
  }

  return (
    <Part
      n={3}
      icon={DocumentIcon}
      title="Reference assets"
      why="Reference images, style refs or start frames you used."
      count={fields.length}
      addLabel="Add a reference asset"
      onAdd={() => append({ name: "", note: "", url: "" })}
    >
      {fields.length > 0 && (
        <ul className="flex flex-col gap-3">
          {fields.map((f, i) => {
            const img = values?.[i]?.url
            const inputId = `assets.${i}.image`
            return (
              <li key={f.id} className={cn(item, "flex-wrap sm:flex-nowrap")}>
                <div className="shrink-0">
                  <input
                    id={inputId}
                    type="file"
                    accept="image/*"
                    className="peer sr-only"
                    onChange={(e) => {
                      onImage(i, e.target.files?.[0])
                      e.target.value = ""
                    }}
                  />
                  <label
                    htmlFor={inputId}
                    className="flex size-20 cursor-pointer items-center justify-center overflow-hidden rounded-xl bg-background/60 text-muted-foreground ring-1 ring-foreground/10 peer-focus-visible:ring-2 peer-focus-visible:ring-ring"
                  >
                    {img ? (
                      // eslint-disable-next-line @next/next/no-img-element -- local preview
                      <img src={img} alt={`Reference ${i + 1}`} className="size-full object-cover" />
                    ) : (
                      <UploadIcon className="size-5" aria-hidden />
                    )}
                    <span className="sr-only">{img ? "Replace image" : "Add image"}</span>
                  </label>
                </div>
                <div className="grid min-w-0 flex-1 grid-cols-1 gap-3">
                  <Field data-invalid={!!errors?.[i]?.name}>
                    <FieldLabel htmlFor={`assets.${i}.name`}>Name</FieldLabel>
                    <Input
                      id={`assets.${i}.name`}
                      className={field}
                      placeholder="Subject reference sheet"
                      aria-invalid={!!errors?.[i]?.name}
                      {...register(`assets.${i}.name`)}
                    />
                    <FieldError errors={[errors?.[i]?.name]} />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor={`assets.${i}.note`}>Note (optional)</FieldLabel>
                    <Input
                      id={`assets.${i}.note`}
                      className={field}
                      placeholder="3 angles, used as the subject reference"
                      {...register(`assets.${i}.note`)}
                    />
                  </Field>
                  {fileError?.i === i && <p className="type-meta text-destructive">{fileError.message}</p>}
                </div>
                <div className="sm:pt-7">
                  <RemoveButton label={`Remove reference asset ${i + 1}`} onClick={() => remove(i)} />
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </Part>
  )
}

type PairName = "editSteps"

function PairPart({
  n,
  icon,
  title,
  why,
  name,
  first,
  second,
}: {
  n: number
  icon: IconType
  title: string
  why: string
  name: PairName
  first: { key: string; label: string; placeholder: string }
  second: { key: string; label: string; placeholder: string }
}) {
  const { control, register, formState } = useFormContext<ListingFormValues>()
  const { fields, append, remove } = useFieldArray({ control, name })
  const errors = formState.errors[name] as Record<number, Record<string, { message?: string } | undefined>> | undefined

  return (
    <Part
      n={n}
      icon={icon}
      title={title}
      why={why}
      count={fields.length}
      addLabel={`Add to ${title.toLowerCase()}`}
      onAdd={() => append({ [first.key]: "", [second.key]: "" } as never)}
    >
      {fields.length > 0 && (
        <ul className="flex flex-col gap-3">
          {fields.map((f, i) => {
            const id1 = `${name}.${i}.${first.key}`
            const id2 = `${name}.${i}.${second.key}`
            const e1 = errors?.[i]?.[first.key]
            const e2 = errors?.[i]?.[second.key]
            return (
              <li key={f.id} className={item}>
                <div className="grid min-w-0 flex-1 grid-cols-1 gap-3 sm:grid-cols-2">
                  <Field data-invalid={!!e1}>
                    <FieldLabel htmlFor={id1}>{first.label}</FieldLabel>
                    <Input
                      id={id1}
                      className={field}
                      placeholder={first.placeholder}
                      aria-invalid={!!e1}
                      {...register(id1 as `editSteps.${number}.tool`)}
                    />
                    <FieldError errors={[e1]} />
                  </Field>
                  <Field data-invalid={!!e2}>
                    <FieldLabel htmlFor={id2}>{second.label}</FieldLabel>
                    <Input
                      id={id2}
                      className={field}
                      placeholder={second.placeholder}
                      aria-invalid={!!e2}
                      {...register(id2 as `editSteps.${number}.note`)}
                    />
                    <FieldError errors={[e2]} />
                  </Field>
                </div>
                <div className="pt-7">
                  <RemoveButton label={`Remove from ${title.toLowerCase()}`} onClick={() => remove(i)} />
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </Part>
  )
}

function FailuresPart() {
  const { control, register, setValue, formState } = useFormContext<ListingFormValues>()
  const { fields, append, remove } = useFieldArray({ control, name: "failures" })
  const values = useWatch({ control, name: "failures" })
  const errors = formState.errors.failures

  async function onImage(i: number, file: File | undefined) {
    if (!file || !file.type.startsWith("image/")) return
    // Failed attempts are shown as-is: many AI tools don't embed an AI tag, and the
    // post's cover (or proof link) already shows the work is AI-made
    const url = await imageToDataUrl(file, 480, 0.75)
    setValue(`failures.${i}.imageUrl`, url)
  }

  return (
    <Part
      n={5}
      icon={ImageMissingIcon}
      title="Failed takes"
      why="What went wrong and how you fixed it. Buyers love these."
      count={fields.length}
      last
      addLabel="Add a failed take"
      onAdd={() => append({ imageUrl: "", note: "" })}
    >
      {fields.length > 0 && (
        <ul className="flex flex-col gap-3">
          {fields.map((f, i) => {
            const img = values?.[i]?.imageUrl
            const inputId = `failures.${i}.image`
            return (
              <li key={f.id} className={item}>
                <div className="shrink-0">
                  <input
                    id={inputId}
                    type="file"
                    accept="image/*"
                    className="peer sr-only"
                    onChange={(e) => onImage(i, e.target.files?.[0])}
                  />
                  <label
                    htmlFor={inputId}
                    className="flex size-20 cursor-pointer items-center justify-center overflow-hidden rounded-xl bg-background/60 text-muted-foreground ring-1 ring-foreground/10 peer-focus-visible:ring-2 peer-focus-visible:ring-ring"
                  >
                    {img ? (
                      // eslint-disable-next-line @next/next/no-img-element -- local data URL preview
                      <img src={img} alt={`Failed take ${i + 1}`} className="size-full object-cover" />
                    ) : (
                      <UploadIcon className="size-5" aria-hidden />
                    )}
                    <span className="sr-only">{img ? "Replace image" : "Add image"}</span>
                  </label>
                </div>
                <Field data-invalid={!!errors?.[i]?.note} className="min-w-0 flex-1">
                  <FieldLabel htmlFor={`failures.${i}.note`}>Why it failed</FieldLabel>
                  <Textarea
                    id={`failures.${i}.note`}
                    rows={2}
                    className={field}
                    placeholder="Jacket turned red between shots: no subject reference attached."
                    aria-invalid={!!errors?.[i]?.note}
                    {...register(`failures.${i}.note`)}
                  />
                  <FieldError errors={[errors?.[i]?.note]} />
                </Field>
                <div className="pt-7">
                  <RemoveButton label={`Remove failed take ${i + 1}`} onClick={() => remove(i)} />
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </Part>
  )
}
