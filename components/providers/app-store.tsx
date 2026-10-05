"use client"

import * as React from "react"

import type { ListingFormValues } from "@/components/sell/listing-schema"
import type { Creator, Listing, SessionUser } from "@/lib/types"

/**
 * Client-side mock state: session, purchases, saves, listings the user has
 * created and seller settings. Persisted to localStorage. Replace with real
 * auth + API calls later.
 */

interface PayoutThreshold {
  currency: "USD" | "EUR" | "GBP"
  amount: number
}

interface StoreState {
  user: SessionUser | null
  purchased: string[]
  saved: string[]
  liked: string[]
  createdListings: Listing[]
  sampleData: boolean
  payoutThreshold: PayoutThreshold
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
  addListing: (listing: Listing) => void
  setSampleData: (on: boolean) => void
  setPayoutThreshold: (t: PayoutThreshold) => void
  saveDraft: (values: ListingFormValues, step: number) => void
  clearDraft: () => void
}

type Store = StoreState & StoreActions & { hydrated: boolean }

const STORAGE_KEY = "recipe-store-v1"

const initialState: StoreState = {
  user: null,
  purchased: [],
  saved: [],
  liked: [],
  createdListings: [],
  sampleData: true,
  payoutThreshold: { currency: "USD", amount: 50 },
  draft: null,
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

const actions: StoreActions = {
  signIn: (user) => setState((s) => ({ ...s, user })),
  signOut: () => setState((s) => ({ ...s, user: null })),
  becomeSeller: (seller) =>
    setState((s) => (s.user ? { ...s, user: { ...s.user, isSeller: true, seller } } : s)),
  updateProfile: (profile) =>
    setState((s) => (s.user ? { ...s, user: { ...s.user, ...profile } } : s)),
  purchase: (slug) =>
    setState((s) => (s.purchased.includes(slug) ? s : { ...s, purchased: [...s.purchased, slug] })),
  toggleSave: (slug) => {
    const nowSaved = !getSnapshot().saved.includes(slug)
    setState((s) => ({
      ...s,
      saved: nowSaved ? [...s.saved, slug] : s.saved.filter((x) => x !== slug),
    }))
    return nowSaved
  },
  toggleLike: (slug) => {
    const nowLiked = !getSnapshot().liked.includes(slug)
    setState((s) => ({
      ...s,
      liked: nowLiked ? [...s.liked, slug] : s.liked.filter((x) => x !== slug),
    }))
    return nowLiked
  },
  addListing: (listing) =>
    setState((s) => ({ ...s, createdListings: [listing, ...s.createdListings] })),
  setSampleData: (sampleData) => setState((s) => ({ ...s, sampleData })),
  setPayoutThreshold: (payoutThreshold) => setState((s) => ({ ...s, payoutThreshold })),
  saveDraft: (values, step) =>
    setState((s) => ({ ...s, draft: { values, step, savedAt: new Date().toISOString() } })),
  clearDraft: () => setState((s) => ({ ...s, draft: null })),
}

export function useAppStore(): Store {
  const state = React.useSyncExternalStore(subscribe, getSnapshot, () => serverSnapshot)
  return React.useMemo(() => ({ ...state, ...actions }), [state])
}

export function userCreatorId(username: string) {
  return `user:${username}`
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
