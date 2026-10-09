@AGENTS.md

# Ai Recipy

A marketplace where creators sell step-by-step recipes for AI-made videos and images.

- A **listing** is the artifact itself: an autoplaying video or an image.
- Buyers purchase the **full recipe**: prompts, tool + version, settings/seeds, reference assets, the edit stack, and failed attempts with notes on why they failed.

## Stack

- Next.js 16 App Router, TypeScript, Tailwind CSS v4, shadcn/ui (Radix base, `radix-nova` style, lucide icons).
- Forms: react-hook-form + zod. Charts: shadcn `chart` (recharts). Toasts: sonner.
- Node 20.9+ is required. Commands: `npm run dev`, `npm run lint`, `npm run build`. (On the original dev machine Node lives in `~/.local/node/bin`, which isn't on the default PATH.)
- Mock media is placeholder only, and none of it is AI-generated.
  - Cartoon videos are 12-second clips of Blender Studio open movies (CC BY, from Wikimedia Commons), pre-cut to `public/clips/` so they load fast, plus Mixkit clips. Only use Mixkit items labelled "Free License"; "Restricted" ones are personal-use only.
  - Every third-party clip must carry a `credit` (shown under the listing media and on `/credits`). Posters are saved in `public/posters/`.
  - Older placeholders: test-videos.co.uk and MDN clips, picsum photos.
  - Uploaded videos are kept in memory for the session as blob URLs; only their captured poster is persisted.
  - Never pull clips from YouTube, X or TikTok.
- **Use theme tokens from `app/globals.css`; never hardcode colours.** Use `bg-primary`, `text-muted-foreground`, `bg-muted`, `text-highlight`, `bg-scrim/80`, `text-on-media`, etc. If a colour is missing, add a token to `:root` and `.dark`, then expose it in `@theme inline`. The only exception is places that can't read CSS variables (the web manifest and `ImageResponse` icons). Those use `lib/brand.ts`, which mirrors the tokens.

### Theme tokens (app/globals.css)

| Token | Use |
| --- | --- |
| `background` | Soft neutral grey page background |
| `card` | White card surface |
| `muted` / `muted-foreground` | Inset panels inside cards, secondary text |
| `primary` | Blue pill buttons, links, active nav |
| `highlight` (= `chart-1`) | Orange accent for charts and data |
| `success` | Positive status pills |
| `scrim` / `on-media` | Gradients and text over video or images |
| `--radius` = 0.875rem | `rounded-xl` ≈ 20px for cards, `rounded-lg` for inputs and inset panels |

## Backend: Supabase

- Project `diwvhzriwkpkocyguaet` (eu-north-1). Keys go in `.env.local` (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`); see `.env.example`. Never commit the secret/service-role key.
- Schema and seed live in `supabase/migrations/*.sql` and `supabase/seed.sql`. Every schema change gets a new migration file; Row Level Security is on for every table.
- Tables:
  - `profiles` (public; `auth_user_id` is null for the seeded demo creators)
  - `seller_settings` (owner only)
  - `listings` (public, with a `preview` teaser)
  - `recipes` (readable only for free listings, the creator, or buyers)
  - `purchases`, `likes` and `saves` (owner only; triggers keep the listing counters in sync)
  - Storage bucket `media`: public read, and users write only to `<auth uid>/…`
- Helper and trigger functions live in the private `private` schema, not the public API.
- Clients:
  - `lib/supabase/server.ts` for server components and routes
  - `lib/supabase/client.ts` for the browser
  - `proxy.ts` refreshes sessions (Next 16's renamed middleware)
  - Rows map to app types in `lib/supabase/mappers.ts`
- Reads: `lib/data.ts` (async, cached per request) reads Supabase, falling back to `lib/mock` when env vars are missing, so a fresh clone still runs.
- Locked recipes: unbought recipes arrive as a teaser (`listing.recipeLocked`), and `useOwnedRecipe()` fetches the full recipe once owned.
- Account: `<AccountSync>` loads the signed-in account into the store; store actions write purchases, likes, saves, profile, seller setup and payout threshold back through `lib/supabase/account.ts`.
- Publishing: `lib/supabase/publish.ts` uploads media to Storage, then inserts the listing and its recipe.
- Auth: email magic link and Google (`/auth/callback` exchanges the code, `/auth/confirm` handles token-hash links). After the first sign-in, people pick a username, which creates their profile.
- Editing and deleting: owners see Edit post / Delete on their post (and in Profile → Listings). `/r/[slug]/edit` reuses `CreateListingForm` with `editing` (from Details on, no drafts; `valuesFromListing()` fills it) and saves through `updateListing()` (replaced media gets new file names). Delete is a soft delete (`deleteListing()` sets `listings.archived_at`): RLS hides it from everyone except the creator and its buyers, who keep their recipe, and it can't be bought any more.
- Still browser-only: follows, drafts, and the dashboard's sample sales/earnings.

## Design language

- Soft neutral grey page background (`bg-background`).
- White cards (`<Card>`) with a large radius (~20px, `rounded-xl`) and hairline borders (built into Card as a `ring-1 ring-foreground/10`).
- Inset muted panels inside cards for grouped info (`<InsetPanel>`, which is `rounded-lg bg-muted p-4`).
- Small uppercase tracked labels over large bold values (`.label-caps` utility plus `<Stat>`).
- Primary blue pill buttons (`<Button size="pill">`), full-width at the bottom of cards (`className="w-full"` inside `CardFooter`).
- Orange (`highlight` / `chart-1`) is the accent for charts and data.
- Generous padding: Card spacing defaults to `--spacing(6)`, or `size="sm"` for `--spacing(4)`.
- **One clear action per card.**
- Navigation is pill-shaped: the active item is filled primary, and inactive ones are white with a hairline ring (header nav, Explore type pills).
- Listing cards (`components/shared/listing-card.tsx`) are a white `rounded-2xl` card with `p-3`, a `rounded-xl` image at 12:13, a frosted play badge bottom-right on videos (with a muted hover preview), a bold title, two muted lines of description, and the creator avatar and name with a large primary-blue price.
- Posting (`/sell`) works like TikTok or Reels, in 3 steps: **What are you posting?** (Videos, Photos, or Websites & apps; picking one moves on), then **Details** (cover on the left, fields on the right), then **Recipe** (the contents) → Publish. Previous step shows after step 1, Save to draft on every step, and Publish on the last. Drafts are saved in the store (`draft`). Creators pick **one or more tools** (`Listing.tools`, main one first, mirrored in `Listing.tool`); there is no version field any more (`toolVersion` is legacy and never shown).
- Media can be any shape (`components/shared/fit-media.tsx`).
  - **Feed videos** fill an upright screen, like TikTok. On a sideways (landscape) screen they use `fitFor` and show whole.
  - **Feed images** use `FitImage`: they fill when close to the screen's shape, otherwise they show whole over a blurred backdrop.
  - **Listing page videos** show in their true shape (the frame takes the video's aspect ratio). They take over the screen when a phone is rotated sideways and have a fullscreen button.
  - Image posts hold up to 8 images (`Listing.images`) in `MediaCarousel`.
  - The `short:` variant targets sideways phones; use it to keep immersive layouts full-screen.
- The site footer (logo and tagline, Explore / Follow us / Legal columns) shows on every page except the full-screen feed.
- Empty states use `<EmptyState>`: an icon in a muted square, a title, one line of text, and one pill button.
- Dark mode: `next-themes` (`components/providers/theme-provider.tsx`) toggles the `.dark` class. The site is **dark by default for everyone**; light and system are opt-in, only from Profile → Settings → Appearance (no theme toggle in headers or menus). Every colour must come from a token with a `.dark` value.
- Every icon-only button has an `aria-label`. Every image has `alt`. Every video has a `poster`, and `preload="none"` when off-screen.
- Respect `prefers-reduced-motion`: no autoplay and no smooth scrolling when it's set (`usePrefersReducedMotion`). Exception, by product decision: home reels always autoplay, **with sound by default** (browsers block sound until the first tap, so reels play muted with a "Tap for sound" chip until then; `m` toggles sound on desktop). Their expand button opens the preview (`RecipeModal`); tapping the video pauses.
- Mobile-first: check at 375px with no horizontal scroll.
- Scrolling: on phones (< md) the **page itself scrolls** so the browser can tuck its toolbar away; the dock is a full-width bar fixed to the bottom (`--spacing-dock-bar`, includes the home-indicator inset), and the home feed snaps on `<html>` (`.snap-feed`) with each reel `100dvh` minus the bar. From md up, the frame is fixed and the canvas (`#canvas`) scrolls inside it. Don't assume either scroller: use viewport-based IntersectionObservers and `scrollIntoView`.

## Conventions

- Server components by default; add `"use client"` only where needed (state, effects, browser APIs, event handlers).
- Shared types in `lib/types.ts`.
- Data access goes through `lib/data.ts` (Supabase, with `lib/mock/` as the fallback and the seed source).
- Client state lives in `components/providers/app-store.tsx` (`useAppStore()`, an external store cached in `localStorage`; no provider needed). With Supabase configured, it mirrors the signed-in account (see Backend).
- Feature components in `components/<feature>/` (`feed`, `explore`, `listing`, `auth`, `sell`, `profile`, `dashboard` for the seller tools, `shell`). Cross-feature building blocks are in `components/shared/`. shadcn primitives are in `components/ui/`.
- **Profile** (`/profile`, formerly Dashboard; `/dashboard` redirects).
  - For everyone: Profile (header plus your posts), Library (purchased, saved and liked) and Settings.
  - Seller tools under a "Selling" label: Overview, Listings, Sales and Payouts.
  - Public creator profiles are at `/u/[username]` (`profileHref()` in `lib/profile.ts`), and creator names across the app link there.
- **Uploads must be made with AI.** Every uploaded image or video (the cover and failed-attempt images) is checked with `detectAiTag()` in `lib/ai-provenance.ts` before it's accepted.
  - The check reads the original file's provenance metadata: C2PA Content Credentials or an IPTC digital source type of trained algorithmic media, or generator metadata (Stable Diffusion or ComfyUI PNG data, or a known AI tool named in a software/creator-tool field).
  - Files without a tag get a clear error. Accepted posts store `Listing.aiTag`, but no "Made with AI" label is shown: the only badge on posts is `<VerifiedBadge>` (team-checked proof link).
  - Run the check on the original `File`, before any canvas re-encode, which strips metadata.
  - This is client-side only; production must also verify C2PA signatures on the server.
- **Website recipes and proof links.** Tools have a `kind` (`media` or `website`, in `lib/mock/tools.ts`). Websites & apps posts have **no upload**: the creator pastes the live link and `captureWebsite()` (`lib/screenshot.ts`, Microlink from the browser, free tier ~25/day per visitor, no key) captures 1280×1200 (the hero and about half of the next section) as the cover. They skip the AI-tag check and need a proof link, unless the live link itself is one (e.g. `*.lovable.app`). Explore has a Websites type.
  - The proof link is the tool's share link (e.g. `higgsfield.ai/s/…`, `chatgpt.com/share/…`, `claude.ai/share/…`), checked against `Tool.proofLinks` by `isProofLinkFor()`. It's optional for media posts.
  - It's stored privately in `listing_proofs` (RLS: the creator and buyers only) and shown to buyers as "See the original on <tool>".
  - The team verifies posts by setting `listings.verified_at` in Supabase (queries in `supabase/migrations/20261009000001_website_recipes_and_proof.sql`), which shows `<VerifiedBadge>`. Creators can't set it, and changing the proof link clears it.
  - Website posts may have a public `liveUrl` ("Visit the live site").
- Prices are integers in cents. Format with `formatPrice` from `lib/format.ts`. The platform fee is 20% (`PLATFORM_FEE` in `lib/format.ts`).
- Next 16: `params` and `searchParams` are Promises. Read the guides in `node_modules/next/dist/docs/` before using unfamiliar APIs.
