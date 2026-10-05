import { cn } from "@/lib/utils"

/** Muted panel nested inside a card for grouped info. */
export function InsetPanel({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("rounded-lg bg-muted p-4", className)} {...props} />
}

/** Small uppercase tracked label over a large bold value. */
export function Stat({
  label,
  value,
  hint,
  size = "default",
  className,
}: {
  label: string
  value: React.ReactNode
  hint?: React.ReactNode
  size?: "default" | "lg"
  className?: string
}) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-1", className)}>
      <span className="label-caps">{label}</span>
      <span
        className={cn(
          "font-bold tracking-tight tabular-nums",
          size === "lg" ? "text-4xl" : "text-2xl"
        )}
      >
        {value}
      </span>
      {hint && <span className="text-sm text-muted-foreground">{hint}</span>}
    </div>
  )
}
