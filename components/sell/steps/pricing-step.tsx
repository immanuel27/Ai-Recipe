"use client"

import { Controller, useFormContext, useWatch } from "react-hook-form"

import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { InsetPanel } from "@/components/shared/inset-panel"
import { useAppStore } from "@/components/providers/app-store"
import type { ListingFormValues } from "@/components/sell/listing-schema"
import { PLATFORM_FEE, formatPrice, sellerEarnings } from "@/lib/format"

/** "Sell as" + price, with live earnings. Lives on the Details step. */
export function PricingFields() {
  const { control, register, setValue, formState } = useFormContext<ListingFormValues>()
  const [mode, price, bundleSlugs] = useWatch({
    control,
    name: ["pricingMode", "price", "bundleSlugs"],
  })
  const { createdListings } = useAppStore()
  const cents = Number.isFinite(price) ? Math.round(price * 100) : 0
  const { errors } = formState

  return (
    <>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Controller
          control={control}
          name="pricingMode"
          render={({ field }) => (
            <Field>
              <FieldLabel htmlFor="pricingMode">Sell as</FieldLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="pricingMode" className="h-11! w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">Single recipe</SelectItem>
                  <SelectItem value="bundle">Bundle</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          )}
        />
        <Field data-invalid={!!errors.price}>
          <FieldLabel htmlFor="price">{mode === "bundle" ? "Bundle price" : "Price"}</FieldLabel>
          <div className="relative">
            <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground">
              $
            </span>
            <Input
              id="price"
              type="number"
              inputMode="decimal"
              min={0}
              max={500}
              step={0.5}
              className="h-11 pl-7 font-semibold tabular-nums"
              aria-invalid={!!errors.price}
              aria-describedby="price-earnings"
              {...register("price", { valueAsNumber: true })}
            />
          </div>
          <FieldError errors={[errors.price]} />
        </Field>
      </div>
      <FieldDescription id="price-earnings" aria-live="polite" className="-mt-2">
        {cents === 0
          ? "Free: buyers unlock it instantly."
          : `You earn ${formatPrice(sellerEarnings(cents), { free: false })} after the ${PLATFORM_FEE * 100}% fee`}
      </FieldDescription>

      {mode === "bundle" && (
        <Field data-invalid={!!errors.bundleSlugs}>
          <FieldLabel>Include in bundle</FieldLabel>
          {createdListings.length === 0 ? (
            <InsetPanel className="text-sm text-muted-foreground">
              Bundles combine this recipe with ones you&apos;ve already published. Publish one
              recipe first, then come back to bundle.
            </InsetPanel>
          ) : (
            <InsetPanel className="flex flex-col divide-y divide-border p-0">
              {createdListings.map((l) => {
                const id = `bundle-${l.slug}`
                return (
                  <div key={l.id} className="flex items-center justify-between gap-3 px-4 py-3">
                    <label htmlFor={id} className="min-w-0 flex-1 truncate text-sm font-medium">
                      {l.title}
                    </label>
                    <Switch
                      id={id}
                      checked={bundleSlugs.includes(l.slug)}
                      onCheckedChange={(on) =>
                        setValue(
                          "bundleSlugs",
                          on ? [...bundleSlugs, l.slug] : bundleSlugs.filter((s) => s !== l.slug),
                          { shouldValidate: true }
                        )
                      }
                    />
                  </div>
                )
              })}
            </InsetPanel>
          )}
          <FieldError errors={[errors.bundleSlugs]} />
        </Field>
      )}
    </>
  )
}
