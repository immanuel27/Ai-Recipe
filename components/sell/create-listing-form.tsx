"use client"

import * as React from "react"
import Link from "next/link"
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
  valuesFromListing,
  withDefaults,
  type ListingFormValues,
} from "@/components/sell/listing-schema"
import { DetailsStep } from "@/components/sell/steps/details-step"
import { TypeStep } from "@/components/sell/steps/type-step"
import { RecipeStep } from "@/components/sell/steps/recipe-step"
import { useAppStore, userCreatorId } from "@/components/providers/app-store"
import { slugify } from "@/lib/format"
import { supabaseConfigured } from "@/lib/supabase/env"
import { publishListing, updateListing } from "@/lib/supabase/publish"
import type { Listing } from "@/lib/types"
import { cn } from "@/lib/utils"
import { PAYMENTS_ENABLED } from "@/lib/flags"

const STEPS = [
  { id: "type", title: "What are you posting?", description: "Pick one. You can change it later." },
  { id: "details", title: "Details", description: "Add your cover and post details." },
  {
    id: "recipe",
    title: "Recipe",
    description: PAYMENTS_ENABLED ? "What buyers unlock. Only the prompts are required." : "What people unlock. Only the prompts are required.",
  },
] as const

/**
 * Three-step posting flow, like posting on TikTok or Reels:
 * 1. Type (videos, photos, websites & apps)  2. Details (cover or site link, info, price)
 * 3. Recipe contents → Publish
 * Editing a post reuses it from Details on (the type stays), without drafts.
 */
export function CreateListingForm({ editing }: { editing?: { listing: Listing; proofUrl: string } } = {}) {
  const router = useRouter()
  const { user, addListing, updateListing: updateStored, draft: savedDraft, saveDraft, clearDraft } = useAppStore()
  const draft = editing ? null : savedDraft
  const steps = editing ? STEPS.slice(1) : STEPS
  const stepFields = editing ? STEP_FIELDS.slice(1) : STEP_FIELDS
  const [step, setStep] = React.useState(() => draft?.step ?? 0)
  const [publishing, setPublishing] = React.useState(false)
  const topRef = React.useRef<HTMLDivElement>(null)
  const methods = useForm<ListingFormValues>({
    resolver: zodResolver(listingSchema),
    defaultValues: editing
      ? valuesFromListing(editing.listing, editing.proofUrl)
      : draft
        ? withDefaults(draft.values)
        : listingDefaults,
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
    const ok = await methods.trigger([...stepFields[step]!] as (keyof ListingFormValues)[], {
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
    const earlier = stepFields.findIndex((fields, i) => i < step && fields.some((f) => f in errors))
    if (earlier !== -1) {
      goTo(earlier)
      toast.error(`Check the ${steps[earlier]!.title} step before ${editing ? "saving" : "publishing"}.`)
    }
  }

  async function publish(values: ListingFormValues) {
    if (!user) return
    setPublishing(true)
    const original = editing?.listing
    // Editing keeps the post's address, id, stats and date
    const slug = original?.slug ?? `${slugify(values.title)}-${Math.random().toString(36).slice(2, 6)}`
    const listing: Listing = {
      ...original,
      id: original?.id ?? crypto.randomUUID(),
      slug,
      title: values.title,
      description: values.description,
      creatorId: userCreatorId(user.username),
      type: values.media.type,
      mediaUrl: values.media.url,
      posterUrl: values.media.posterUrl,
      images: values.media.type === "image" ? values.media.images : undefined,
      aiTag: values.media.aiTag,
      tool: values.tools[0]!,
      tools: values.tools,
      toolVersion: "",
      tags: values.tags,
      // Payments are off for now: every recipe is free
      price: PAYMENTS_ENABLED ? Math.round(values.price * 100) : 0,
      pricing:
        PAYMENTS_ENABLED && values.pricingMode === "bundle"
          ? { mode: "bundle", bundleSlugs: values.bundleSlugs }
          : { mode: "single" },
      createdAt: original?.createdAt ?? new Date().toISOString(),
      stats: original?.stats ?? { views: 0, sales: 0, saves: 0, likes: 0 },
      trendingScore: original?.trendingScore ?? 0,
      isAdult: values.adult || undefined,
      liveUrl: values.postType === "website" && values.liveUrl ? values.liveUrl : undefined,
      recipe: {
        prompts: values.prompts,
        settings: values.settings,
        assets: values.assets.map((a) => ({ name: a.name, note: a.note || undefined })),
        editStack: values.editSteps,
        failures: values.failures.map((f) => ({ imageUrl: f.imageUrl || undefined, note: f.note })),
      },
    }
    // A site link that is itself a share link (e.g. a lovable.app site) doubles as proof
    const proof = values.proofUrl || (values.postType === "website" ? values.liveUrl : "")
    let published = listing
    if (supabaseConfigured && user.profileId) {
      // Upload media to Storage and save the listing + locked recipe
      try {
        published = original
          ? await updateListing(original, listing, proof || undefined)
          : await publishListing(listing, user.profileId, proof || undefined)
      } catch (error) {
        setPublishing(false)
        toast.error(error instanceof Error ? error.message : `Couldn't ${original ? "save" : "publish"}. Try again.`)
        return
      }
    }
    if (original) {
      updateStored(published)
      toast.success("Changes saved")
      router.push(`/r/${slug}`)
      router.refresh()
      return
    }
    addListing(published)
    clearDraft()
    toast.success("Your recipe is live")
    router.push(`/r/${slug}`)
  }

  const current = steps[step]!
  const isFirst = step === 0
  const isLast = step === steps.length - 1

  // Buttons follow the step's position: Previous only after the first, Publish only on the last
  const footer = (
    <div className="grid grid-cols-2 gap-3 sm:flex sm:items-center">
      {/* Nobody has to list a recipe to finish signing up */}
      {isFirst && (
        <Button asChild type="button" variant="ghost" size="pill" className="col-span-2 text-muted-foreground sm:col-span-1">
          {editing ? <Link href={`/r/${editing.listing.slug}`}>Cancel</Link> : <Link href="/">Skip for now</Link>}
        </Button>
      )}
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
        {/* Drafts are for new posts; edits save straight to the post */}
        {!editing && (
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
        )}
        <Button
          type="submit"
          size="pill"
          className={cn((!isFirst || editing) && "order-first col-span-2 sm:order-none")}
          disabled={publishing}
        >
          {publishing && <Loader2Icon className="animate-spin" aria-hidden />}
          {isLast
            ? publishing
              ? editing ? "Saving…" : "Publishing…"
              : editing ? "Save changes" : "Publish"
            : "Continue"}
        </Button>
      </div>
    </div>
  )

  return (
    <FormProvider {...methods}>
      <div ref={topRef} className="scroll-mt-6">
        <Card
          className={cn(
            "mx-auto w-full gap-8",
            current.id === "details" ? "max-w-5xl" : "max-w-3xl"
          )}
        >
          <CardHeader className="items-center gap-1 border-b text-center">
            <span className="label-caps">
              {editing ? "Editing · " : ""}Step {step + 1} of {steps.length}
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
              {current.id === "type" ? (
                <div className="flex flex-col gap-8">
                  <TypeStep onPick={() => void next()} />
                  <div className="border-t pt-6">{footer}</div>
                </div>
              ) : current.id === "details" ? (
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
