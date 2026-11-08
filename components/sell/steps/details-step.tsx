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
import { Textarea } from "@/components/ui/textarea"
import { needsProofLink, type ListingFormValues } from "@/components/sell/listing-schema"
import { TagInput } from "@/components/sell/tag-input"
import { CoverField } from "@/components/sell/steps/cover-field"
import { ProofShotsField } from "@/components/sell/steps/proof-shots-field"
import { PricingFields } from "@/components/sell/steps/pricing-step"
import { ToolLogo } from "@/components/shared/tool-logo"
import { getTool, toolsForPostType } from "@/lib/mock/tools"
import { cn } from "@/lib/utils"
import { PAYMENTS_ENABLED } from "@/lib/flags"

/** Step 2: cover (or the site's link and preview) on the left, post details on the right. */
export function DetailsStep({ footer }: { footer: React.ReactNode }) {
  const { register, control, formState } = useFormContext<ListingFormValues>()
  const { errors } = formState
  const [postType, tools, media] = useWatch({ control, name: ["postType", "tools", "media"] })
  const options = toolsForPostType(postType)
  const proofHint = tools.length === 1 ? getTool(tools[0]!)?.proofHint : undefined
  // Optional, but it's how a post gets Verified (worth suggesting for untagged uploads)
  const untagged = needsProofLink({ postType, media })

  return (
    <div className="flex flex-col gap-8">
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

            <Controller
              control={control}
              name="tools"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel id="tools-label">Tools used</FieldLabel>
                  <div role="group" aria-labelledby="tools-label" aria-describedby="tools-hint" className="flex flex-wrap gap-2">
                    {options.map((t) => {
                      const on = field.value.includes(t.id)
                      return (
                        <button
                          key={t.id}
                          type="button"
                          aria-pressed={on}
                          onClick={() =>
                            field.onChange(on ? field.value.filter((id) => id !== t.id) : [...field.value, t.id])
                          }
                          className={cn(
                            "inline-flex h-10 items-center gap-2 rounded-full pr-4 pl-2 text-sm font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
                            on
                              ? "bg-primary text-primary-foreground"
                              : "bg-card text-foreground ring-1 ring-foreground/10 hover:bg-muted"
                          )}
                        >
                          <ToolLogo tool={t.id} className="size-6" />
                          {t.name}
                        </button>
                      )
                    })}
                  </div>
                  <FieldDescription id="tools-hint">Pick every tool you used. The first is shown as the main one.</FieldDescription>
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

            <Field data-invalid={!!errors.proofUrl || !!errors.proofShots}>
              <FieldLabel htmlFor="proofUrl">
                Proof <span className="font-normal text-muted-foreground">(optional)</span>
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
              <FieldError errors={[errors.proofUrl]} />
              <ProofShotsField describedBy="proofUrl-hint" />
              <FieldDescription id="proofUrl-hint">
                Add a share link or up to 3 screenshots (your chat, terminal or project) to get the{" "}
                <strong>Verified</strong> badge.{" "}
                {untagged && "Your file has no AI tag, so this is the best way to show it's AI-made. "}
                {proofHint && `${proofHint} `}
                <strong>Private:</strong> only the Ai Recipy team sees it, never the people who unlock your recipe.
              </FieldDescription>
            </Field>

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
                placeholder="What makes your recipe worth trying?"
                aria-invalid={!!errors.description}
                {...register("description")}
              />
              <FieldError errors={[errors.description]} />
            </Field>

            {/* Payments are off for now: every recipe is free */}
          {PAYMENTS_ENABLED && <PricingFields />}

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
