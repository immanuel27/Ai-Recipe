"use client"

import * as React from "react"
import { toast } from "sonner"

import { CheckIcon, CopyIcon } from "@/components/icons"
import { cn } from "@/lib/utils"

/** Put text on the clipboard, with a fallback for browsers without the Clipboard API. */
async function writeClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    const area = document.createElement("textarea")
    area.value = text
    area.setAttribute("readonly", "")
    area.style.position = "fixed"
    area.style.opacity = "0"
    document.body.appendChild(area)
    area.select()
    const ok = document.execCommand("copy")
    area.remove()
    return ok
  }
}

/**
 * "Copy" pill for prompts: one tap copies the full text (even when it's shown
 * shortened) and the pill flips to "Copied" for a moment.
 */
export function CopyButton({
  text,
  label = "Prompt",
  className,
}: {
  text: string
  /** What's being copied, for the screen-reader label and the toast */
  label?: string
  className?: string
}) {
  const [copied, setCopied] = React.useState(false)

  React.useEffect(() => {
    if (!copied) return
    const t = window.setTimeout(() => setCopied(false), 2000)
    return () => window.clearTimeout(t)
  }, [copied])

  async function copy() {
    if (await writeClipboard(text)) {
      setCopied(true)
      toast.success(`${label} copied`)
    } else {
      toast.error("Couldn't copy. Select the text and copy it instead.")
    }
  }

  return (
    <button
      type="button"
      onClick={() => void copy()}
      aria-label={`Copy ${label.toLowerCase()}`}
      className={cn(
        "glass-button flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3 type-meta font-semibold outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className
      )}
    >
      {copied ? <CheckIcon aria-hidden className="size-4" /> : <CopyIcon aria-hidden className="size-4" />}
      {copied ? "Copied" : "Copy"}
      <span aria-live="polite" className="sr-only">
        {copied ? `${label} copied` : ""}
      </span>
    </button>
  )
}
