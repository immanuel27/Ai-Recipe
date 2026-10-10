"use client"

import * as React from "react"
import Link from "next/link"

import { PromptsIcon, ReelsIcon, UploadIcon } from "@/components/icons"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useAppStore } from "@/components/providers/app-store"
import { LogoMark } from "@/components/shell/logo-mark"

const STEPS = [
  {
    icon: ReelsIcon,
    title: "Watch",
    text: "Scroll through AI-made videos, images and websites.",
  },
  {
    icon: PromptsIcon,
    title: "Get the recipe",
    text: "Unlock the exact prompts, tools, settings, and even the failed tries.",
  },
  {
    icon: UploadIcon,
    title: "Share yours",
    text: "Post your own video, image or website recipes and earn from them.",
  },
]

/** Shown once per browser, on the first visit to any page. */
export function WelcomeDialog() {
  const { hydrated, welcomed, dismissWelcome } = useAppStore()
  // Open a beat after load: lets the page finish hydrating first (the dialog
  // marks the rest of the page aria-hidden) and feels less abrupt
  const [settled, setSettled] = React.useState(false)
  React.useEffect(() => {
    const t = window.setTimeout(() => setSettled(true), 700)
    return () => window.clearTimeout(t)
  }, [])
  const open = settled && hydrated && !welcomed

  return (
    <Dialog open={open} onOpenChange={(o) => !o && dismissWelcome()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="items-center gap-3 text-center">
          <LogoMark className="size-14 rounded-2xl" />
          <DialogTitle className="text-2xl font-bold tracking-tight">Welcome to Ai Recipy</DialogTitle>
          <DialogDescription className="text-base text-balance">
            See something amazing made with AI? Here you can find out exactly how it was made.
          </DialogDescription>
        </DialogHeader>

        <ul className="flex flex-col gap-3">
          {STEPS.map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex items-start gap-3 rounded-lg bg-muted p-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-card text-primary ring-1 ring-foreground/10">
                <Icon className="size-4" aria-hidden />
              </span>
              <span className="flex flex-col">
                <span className="text-sm font-semibold">{title}</span>
                <span className="text-sm text-muted-foreground">{text}</span>
              </span>
            </li>
          ))}
        </ul>

        <p className="text-center text-sm text-muted-foreground">
          Have fun exploring, and enjoy the ride! ✨
        </p>

        <DialogFooter className="flex-col gap-3 sm:flex-col">
          <Button size="pill" className="w-full" onClick={dismissWelcome}>
            Start exploring
          </Button>
          <Button asChild variant="link" size="sm" className="font-semibold">
            <Link href="/sell" onClick={dismissWelcome}>
              Got a recipe to share? Post it here
            </Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
