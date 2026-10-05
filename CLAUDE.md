@AGENTS.md

# AI Recipe

A marketplace where creators sell step-by-step recipes for AI-made videos and images.

- A **listing** is the artifact itself: an autoplaying video or an image.
- Buyers purchase the **full recipe**: prompts, tool + version, settings/seeds, reference assets, the edit stack, and failed attempts with notes on why they failed.

## Stack

- Next.js 16 App Router, TypeScript, Tailwind CSS v4, shadcn/ui (Radix base, `radix-nova` style, lucide icons).
- Forms: react-hook-form + zod. Charts: shadcn `chart` (recharts). Toasts: sonner.
- Node 20.9+ is required. Commands: `npm run dev`, `npm run lint`, `npm run build`. (On the original dev machine Node lives in `~/.local/node/bin`, which isn't on the default PATH.)
- Mock media is placeholder only, and none of it is AI-generated.
  - Cartoon videos are short `clip` ranges of Blender Studio open movies (CC BY, streamed from Wikimedia Commons) plus Mixkit clips. Only use Mixkit items labelled "Free License"; "Restricted" ones are personal-use only.
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
- Posting (`/sell`) works like TikTok or Reels: step 1 is **Details**, with the cover and live preview on the left and the fields on the right; step 2 is **Recipe** (the contents) → Publish. Previous step shows after step 1, Save to draft on every step, and Publish on the last. Drafts are saved in the store (`draft`).
- Media can be any shape (`components/shared/fit-media.tsx`).
  - **Feed videos** fill an upright screen, like TikTok. On a sideways (landscape) screen they use `fitFor` and show whole.
  - **Feed images** use `FitImage`: they fill when close to the screen's shape, otherwise they show whole over a blurred backdrop.
  - **Listing page videos** show in their true shape (the frame takes the video's aspect ratio). They take over the screen when a phone is rotated sideways and have a fullscreen button.
  - Image posts hold up to 8 images (`Listing.images`) in `MediaCarousel`.
  - The `short:` variant targets sideways phones; use it to keep immersive layouts full-screen.
- The site footer (logo and tagline, Explore / Follow us / Legal columns) shows on every page except the full-screen feed.
- Empty states use `<EmptyState>`: an icon in a muted square, a title, one line of text, and one pill button.
- Dark mode: `next-themes` (`components/providers/theme-provider.tsx`) toggles the `.dark` class, with light, dark and system options. Users switch it in Profile → Settings → Appearance, or in the account menu under Theme. Every colour must come from a token with a `.dark` value.
- Every icon-only button has an `aria-label`. Every image has `alt`. Every video has a `poster`, and `preload="none"` when off-screen.
- Respect `prefers-reduced-motion`: no autoplay and no smooth scrolling when it's set (`usePrefersReducedMotion`).
- Mobile-first: check at 375px with no horizontal scroll.

## Conventions

- Server components by default; add `"use client"` only where needed (state, effects, browser APIs, event handlers).
- Shared types in `lib/types.ts`.
- Mock data in `lib/mock/`. Data access goes through `lib/data.ts` so it can be swapped for a real backend.
- Client-side mock state (session, purchases, saves, created listings, seller settings) lives in `components/providers/app-store.tsx` (`useAppStore()`, an external store over `localStorage`; no provider needed).
- Feature components in `components/<feature>/` (`feed`, `explore`, `listing`, `auth`, `sell`, `profile`, `dashboard` for the seller tools, `shell`). Cross-feature building blocks are in `components/shared/`. shadcn primitives are in `components/ui/`.
- **Profile** (`/profile`, formerly Dashboard; `/dashboard` redirects).
  - For everyone: Profile (header plus your posts), Library (purchased, saved and liked) and Settings.
  - Seller tools under a "Selling" label: Overview, Listings, Sales and Payouts.
  - Public creator profiles are at `/u/[username]` (`profileHref()` in `lib/profile.ts`), and creator names across the app link there.
- Prices are integers in cents. Format with `formatPrice` from `lib/format.ts`. The platform fee is 20% (`PLATFORM_FEE` in `lib/format.ts`).
- Next 16: `params` and `searchParams` are Promises. Read the guides in `node_modules/next/dist/docs/` before using unfamiliar APIs.
