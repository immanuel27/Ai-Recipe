import { Suspense } from "react"
import type { Metadata } from "next"

import { SignInCard } from "@/components/auth/sign-in-card"

export const metadata: Metadata = { title: "Sign in" }

export default function SignInPage() {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12 md:py-16">
      <Suspense>
        <SignInCard />
      </Suspense>
    </div>
  )
}
