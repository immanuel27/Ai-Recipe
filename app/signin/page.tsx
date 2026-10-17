import { Suspense } from "react"
import type { Metadata } from "next"
import Link from "next/link"

import { SignInCard } from "@/components/auth/sign-in-card"
import { PromptsIcon, ReelsIcon, UploadIcon } from "@/components/icons"

export const metadata: Metadata = { title: "Sign in" }

// Also the public front page (for visitors and Google's reviewers): what Ai Recipy is
const ABOUT = [
  { icon: ReelsIcon, title: "Watch", text: "AI-made videos, images and websites from creators." },
  { icon: PromptsIcon, title: "Get the recipe", text: "The exact prompts, AI model, reference files and even the failed takes." },
  { icon: UploadIcon, title: "Share yours", text: "Post your own AI work with the recipe behind it." },
]

/** The front door: everyone signs up here before using the site (see proxy.ts). */
export default function SignInPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 px-4 py-12 md:py-16">
      <div className="flex max-w-xl flex-col items-center gap-3 text-center">
        {/* The card below holds the page h1 */}
        <p className="type-headline text-balance">Every masterpiece has a recipe.</p>
        <p className="type-read text-balance text-muted-foreground">
          Create your account and start making work worth envying.
        </p>
      </div>
      <Suspense>
        <SignInCard />
      </Suspense>
      <p className="max-w-sm text-center type-meta text-muted-foreground">
        By continuing, you agree to our{" "}
        <Link href="/terms" className="text-link underline underline-offset-2">
          Terms of Use
        </Link>{" "}
        and{" "}
        <Link href="/privacy" className="text-link underline underline-offset-2">
          Privacy Policy
        </Link>
        .
      </p>
      <section aria-labelledby="about-heading" className="flex w-full max-w-3xl flex-col gap-4">
        <h2 id="about-heading" className="text-center text-lg font-semibold tracking-tight">
          Ai Recipy is where you see how AI work is made
        </h2>
        <ul className="grid gap-3 sm:grid-cols-3">
          {ABOUT.map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex items-start gap-3 rounded-xl bg-card p-4 ring-1 ring-foreground/10">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-primary">
                <Icon className="size-4" aria-hidden />
              </span>
              <span className="flex flex-col">
                <span className="text-sm font-semibold">{title}</span>
                <span className="text-sm text-muted-foreground">{text}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
