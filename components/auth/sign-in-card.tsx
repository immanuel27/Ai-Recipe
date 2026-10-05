"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeftIcon, MailIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useAppStore } from "@/components/providers/app-store"
import type { SessionUser } from "@/lib/types"

type Step = "method" | "email" | "username"

const USERNAME_RE = /^[a-z0-9_.]{3,20}$/
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Only allow relative in-app redirects. */
function safeNext(next: string | null) {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/"
}

export function SignInCard() {
  const router = useRouter()
  const params = useSearchParams()
  const { signIn } = useAppStore()
  const signup = params.get("mode") === "signup"
  const [step, setStep] = React.useState<Step>("method")
  const [provider, setProvider] = React.useState<SessionUser["provider"]>("email")
  const [email, setEmail] = React.useState("")
  const [username, setUsername] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)

  function continueWithGoogle() {
    // Mock OAuth: pretend Google returned an address
    setProvider("google")
    setEmail("google.user@example.com")
    setStep("username")
  }

  function submitEmail(e: React.FormEvent) {
    e.preventDefault()
    if (!EMAIL_RE.test(email)) return setError("Enter a valid email address.")
    setError(null)
    setProvider("email")
    setUsername((u) => u || email.split("@")[0]!.toLowerCase().replace(/[^a-z0-9_.]/g, ""))
    setStep("username")
  }

  function submitUsername(e: React.FormEvent) {
    e.preventDefault()
    const u = username.trim().toLowerCase()
    if (!USERNAME_RE.test(u)) {
      return setError("3–20 characters: lowercase letters, numbers, dots or underscores.")
    }
    signIn({ username: u, email, provider, isSeller: false })
    toast.success(`Welcome, @${u}`)
    router.push(safeNext(params.get("next")))
  }

  function back() {
    setError(null)
    setStep(step === "username" && provider === "email" ? "email" : "method")
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="gap-2">
        {step !== "method" && (
          <Button
            variant="ghost"
            size="icon-sm"
            className="-ml-1 mb-2 rounded-full"
            onClick={back}
            aria-label="Back"
          >
            <ArrowLeftIcon />
          </Button>
        )}
        <CardTitle className="text-2xl font-bold tracking-tight">
          <h1>
            {step === "username"
              ? "Pick a username"
              : signup
                ? "Create your account"
                : "Sign in to AI Recipe"}
          </h1>
        </CardTitle>
        <CardDescription>
          {step === "username"
            ? "This is how buyers and creators will see you."
            : "Buy recipes, save favourites and start selling."}
        </CardDescription>
      </CardHeader>

      {step === "method" && (
        <CardFooter className="flex-col items-stretch gap-3">
          <Button size="pill" variant="outline" className="w-full" onClick={continueWithGoogle}>
            <GoogleGlyph />
            Continue with Google
          </Button>
          <Button size="pill" className="w-full" onClick={() => setStep("email")}>
            <MailIcon aria-hidden />
            Continue with email
          </Button>
          <p className="pt-1 text-center text-xs text-muted-foreground">
            Demo sign-in. Nothing leaves your browser.
          </p>
        </CardFooter>
      )}

      {step === "email" && (
        <form onSubmit={submitEmail} noValidate className="contents">
          <CardContent>
            <Field data-invalid={!!error}>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={!!error}
                className="h-11"
              />
              {error && <FieldError>{error}</FieldError>}
            </Field>
          </CardContent>
          <CardFooter>
            <Button type="submit" size="pill" className="w-full">
              Continue
            </Button>
          </CardFooter>
        </form>
      )}

      {step === "username" && (
        <form onSubmit={submitUsername} noValidate className="contents">
          <CardContent>
            <Field data-invalid={!!error}>
              <FieldLabel htmlFor="username">Username</FieldLabel>
              <div className="relative">
                <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground">
                  @
                </span>
                <Input
                  id="username"
                  autoComplete="username"
                  autoCapitalize="none"
                  autoFocus
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  aria-invalid={!!error}
                  className="h-11 pl-7"
                />
              </div>
              {error ? (
                <FieldError>{error}</FieldError>
              ) : (
                <FieldDescription>Signed in as {email}</FieldDescription>
              )}
            </Field>
          </CardContent>
          <CardFooter>
            <Button type="submit" size="pill" className="w-full">
              Continue
            </Button>
          </CardFooter>
        </form>
      )}
    </Card>
  )
}

/** Monochrome "G" mark so it follows the theme instead of hardcoded brand colours. */
function GoogleGlyph() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="size-4 fill-current">
      <path d="M21.35 11.1H12v2.98h5.35c-.23 1.4-1.6 4.1-5.35 4.1-3.22 0-5.85-2.67-5.85-5.96S8.78 6.26 12 6.26c1.83 0 3.06.78 3.76 1.45l2.57-2.47C16.68 3.7 14.55 2.75 12 2.75 6.89 2.75 2.75 6.89 2.75 12S6.89 21.25 12 21.25c5.34 0 8.88-3.75 8.88-9.04 0-.6-.07-1.06-.15-1.51z" />
    </svg>
  )
}
