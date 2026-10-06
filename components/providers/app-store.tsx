"use client"

import * as React from "react"

import { toast } from "sonner"

import type { ListingFormValues } from "@/components/sell/listing-schema"
import { remote, type Account, type AuthIdentity } from "@/lib/supabase/account"
import { supabaseConfigured } from "@/lib/supabase/env"
import type { Creator, Listing, SessionUser } from "@/lib/types"

/**
 * Client state: session, purchases, saves, likes, listings the user has
 * created and seller settings, cached in localStorage.
 *
 * With Supabase configured, the signed-in account is loaded from the database
 * (`applyAccount`, called by <AccountSync>) and changes are written back; the
 * UI updates optimistically. Without it, everything stays in this browser
 * (demo mode). Follows and drafts are browser-only for now.
 */

interface PayoutThreshold {
  currency: "USD" | "EUR" | "GBP"
  amount: number
}

interface StoreState {
  user: SessionUser | null
  /** Signed in with Supabase Auth; `user` stays null until they pick a username */
  authIdentity: AuthIdentity | null
  purchased: string[]
  saved: string[]
  liked: string[]
  /** Creator ids the user follows */
  following: string[]
  createdListings: Listing[]
  sampleData: boolean
  payoutThreshold: PayoutThreshold
  /** Has this browser seen the first-visit welcome pop-up? */
  welcomed: boolean
  /** One in-progress listing, saved with "Save to draft" */
  draft: { values: ListingFormValues; step: number; savedAt: string } | null
}

interface StoreActions {
  signIn: (user: SessionUser) => void
  signOut: () => void
  becomeSeller: (seller: NonNullable<SessionUser["seller"]>) => void
  updateProfile: (profile: Pick<SessionUser, "displayName" | "bio">) => void
  purchase: (slug: string) => void
  toggleSave: (slug: string) => boolean
  toggleLike: (slug: string) => boolean
  toggleFollow: (creatorId: string) => boolean
  addListing: (listing: Listing) => void
  setSampleData: (on: boolean) => void
  setPayoutThreshold: (t: PayoutThreshold) => void
  saveDraft: (values: ListingFormValues, step: number) => void
  clearDraft: () => void
  dismissWelcome: () => void
  /** Replace account state with what's in Supabase (null = signed out) */
  applyAccount: (account: Account | null) => void
}

type Store = StoreState & StoreActions & { hydrated: boolean }

const STORAGE_KEY = "recipe-store-v1"

const initialState: StoreState = {
  user: null,
  authIdentity: null,
  purchased: [],
  saved: [],
  liked: [],
  following: [],
  createdListings: [],
  sampleData: true,
  payoutThreshold: { currency: "USD", amount: 50 },
  draft: null,
  welcomed: false,
}

type Snapshot = StoreState & { hydrated: boolean }

// Module-level external store, read with useSyncExternalStore so the server
// render and first client render agree, then localStorage takes over.
const serverSnapshot: Snapshot = { ...initialState, hydrated: false }
let data: StoreState = initialState
let snapshot: Snapshot = serverSnapshot
let loaded = false
const listeners = new Set<() => void>()

function load() {
  if (loaded || typeof window === "undefined") return
  loaded = true
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) data = { ...initialState, ...JSON.parse(raw) }
  } catch {
    // Unreadable or blocked storage: start fresh
  }
  snapshot = { ...data, hydrated: true }
}

function setState(update: (s: StoreState) => StoreState) {
  load()
  data = update(data)
  snapshot = { ...data, hydrated: true }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // Quota exceeded (large uploaded media) or blocked storage
  }
  listeners.forEach((l) => l())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getSnapshot() {
  load()
  return snapshot
}

/** Write to Supabase when signed in there; keep the optimistic UI either way. */
function sync(write: (profileId: string) => Promise<unknown>) {
  const profileId = data.user?.profileId
  if (!supabaseConfigured || !profileId) return
  write(profileId).catch((error) => {
    console.error(error)
    toast.error("Couldn't save that change. Check your connection and try again.")
  })
}

