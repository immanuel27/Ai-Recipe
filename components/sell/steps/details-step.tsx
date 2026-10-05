"use client"

import { Controller, useFormContext } from "react-hook-form"

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
import { TOOLS } from "@/lib/mock/tools"

/** Final step: cover + live preview on the left, post details on the right. */
export function DetailsStep({ footer }: { footer: React.ReactNode }) {
  const { register, control, formState } = useFormContext<ListingFormValues>()
  const { errors } = formState

  return (
    <div className="grid grid-cols-1 gap-10 md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] md:gap-12">
      <div className="md:sticky md:top-24 md:self-start">
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
                      {TOOLS.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
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
  )
}
