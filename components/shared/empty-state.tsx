import Link from "next/link"
import type { LucideIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type Action = { label: string; href: string } | { label: string; onClick: () => void }

/** Icon in a muted square, a title, one line, one pill button. */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: LucideIcon
  title: string
  description: string
  action?: Action
  className?: string
}) {
  return (
    <Card className={cn("mx-auto w-full max-w-sm", className)}>
      <CardContent className="flex flex-col items-start gap-4">
        <div className="flex size-12 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          <Icon className="size-5" aria-hidden />
        </div>
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold">{title}</h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </CardContent>
      {action && (
        <CardFooter>
          {"href" in action ? (
            <Button asChild size="pill" className="w-full">
              <Link href={action.href}>{action.label}</Link>
            </Button>
          ) : (
            <Button size="pill" className="w-full" onClick={action.onClick}>
              {action.label}
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  )
}
