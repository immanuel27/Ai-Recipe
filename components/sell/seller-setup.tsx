"use client"

import Link from "next/link"
import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { StepHeader } from "@/components/sell/step-header"
import { useAppStore } from "@/components/providers/app-store"
import { CountryFlag } from "@/components/shared/country-flag"
import { COUNTRIES, PAYOUT_METHODS } from "@/lib/countries"
import { PAYMENTS_ENABLED } from "@/lib/flags"

const schema = z.object({
  payoutMethod: z.string().min(1, "Choose how you'd like to be paid."),
  country: z.string().min(1, "Choose your country."),
  proofOfWorkUrl: z.url("Enter a full link, starting with https://"),
})
type Values = z.infer<typeof schema>

const STEPS: { title: string; description: string; fields: (keyof Values)[] }[] = [
  {
    title: "How you'll get paid",
    description: "Pick a payout method. You can connect the account later.",
    fields: ["payoutMethod"],
  },
  {
    title: "Where you're based",
    description: "Used for tax forms and payout currency.",
    fields: ["country"],
  },
  {
    title: "Show us your work",
    description: "A link to a portfolio, channel or post with AI work you've made.",
    fields: ["proofOfWorkUrl"],
  },
]

// While payments are off there's nothing to pay out, so only the proof-of-work step remains
const ACTIVE_STEPS = PAYMENTS_ENABLED ? STEPS : STEPS.filter((s) => s.fields.includes("proofOfWorkUrl"))

export function SellerSetup() {
  const { becomeSeller } = useAppStore()
  const [step, setStep] = React.useState(0)
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: PAYMENTS_ENABLED
      ? { payoutMethod: "", country: "", proofOfWorkUrl: "" }
      : { payoutMethod: "none", country: "none", proofOfWorkUrl: "" },
  })
  const current = ACTIVE_STEPS[step]!
  const last = step === ACTIVE_STEPS.length - 1

  async function next() {
    const ok = await form.trigger(current.fields)
    if (!ok) return
    if (!last) return setStep(step + 1)
    form.handleSubmit((values) => {
      becomeSeller(values)
      toast.success(PAYMENTS_ENABLED ? "You're set up to sell" : "You're set up to post")
    })()
  }

  return (
    <Card className="mx-auto w-full max-w-md">
      <StepHeader
        step={step + 1}
        total={ACTIVE_STEPS.length}
        title={current.title}
        description={current.description}
        onBack={step > 0 ? () => setStep(step - 1) : undefined}
      />
      <form
        noValidate
        className="contents"
        onSubmit={(e) => {
          e.preventDefault()
          next()
        }}
      >
        <CardContent>
          {current.fields.includes("payoutMethod") && (
            <Controller
              control={form.control}
              name="payoutMethod"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="payoutMethod">Payout method</FieldLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger
                      id="payoutMethod"
                      className="h-11! w-full"
                      aria-invalid={fieldState.invalid}
                    >
                      <SelectValue placeholder="Choose a method" />
                    </SelectTrigger>
                    <SelectContent>
                      {PAYOUT_METHODS.map((m) => (
                        <SelectItem key={m.value} value={m.value}>
                          {m.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldDescription>Placeholder for now. No account is connected.</FieldDescription>
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
          )}
          {current.fields.includes("country") && (
            <Controller
              control={form.control}
              name="country"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="country">Country</FieldLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger
                      id="country"
                      className="h-11! w-full"
                      aria-invalid={fieldState.invalid}
                    >
                      <SelectValue placeholder="Choose a country" />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map((c) => (
                        <SelectItem key={c} value={c} textValue={c} className="gap-2">
                          <CountryFlag country={c} />
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
          )}
          {current.fields.includes("proofOfWorkUrl") && (
            <Field data-invalid={!!form.formState.errors.proofOfWorkUrl}>
              <FieldLabel htmlFor="proofOfWorkUrl">Proof-of-work link</FieldLabel>
              <Input
                id="proofOfWorkUrl"
                type="url"
                inputMode="url"
                placeholder="https://"
                className="h-11"
                aria-invalid={!!form.formState.errors.proofOfWorkUrl}
                {...form.register("proofOfWorkUrl")}
              />
              <FieldError errors={[form.formState.errors.proofOfWorkUrl]} />
            </Field>
          )}
        </CardContent>
        <CardFooter className="flex-col gap-2">
          <Button type="submit" size="pill" className="w-full">
            {last ? "Finish setup" : "Continue"}
          </Button>
          {/* Selling is optional: set it up later from New recipe */}
          <Button asChild variant="ghost" size="pill" className="w-full text-muted-foreground">
            <Link href="/">Skip for now</Link>
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
