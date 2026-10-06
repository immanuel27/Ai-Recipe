# AI Recipe

A marketplace where creators sell the **step-by-step recipes** behind AI-made videos and images. A listing is the artifact itself (an autoplaying video or an image). Buyers get the full recipe: prompts, tool and version, settings and seeds, reference assets, the edit stack, and failed attempts with notes on why they failed.

> **Status:** prototype backed by Supabase (accounts, listings, locked recipes, purchases, likes, saves, uploads). Checkout is still a demo: no real payment is taken. Without Supabase keys, the app falls back to in-browser demo data.

## Features

- **Feed (`/`):** a full-screen vertical feed like TikTok or Reels.
  - Snap scrolling, and only the visible video plays.
  - Swipeable photo carousels.
  - Double-tap to like (with a sound), save and share.
  - Keyboard: ↑ ↓ ← → and M.
  - Rotate a phone sideways to watch landscape.
- **Explore (`/explore`):** search, filters (All / Video / Image, tool, sort) and pagination, all driven by URL params.
- **Listing page (`/r/[slug]`):** the media in its true shape, a sticky purchase card, a locked "What's inside" preview, a failed-attempts gallery and a fake checkout.
- **Sell (`/sell`):** a two-step posting flow, Details then Recipe.
  - Upload up to 8 images or one video, with a live preview and tag chips.
  - Pricing that shows "You earn $X after the 20% fee".
  - Drafts.
- **Profile (`/profile`):** your profile and posts, a Library (purchased, saved, liked) and Settings with light, dark or system theme.
  - Seller tools: Overview (earnings chart), Listings, Sales, Payouts.
- **Public profiles (`/u/[username]`)** for every creator.
- **Installable:** includes a web app manifest and icons.

## Tech stack

- [Next.js 16](https://nextjs.org) (App Router, Turbopack), React 19, TypeScript
- [Tailwind CSS v4](https://tailwindcss.com) and [shadcn/ui](https://ui.shadcn.com) (Radix)
- react-hook-form and zod, Recharts, next-themes, sonner, lucide-react

## Getting started

Requires **Node.js 20.9 or newer**.

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.

Other scripts:

```bash
npm run build   # production build
npm run start   # serve the production build
npm run lint
```

### Supabase (database, auth, storage)

The app reads and writes a Supabase project when `.env.local` has its keys. Without them, it runs on the built-in demo data.

1. Copy `.env.example` to `.env.local` and fill in the project URL and **publishable** key (Supabase → Project Settings → API Keys).
2. For a new project, run `supabase/migrations/*.sql` in order, then `supabase/seed.sql`, in the SQL editor (or with `supabase db push` plus the seed).
3. In Supabase → **Authentication → URL Configuration**, set the Site URL and add `http://localhost:3000/auth/callback` (plus your production URL's `/auth/callback`) to Redirect URLs.
4. Optional: enable **Google** under Authentication → Providers, and set up custom SMTP so sign-in emails reach everyone.

### Deploying

The easiest host is [Vercel](https://vercel.com/new): import the GitHub repo and add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` as environment variables. Then add the deployed URL's `/auth/callback` to Supabase's Redirect URLs. Any Node host that runs `npm run build && npm run start` works too.

## Project structure

```
app/                 Routes (feed, explore, r/[slug], sell, profile/*, u/[username], credits…)
components/
  feed/ explore/ listing/ sell/ profile/ dashboard/ auth/ shell/   Feature components
  shared/            Cross-feature pieces (listing card, media fit, carousel, like button…)
  providers/         Client store (mock session, purchases, likes, drafts) and theme
  ui/                shadcn/ui primitives
lib/
  mock/              Mock creators, listings, sales
  data.ts            Data access over the mock data (swap for a real backend)
  types.ts           Shared types
public/              Posters, platform logos
```

`CLAUDE.md` documents the design language and the project conventions.

## Media and credits

All media in this demo is **placeholder content and isn't AI-generated**. The recipes attached to it are illustrative.

- Animated clips are short excerpts of [Blender Studio open movies](https://studio.blender.org/films/) (CC BY), streamed from Wikimedia Commons.
- Some clips use the [Mixkit Stock Video Free License](https://mixkit.co/license/).
- Other sources: test-videos.co.uk, MDN sample media, Lorem Picsum photos and DiceBear avatars.

The full attribution list is at **`/credits`** in the app. Third-party AI platform logos on the Explore page are trademarks of their owners. Replace all placeholder media with real creators' work before any public launch.
