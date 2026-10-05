"use client"

import { Share2Icon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { profileHref } from "@/lib/profile"

export function ShareProfileButton({ username, name }: { username: string; name: string }) {
  async function share() {
    const url = `${window.location.origin}${profileHref(username)}`
    try {
      if (navigator.share) {
        await navigator.share({ title: `${name} on AI Recipe`, url })
        return
      }
      await navigator.clipboard.writeText(url)
      toast.success("Profile link copied")
    } catch {
      // User dismissed the share sheet
    }
  }

  return (
    <Button size="pill" variant="outline" className="w-full" onClick={share}>
      <Share2Icon aria-hidden />
      Share profile
    </Button>
  )
}
