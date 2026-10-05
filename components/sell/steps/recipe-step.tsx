"use client"

import * as React from "react"
import { ImagePlusIcon, PlusIcon, Trash2Icon } from "lucide-react"
import { useFieldArray, useFormContext, useWatch } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { InsetPanel } from "@/components/shared/inset-panel"
import type { ListingFormValues } from "@/components/sell/listing-schema"
import { imageToDataUrl } from "@/lib/media"

export function RecipeStep() {
  return (
    <div className="flex flex-col gap-8">
      <PromptsSection />
      <PairSection
        name="settings"
        title="Settings"
        hint="Seeds, aspect ratio, guidance, model flags…"
        addLabel="Add setting"
        first={{ key: "key", label: "Setting", placeholder: "Seed" }}
        second={{ key: "value", label: "Value", placeholder: "449120" }}
      />
      <PairSection
        name="assets"
        title="Reference assets"
        hint="Reference images, style refs, masks, LUTs."
        addLabel="Add asset"
        first={{ key: "name", label: "Asset", placeholder: "Subject reference sheet" }}
        second={{ key: "note", label: "Note (optional)", placeholder: "3 angles, used as subject ref" }}
      />
      <PairSection
        name="editSteps"
        title="Edit stack"
        hint="Everything that happened after generation, in order."
        addLabel="Add edit step"
        first={{ key: "tool", label: "Tool", placeholder: "DaVinci Resolve" }}
        second={{ key: "note", label: "What you did", placeholder: "Speed ramp into shot 3" }}
        numbered
      />
      <FailuresSection />
    </div>
  )
}

function SectionHeader({ title, hint }: { title: string; hint: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <h3 className="label-caps">{title}</h3>
      <p className="text-sm text-muted-foreground">{hint}</p>
    </div>
  )
}

function RemoveButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      onClick={onClick}
      aria-label={label}
      className="text-muted-foreground hover:text-destructive"
    >
      <Trash2Icon />
    </Button>
  )
}

function AddButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <Button type="button" variant="outline" size="pill-sm" className="self-start" onClick={onClick}>
      <PlusIcon aria-hidden />
      {label}
    </Button>
  )
}

function PromptsSection() {
  const { control, register, formState } = useFormContext<ListingFormValues>()
  const { fields, append, remove } = useFieldArray({ control, name: "prompts" })
  const errors = formState.errors.prompts

  return (
    <section className="flex flex-col gap-3">
      <SectionHeader title="Prompts" hint="Every prompt you used, word for word." />
      {fields.map((f, i) => (
        <InsetPanel key={f.id} className="flex flex-col gap-3">
          <div className="flex items-end gap-2">
            <Field data-invalid={!!errors?.[i]?.label} className="flex-1">
              <FieldLabel htmlFor={`prompts.${i}.label`}>Prompt name</FieldLabel>
              <Input
                id={`prompts.${i}.label`}
                className="bg-card"
                aria-invalid={!!errors?.[i]?.label}
                {...register(`prompts.${i}.label`)}
              />
            </Field>
            {fields.length > 1 && (
              <RemoveButton label={`Remove prompt ${i + 1}`} onClick={() => remove(i)} />
            )}
          </div>
          <FieldError errors={[errors?.[i]?.label]} />
          <Field data-invalid={!!errors?.[i]?.text}>
            <FieldLabel htmlFor={`prompts.${i}.text`}>Prompt</FieldLabel>
            <Textarea
              id={`prompts.${i}.text`}
              rows={4}
              className="bg-card font-mono text-sm"
              aria-invalid={!!errors?.[i]?.text}
              {...register(`prompts.${i}.text`)}
            />
            <FieldError errors={[errors?.[i]?.text]} />
          </Field>
        </InsetPanel>
      ))}
      <FieldError errors={[errors?.root, errors as { message?: string } | undefined]} />
      <AddButton
        label="Add prompt"
        onClick={() => append({ label: `Prompt ${fields.length + 1}`, text: "" })}
      />
    </section>
  )
}

type PairName = "settings" | "assets" | "editSteps"

