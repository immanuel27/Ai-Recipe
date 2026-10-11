import { Suspense } from "react"
import type { Metadata } from "next"

import { SignInCard } from "@/components/auth/sign-in-card"

export const metadata: Metadata = { title: "Sign in" }

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
    </div>
  )
}
