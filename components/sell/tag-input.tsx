"use client"

import * as React from "react"
import { XIcon } from "lucide-react"

import { cn } from "@/lib/utils"

/** Chip input: Enter or comma adds a tag, Backspace on empty removes the last. */
export function TagInput({
  id,
  value,
  onChange,
  max = 10,
  placeholder,
  invalid,
  describedBy,
}: {
  id: string
  value: string[]
  onChange: (tags: string[]) => void
  max?: number
  placeholder?: string
  invalid?: boolean
  describedBy?: string
}) {
  const [draft, setDraft] = React.useState("")
  const inputRef = React.useRef<HTMLInputElement>(null)
  const full = value.length >= max

  function add(raw: string) {
    const tag = raw.trim().replace(/^#/, "").slice(0, 24)
    if (!tag || full) return
    if (!value.some((t) => t.toLowerCase() === tag.toLowerCase())) onChange([...value, tag])
    setDraft("")
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      add(draft)
    } else if (e.key === "Backspace" && !draft && value.length) {
      onChange(value.slice(0, -1))
    }
  }

  return (
    <div
      onClick={() => inputRef.current?.focus()}
      aria-invalid={invalid}
      className={cn(
        "flex min-h-11 w-full cursor-text flex-wrap items-center gap-2 rounded-lg border border-input bg-transparent px-2.5 py-2 transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50",
        invalid && "border-destructive ring-3 ring-destructive/20"
      )}
    >
      {value.map((tag) => (
        <span
          key={tag}
          className="flex items-center gap-1 rounded-md bg-primary/10 py-1 pr-1 pl-2.5 text-sm font-medium text-foreground"
        >
          {tag}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onChange(value.filter((t) => t !== tag))
            }}
            aria-label={`Remove tag ${tag}`}
            className="flex size-5 items-center justify-center rounded-sm text-muted-foreground outline-none hover:bg-primary/15 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
          >
            <XIcon className="size-3.5" aria-hidden />
          </button>
        </span>
      ))}
      <input
        ref={inputRef}
        id={id}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={onKeyDown}
        onBlur={() => add(draft)}
        disabled={full}
        placeholder={full ? `${max} tags max` : value.length ? "Add another…" : placeholder}
        aria-describedby={describedBy}
        className="min-w-28 flex-1 bg-transparent px-1 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed"
      />
    </div>
  )
}