function PairSection({
  name,
  title,
  hint,
  addLabel,
  first,
  second,
  numbered,
}: {
  name: PairName
  title: string
  hint: string
  addLabel: string
  first: { key: string; label: string; placeholder: string }
  second: { key: string; label: string; placeholder: string }
  numbered?: boolean
}) {
  const { control, register, formState } = useFormContext<ListingFormValues>()
  const { fields, append, remove } = useFieldArray({ control, name })
  const errors = formState.errors[name] as
    | Record<number, Record<string, { message?: string } | undefined>>
    | undefined

  return (
    <section className="flex flex-col gap-3">
      <SectionHeader title={title} hint={hint} />
      {fields.map((f, i) => {
        const id1 = `${name}.${i}.${first.key}`
        const id2 = `${name}.${i}.${second.key}`
        const e1 = errors?.[i]?.[first.key]
        const e2 = errors?.[i]?.[second.key]
        return (
          <InsetPanel key={f.id} className="flex items-start gap-3">
            {numbered && (
              <span className="mt-7 flex size-6 shrink-0 items-center justify-center rounded-full bg-card text-xs font-semibold ring-1 ring-foreground/10">
                {i + 1}
              </span>
            )}
            <div className="grid min-w-0 flex-1 grid-cols-1 gap-3 sm:grid-cols-2">
              <Field data-invalid={!!e1}>
                <FieldLabel htmlFor={id1}>{first.label}</FieldLabel>
                <Input
                  id={id1}
                  className="bg-card"
                  placeholder={first.placeholder}
                  aria-invalid={!!e1}
                  {...register(id1 as `settings.${number}.key`)}
                />
                <FieldError errors={[e1]} />
              </Field>
              <Field data-invalid={!!e2}>
                <FieldLabel htmlFor={id2}>{second.label}</FieldLabel>
                <Input
                  id={id2}
                  className="bg-card"
                  placeholder={second.placeholder}
                  aria-invalid={!!e2}
                  {...register(id2 as `settings.${number}.value`)}
                />
                <FieldError errors={[e2]} />
              </Field>
            </div>
            <div className="mt-6">
              <RemoveButton label={`Remove ${title.toLowerCase()} ${i + 1}`} onClick={() => remove(i)} />
            </div>
          </InsetPanel>
        )
      })}
      <AddButton
        label={addLabel}
        onClick={() =>
          append({ [first.key]: "", [second.key]: "" } as never)
        }
      />
    </section>
  )
}

function FailuresSection() {
  const { control, register, setValue, formState } = useFormContext<ListingFormValues>()
  const { fields, append, remove } = useFieldArray({ control, name: "failures" })
  const values = useWatch({ control, name: "failures" })
  const errors = formState.errors.failures

  async function onImage(i: number, file: File | undefined) {
    if (!file || !file.type.startsWith("image/")) return
    const url = await imageToDataUrl(file, 480, 0.75)
    setValue(`failures.${i}.imageUrl`, url)
  }

  return (
    <section className="flex flex-col gap-3">
      <SectionHeader
        title="Failed attempts"
        hint="Buyers love these. Show what went wrong and how you fixed it."
      />
      {fields.map((f, i) => {
        const img = values?.[i]?.imageUrl
        const inputId = `failures.${i}.image`
        return (
          <InsetPanel key={f.id} className="flex items-start gap-3">
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
                className="flex size-20 cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-card text-muted-foreground ring-1 ring-foreground/10 peer-focus-visible:ring-3 peer-focus-visible:ring-ring/50"
              >
                {img ? (
                  // eslint-disable-next-line @next/next/no-img-element -- local data URL preview
                  <img src={img} alt={`Failed attempt ${i + 1}`} className="size-full object-cover" />
                ) : (
                  <ImagePlusIcon className="size-5" aria-hidden />
                )}
                <span className="sr-only">{img ? "Replace image" : "Add image"}</span>
              </label>
            </div>
            <Field data-invalid={!!errors?.[i]?.note} className="min-w-0 flex-1">
              <FieldLabel htmlFor={`failures.${i}.note`}>Why it failed</FieldLabel>
              <Textarea
                id={`failures.${i}.note`}
                rows={2}
                className="bg-card"
                placeholder="Jacket turned red between shots: no subject reference attached."
                aria-invalid={!!errors?.[i]?.note}
                {...register(`failures.${i}.note`)}
              />
              <FieldError errors={[errors?.[i]?.note]} />
            </Field>
            <div className="mt-6">
              <RemoveButton label={`Remove failed attempt ${i + 1}`} onClick={() => remove(i)} />
            </div>
          </InsetPanel>
        )
      })}
      <AddButton label="Add failed attempt" onClick={() => append({ imageUrl: "", note: "" })} />
    </section>
  )
}