const actions: StoreActions = {
  signIn: (user) => setState((s) => ({ ...s, user })),
  signOut: () => {
    if (supabaseConfigured) void remote.signOut()
    setState((s) => ({
      ...s,
      user: null,
      authIdentity: null,
      // Account data belongs to the account, not the device
      ...(supabaseConfigured ? { purchased: [], saved: [], liked: [], createdListings: [] } : {}),
    }))
  },
  becomeSeller: (seller) => {
    setState((s) => (s.user ? { ...s, user: { ...s.user, isSeller: true, seller } } : s))
    sync((id) => remote.becomeSeller(id, seller))
  },
  updateProfile: (profile) => {
    setState((s) => (s.user ? { ...s, user: { ...s.user, ...profile } } : s))
    const user = data.user
    if (user) sync((id) => remote.updateProfile(id, { ...profile, username: user.username }))
  },
  purchase: (slug) => {
    setState((s) => (s.purchased.includes(slug) ? s : { ...s, purchased: [...s.purchased, slug] }))
    sync(() => remote.purchase(slug))
  },
  toggleSave: (slug) => {
    const nowSaved = !getSnapshot().saved.includes(slug)
    setState((s) => ({
      ...s,
      saved: nowSaved ? [...s.saved, slug] : s.saved.filter((x) => x !== slug),
    }))
    sync(() => remote.setSave(slug, nowSaved))
    return nowSaved
  },
  toggleLike: (slug) => {
    const nowLiked = !getSnapshot().liked.includes(slug)
    setState((s) => ({
      ...s,
      liked: nowLiked ? [...s.liked, slug] : s.liked.filter((x) => x !== slug),
    }))
    sync(() => remote.setLike(slug, nowLiked))
    return nowLiked
  },
  toggleFollow: (creatorId) => {
    const nowFollowing = !getSnapshot().following.includes(creatorId)
    setState((s) => ({
      ...s,
      following: nowFollowing
        ? [...s.following, creatorId]
        : s.following.filter((x) => x !== creatorId),
    }))
    return nowFollowing
  },
  addListing: (listing) =>
    setState((s) => ({ ...s, createdListings: [listing, ...s.createdListings] })),
  setSampleData: (sampleData) => setState((s) => ({ ...s, sampleData })),
  setPayoutThreshold: (payoutThreshold) => {
    setState((s) => ({ ...s, payoutThreshold }))
    sync((id) => remote.setPayoutThreshold(id, payoutThreshold))
  },
  saveDraft: (values, step) =>
    setState((s) => ({ ...s, draft: { values, step, savedAt: new Date().toISOString() } })),
  clearDraft: () => setState((s) => ({ ...s, draft: null })),
  dismissWelcome: () => setState((s) => ({ ...s, welcomed: true })),
  applyAccount: (account) =>
    setState((s) =>
      account
        ? {
            ...s,
            authIdentity: account.identity,
            user: account.user,
            purchased: account.purchased,
            saved: account.saved,
            liked: account.liked,
            createdListings: account.createdListings,
            payoutThreshold: account.payoutThreshold ?? s.payoutThreshold,
          }
        : // Signed out elsewhere (or session expired): drop account data
          { ...s, authIdentity: null, user: null, purchased: [], saved: [], liked: [], createdListings: [] }
    ),
}

export function useAppStore(): Store {
  const state = React.useSyncExternalStore(subscribe, getSnapshot, () => serverSnapshot)
  return React.useMemo(() => ({ ...state, ...actions }), [state])
}

/**
 * The creator id for the signed-in user's listings: their Supabase profile id,
 * or a local id in demo mode.
 */
export function userCreatorId(username: string) {
  const user = data.user
  return user?.username === username && user.profileId ? user.profileId : `user:${username}`
}

/** A Creator record for the signed-in user, used for listings they create. */
export function creatorFromUser(user: SessionUser): Creator {
  return {
    id: userCreatorId(user.username),
    username: user.username,
    displayName: user.displayName || user.username,
    bio: user.bio ?? "",
  }
}
