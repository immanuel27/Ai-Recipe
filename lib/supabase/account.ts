"use client"

import { createClient } from "@/lib/supabase/client"
import { listingFromRow, type ListingRow, type RecipeRow } from "@/lib/supabase/mappers"
import type { Listing, SessionUser } from "@/lib/types"

// The signed-in user's account data in Supabase, and the writes that change it.
// Used by the client store (components/providers/app-store.tsx).

export interface AuthIdentity {
  email: string
  provider: SessionUser["provider"]
}

export interface Account {
  identity: AuthIdentity
  /** Null until they pick a username (profile row not created yet) */
  user: SessionUser | null
  purchased: string[]
  saved: string[]
  liked: string[]
  /** Listings this user has published */
  createdListings: Listing[]
  payoutThreshold?: { currency: "USD" | "EUR" | "GBP"; amount: number }
}

type SlugRow = { listings: { slug: string } | null }
const slugs = (rows: SlugRow[] | null) =>
  (rows ?? []).flatMap((r) => (r.listings ? [r.listings.slug] : []))

/** Load everything for the current session, or null if signed out. */
export async function loadAccount(): Promise<Account | null> {
  const supabase = createClient()
  const { data: auth } = await supabase.auth.getUser()
  const authUser = auth.user
  if (!authUser) return null

  const identity: AuthIdentity = {
    email: authUser.email ?? "",
    provider: authUser.app_metadata?.provider === "google" ? "google" : "email",
  }

  const [profileRes, purchasesRes, savesRes, likesRes] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, username, display_name, bio, is_seller, seller_settings(payout_method, country, proof_of_work_url, payout_currency, payout_threshold)")
      .eq("auth_user_id", authUser.id)
      .maybeSingle(),
    supabase.from("purchases").select("listings(slug)").order("created_at"),
    supabase.from("saves").select("listings(slug)").order("created_at"),
    supabase.from("likes").select("listings(slug)").order("created_at"),
  ])

  const p = profileRes.data as
    | {
        id: string
        username: string
        display_name: string
        bio: string
        is_seller: boolean
        seller_settings: {
          payout_method: string
          country: string
          proof_of_work_url: string
          payout_currency: "USD" | "EUR" | "GBP"
          payout_threshold: number
        } | null
      }
    | null

  const seller = p?.seller_settings ?? null

  // Their own listings, with full recipes (owners can always read their recipes)
  let createdListings: Listing[] = []
  if (p) {
    const { data: own } = await supabase
      .from("listings")
      .select("*, recipes(prompts, settings, assets, edit_stack, failures)")
      .eq("creator_id", p.id)
      .order("created_at", { ascending: false })
    createdListings = ((own ?? []) as (ListingRow & { recipes: RecipeRow | null })[]).map((row) =>
      listingFromRow(row, row.recipes ?? undefined)
    )
  }

  return {
    identity,
    user: p
      ? {
          username: p.username,
          profileId: p.id,
          displayName: p.display_name !== p.username ? p.display_name : undefined,
          bio: p.bio || undefined,
          email: identity.email,
          provider: identity.provider,
          isSeller: p.is_seller,
          seller: seller
            ? {
                payoutMethod: seller.payout_method,
                country: seller.country,
                proofOfWorkUrl: seller.proof_of_work_url,
              }
            : undefined,
        }
      : null,
    purchased: slugs(purchasesRes.data as SlugRow[] | null),
    saved: slugs(savesRes.data as SlugRow[] | null),
    liked: slugs(likesRes.data as SlugRow[] | null),
    createdListings,
    payoutThreshold: seller
      ? { currency: seller.payout_currency, amount: seller.payout_threshold }
      : undefined,
  }
}

/** Create the profile for a signed-in user. Returns an error message or null. */
export async function createProfile(username: string): Promise<{ profileId?: string; error?: string }> {
  const supabase = createClient()
  const { data: auth } = await supabase.auth.getUser()
  if (!auth.user) return { error: "Your sign-in expired. Please sign in again." }
  const { data, error } = await supabase
    .from("profiles")
    .insert({ auth_user_id: auth.user.id, username, display_name: username })
    .select("id")
    .single()
  if (error) {
    return { error: error.code === "23505" ? "That username is taken. Try another." : error.message }
  }
  return { profileId: data.id }
}

async function listingId(slug: string) {
  const supabase = createClient()
  const { data } = await supabase.from("listings").select("id").eq("slug", slug).maybeSingle()
  return data?.id as string | undefined
}

/** Fire-and-forget writes used by the store (errors are logged, UI stays optimistic). */
export const remote = {
  async purchase(slug: string) {
    const id = await listingId(slug)
    if (!id) return
    const { error } = await createClient().from("purchases").upsert({ listing_id: id }, { ignoreDuplicates: true })
    if (error) throw error
  },
  async setLike(slug: string, on: boolean) {
    const id = await listingId(slug)
    if (!id) return
    const table = createClient().from("likes")
    const { error } = on
      ? await table.upsert({ listing_id: id }, { ignoreDuplicates: true })
      : await table.delete().eq("listing_id", id)
    if (error) throw error
  },
  async setSave(slug: string, on: boolean) {
    const id = await listingId(slug)
    if (!id) return
    const table = createClient().from("saves")
    const { error } = on
      ? await table.upsert({ listing_id: id }, { ignoreDuplicates: true })
      : await table.delete().eq("listing_id", id)
    if (error) throw error
  },
  async updateProfile(profileId: string, profile: { displayName?: string; bio?: string; username: string }) {
    const { error } = await createClient()
      .from("profiles")
      .update({ display_name: profile.displayName || profile.username, bio: profile.bio ?? "" })
      .eq("id", profileId)
    if (error) throw error
  },
  async becomeSeller(profileId: string, seller: NonNullable<SessionUser["seller"]>) {
    const supabase = createClient()
    const { error } = await supabase.from("seller_settings").upsert({
      profile_id: profileId,
      payout_method: seller.payoutMethod,
      country: seller.country,
      proof_of_work_url: seller.proofOfWorkUrl,
    })
    if (error) throw error
    const { error: e2 } = await supabase.from("profiles").update({ is_seller: true }).eq("id", profileId)
    if (e2) throw e2
  },
  async setPayoutThreshold(profileId: string, t: { currency: string; amount: number }) {
    const { error } = await createClient()
      .from("seller_settings")
      .update({ payout_currency: t.currency, payout_threshold: t.amount })
      .eq("profile_id", profileId)
    if (error) throw error
  },
  /**
   * Delete one of your listings. The recipe, proof link, likes and saves go with
   * it (on delete cascade); then its files in Storage are removed.
   */
  async deleteListing(slug: string) {
    const supabase = createClient()
    const { data: auth } = await supabase.auth.getUser()
    if (!auth.user) throw new Error("Your sign-in expired. Please sign in again.")
    const id = await listingId(slug)
    if (id) {
      // RLS only lets creators delete their own rows; check one actually went
      const { data, error } = await supabase.from("listings").delete().eq("id", id).select("id")
      if (error) throw error
      if (!data?.length) throw new Error("You can only delete your own posts.")
    }
    // Media lives at <uid>/<slug>/…; leftovers aren't fatal, the post is already gone
    const folder = `${auth.user.id}/${slug}`
    const { data: files } = await supabase.storage.from("media").list(folder)
    if (files?.length) {
      await supabase.storage.from("media").remove(files.map((f) => `${folder}/${f.name}`))
    }
    await fetch("/api/revalidate", { method: "POST" }).catch(() => {})
  },
  async signOut() {
    await createClient().auth.signOut()
  },
}
