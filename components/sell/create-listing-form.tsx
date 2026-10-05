"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2Icon } from "lucide-react"
import { FormProvider, useForm } from "react-hook-form"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  STEP_FIELDS,
  listingDefaults,
  listingSchema,
  withDefaults,
  type ListingFormValues,
} from "@/components/sell/listing-schema"
import { DetailsStep } from "@/components/sell/steps/details-step"
import { RecipeStep } from "@/components/sell/steps/recipe-step"
import { useAppStore, userCreatorId } from "@/components/providers/app-store"
import { slugify } from "@/lib/format"
import type { Listing } from "@/lib/types"
import { cn } from "@/lib/utils"

const STEPS = [
  { id: "details", title: "Details", description: "Add your cover and post details." },
  {
    id: "recipe",
    title: "Recipe",
    description: "Everything buyers pay for: prompts, settings, assets, edits and failures. Then publish.",
  },
] as const

/**
 * Two-step posting flow, like posting on TikTok or Reels:
 * 1. Details (cover, info, price)  2. Recipe contents → Publish
 */
export function CreateListingForm() {
  const router = useRouter()
  const { user, addListing, draft, saveDraft, clearDraft } = useAppStore()
  const [step, setStep] = React.useState(() => draft?.step ?? 0)
  const [publishing, setPublishing] = React.useState(false)
  const topRef = React.useRef<HTMLDivElement>(null)
  const methods = useForm<ListingFormValues>({
    resolver: zodResolver(listingSchema),
    defaultValues: draft ? withDefaults(draft.values) : listingDefaults,
    mode: "onTouched",
  })

  // Announce a restored draft once; drop uploaded videos that didn't survive a reload
  const restoredRef = React.useRef(false)
  React.useEffect(() => {
    if (!draft || restoredRef.current) return
    restoredRef.current = true
    toast("Draft restored", {
      action: {
        label: "Discard",
        onClick: () => {
          clearDraft()
          methods.reset(listingDefaults)
          setStep(0)
        },
      },
    })
    const url = draft.values.media.url
    if (url.startsWith("blob:")) {
      fetch(url).catch(() => {
        methods.setValue("media", listingDefaults.media)
        toast("Re-upload your cover video: uploads aren't kept between visits yet.")
      })
    }
  }, [draft, clearDraft, methods])

  function goTo(i: number) {
    setStep(i)
    topRef.current?.scrollIntoView({ block: "start" })
  }

  async function next() {
    const ok = await methods.trigger([...STEP_FIELDS[step]] as (keyof ListingFormValues)[], {
      shouldFocus: true,
    })
    if (ok) goTo(step + 1)
  }

  function onSaveDraft() {
    saveDraft(methods.getValues(), step)
    toast.success("Draft saved")
  }

  // e.g. a restored draft whose cover video didn't survive a reload
  function onInvalid(errors: Partial<Record<keyof ListingFormValues, unknown>>) {
    const earlier = STEP_FIELDS.findIndex((fields, i) => i < step && fields.some((f) => f in errors))
    if (earlier !== -1) {
      goTo(earlier)
      toast.error(`Check the ${STEPS[earlier]!.title} step before publishing.`)
    }
  }

  async function publish(values: ListingFormValues) {
    if (!user) return
    setPublishing(true)
    await new Promise((r) => setTimeout(r, 500))
    const slug = `${slugify(values.title)}-${Math.random().toString(36).slice(2, 6)}`
    const listing: Listing = {
      id: crypto.randomUUID(),
      slug,
      title: values.title,
      description: values.description,
      creatorId: userCreatorId(user.username),
      type: values.media.type,
      mediaUrl: values.media.url,
      posterUrl: values.media.posterUrl,
      images: values.media.type === "image" ? values.media.images : undefined,
      tool: values.tool,
      toolVersion: values.toolVersion,
      tags: values.tags,
      price: Math.round(values.price * 100),
      pricing: {
        mode: values.pricingMode,
        bundleSlugs: values.pricingMode === "bundle" ? values.bundleSlugs : undefined,
      },
      createdAt: new Date().toISOString(),
      stats: { views: 0, sales: 0, saves: 0, likes: 0 },
      trendingScore: 0,
      isAdult: values.adult || undefined,
      recipe: {
        prompts: values.prompts,
        settings: values.settings,
        assets: values.assets.map((a) => ({ name: a.name, note: a.note || undefined })),
        editStack: values.editSteps,
        failures: values.failures.map((f) => ({ imageUrl: f.imageUrl || undefined, note: f.note })),
      },
    }
    addListing(listing)
    clearDraft()
    toast.success("Your recipe is live")
    router.push(`/r/${slug}`)
  }

  const current = STEPS[step]!
  const isFirst = step === 0
  const isLast = step === STEPS.length - 1

  // Buttons follow the step's position: Previous only after the first, Publish only on the last
  const footer = (
    <div className="grid grid-cols-2 gap-3 sm:flex sm:items-center">
      {!isFirst && (
        <Button
          type="button"
          variant="outline"
          size="pill"
          className="text-primary"
          onClick={() => goTo(step - 1)}
          disabled={publishing}
        >
          Previous step
        </Button>
      )}
      <div className={cn("contents sm:ml-auto sm:flex sm:gap-3", isFirst && "col-span-2")}>
        <Button
          type="button"
          variant="secondary"
          size="pill"
          className={cn("text-primary", isFirst && "col-start-1")}
          onClick={onSaveDraft}
          disabled={publishing}
        >
          Save to draft
        </Button>
        <Button
          type="submit"
          size="pill"
          className={cn(!isFirst && "order-first col-span-2 sm:order-none")}
          disabled={publishing}
        >
          {publishing && <Loader2Icon className="animate-spin" aria-hidden />}
          {isLast ? (publishing ? "Publishing…" : "Publish") : "Continue"}
        </Button>
      </div>
    </div>
  )

  return (
    <FormProvider {...methods}>
      <div ref={topRef} className="scroll-mt-24">
        <Card
          className={cn(
            "mx-auto w-full gap-8",
            current.id === "details" ? "max-w-5xl" : "max-w-3xl"
          )}
        >
          <CardHeader className="items-center gap-1 border-b text-center">
            <span className="label-caps">
              Step {step + 1} of {STEPS.length}
            </span>
            <CardTitle className="text-3xl font-bold tracking-tight">
              <h1>{current.title}</h1>
            </CardTitle>
            <p className="text-sm text-muted-foreground">{current.description}</p>
          </CardHeader>

          <form
            noValidate
            className="contents"
            onSubmit={(e) => {
              e.preventDefault()
              if (isLast) methods.handleSubmit(publish, onInvalid)()
              else next()
            }}
          >
            <CardContent className="md:px-10 md:pb-4">
              {current.id === "details" ? (
                <DetailsStep footer={footer} />
              ) : (
                <div className="flex flex-col gap-8">
                  <RecipeStep />
                  <div className="border-t pt-6">{footer}</div>
                </div>
              )}
            </CardContent>
          </form>
        </Card>
      </div>
    </FormProvider>
  )
}
