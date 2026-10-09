"use client"

import { Controller, useFormContext, useWatch } from "react-hook-form"

import { Checkbox } from "@/components/ui/checkbox"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import type { ListingFormValues } from "@/components/sell/listing-schema"
import { TagInput } from "@/components/sell/tag-input"
import { CoverField } from "@/components/sell/steps/cover-field"
import { PricingFields } from "@/components/sell/steps/pricing-step"
import { ToolLogo } from "@/components/shared/tool-logo"
import { TOOLS, getTool, toolKind } from "@/lib/mock/tools"
import type { ListingKind } from "@/lib/types"
import { cn } from "@/lib/utils"

const KINDS: { value: ListingKind; label: string }[] = [
  { value: "media", label: "AI video or image" },
  { value: "website", label: "Website" },
]

/** Final step: cover + live preview on the left, post details on the right. */
export function DetailsStep({ footer }: { footer: React.ReactNode }) {
  const { register, control, formState, setValue, getValues } = useFormContext<ListingFormValues>()
  const { errors } = formState
  const [kind, tool] = useWatch({ control, name: ["kind", "tool"] })
  const isWebsite = kind === "website"
  const proofHint = getTool(tool)?.proofHint

  function chooseKind(next: ListingKind) {
    if (next === kind) return
    setValue("kind", next, { shouldDirty: true })
    // The tool list changes with the kind of post
    if (getValues("tool") && toolKind(getValues("tool")) !== next) setValue("tool", "" as ListingFormValues["tool"])
  }

  return (
    <div className="flex flex-col gap-8">
      <div role="radiogroup" aria-label="What are you posting?" className="flex flex-wrap justify-center gap-2">
        {KINDS.map((k) => (
          <button
            key={k.value}
            type="button"
            role="radio"
            aria-checked={kind === k.value}
            onClick={() => chooseKind(k.value)}
            className={cn(
              "h-10 rounded-full px-5 text-sm font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
              kind === k.value
                ? "bg-primary text-primary-foreground"
                : "bg-card text-foreground ring-1 ring-foreground/10 hover:bg-muted"
            )}
          >
            {k.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-10 md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] md:gap-12">
        <div className="md:sticky md:top-6 md:self-start">
          <CoverField />
        </div>

        <div className="flex flex-col gap-8 md:pt-11">
          <FieldGroup>
            <Field data-invalid={!!errors.title}>
              <FieldLabel htmlFor="title">Title</FieldLabel>
              <Input
                id="title"
                className="h-11"
                placeholder="Add a title"
                aria-invalid={!!errors.title}
                {...register("title")}
              />
              <FieldError errors={[errors.title]} />
            </Field>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Controller
                control={control}
                name="tool"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="tool">Tool</FieldLabel>
                    <Select value={field.value || undefined} onValueChange={field.onChange}>
                      <SelectTrigger
                        id="tool"
                        className="h-11! w-full"
                        aria-invalid={fieldState.invalid}
                      >
                        <SelectValue placeholder="Choose the tool" />
                      </SelectTrigger>
                      <SelectContent>
                        {TOOLS.filter((t) => t.kind === kind).map((t) => (
                          <SelectItem key={t.id} value={t.id} textValue={t.name} className="gap-2">
                            <ToolLogo tool={t.id} className="size-4" />
                            {t.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />
              <Field data-invalid={!!errors.toolVersion}>
                <FieldLabel htmlFor="toolVersion">Version</FieldLabel>
                <Input
                  id="toolVersion"
                  className="h-11"
                  placeholder="3.1"
                  aria-invalid={!!errors.toolVersion}
                  {...register("toolVersion")}
                />
                <FieldError errors={[errors.toolVersion]} />
              </Field>
            </div>

            <Field data-invalid={!!errors.proofUrl}>
              <FieldLabel htmlFor="proofUrl">
                Proof link{!isWebsite && <span className="font-normal text-muted-foreground"> (optional)</span>}
              </FieldLabel>
              <Input
                id="proofUrl"
                type="url"
                inputMode="url"
                className="h-11"
                placeholder="https://"
                aria-invalid={!!errors.proofUrl}
                aria-describedby="proofUrl-hint"
                {...register("proofUrl")}
              />
              <FieldDescription id="proofUrl-hint">
                {proofHint ? `${proofHint} ` : "The share link of your generation, chat or project. "}
                Kept private: only our team checks it, and buyers see it after they buy. Checked posts
                get a Verified badge.
              </FieldDescription>
              <FieldError errors={[errors.proofUrl]} />
            </Field>

            {isWebsite && (
              <Field data-invalid={!!errors.liveUrl}>
                <FieldLabel htmlFor="liveUrl">
                  Live site <span className="font-normal text-muted-foreground">(optional)</span>
                </FieldLabel>
                <Input
                  id="liveUrl"
                  type="url"
                  inputMode="url"
                  className="h-11"
                  placeholder="https://"
                  aria-invalid={!!errors.liveUrl}
                  {...register("liveUrl")}
                />
                <FieldDescription>Anyone can visit it from your post.</FieldDescription>
                <FieldError errors={[errors.liveUrl]} />
              </Field>
            )}

            <Controller
              control={control}
              name="tags"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="tags">Tags</FieldLabel>
                  <TagInput
                    id="tags"
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Add up to 10 tags"
                    invalid={fieldState.invalid}
                    describedBy="tags-hint"
                  />
                  <FieldDescription id="tags-hint">Press Enter or comma after each tag.</FieldDescription>
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

            <Field data-invalid={!!errors.description}>
              <FieldLabel htmlFor="description">Description</FieldLabel>
              <Textarea
                id="description"
                rows={3}
                placeholder="What makes your recipe worth buying?"
                aria-invalid={!!errors.description}
                {...register("description")}
              />
              <FieldError errors={[errors.description]} />
            </Field>

            <PricingFields />

            <Controller
              control={control}
              name="adult"
              render={({ field }) => (
                <Field orientation="horizontal">
                  <Checkbox
                    id="adult"
                    checked={field.value}
                    onCheckedChange={(v) => field.onChange(v === true)}
                    className="size-5"
                  />
                  <FieldContent>
                    <FieldLabel htmlFor="adult" className="font-semibold">
                      Contains adult content
                    </FieldLabel>
                    <FieldDescription>Shown with an 18+ label.</FieldDescription>
                  </FieldContent>
                </Field>
              )}
            />
          </FieldGroup>

          {footer}
        </div>
      </div>
    </div>
  )
}
