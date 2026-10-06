import { ImageOffIcon, LockIcon } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MediaImage } from "@/components/shared/media-image"
import type { RecipeFailure } from "@/lib/types"
import { cn } from "@/lib/utils"

export function FailuresGallery({
  failures,
  unlocked,
}: {
  failures: RecipeFailure[]
  unlocked: boolean
}) {
  return (
    <Card id="failed-takes" className="scroll-mt-6">
      <CardHeader>
        <CardTitle className="text-lg">Failed attempts</CardTitle>
        <CardDescription>What didn&apos;t work, and why.</CardDescription>
      </CardHeader>
      <CardContent>
        {failures.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            The creator didn&apos;t document any failed attempts for this recipe.
          </p>
        ) : (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {failures.map((f, i) => {
              const locked = !unlocked && i > 0
              return (
                <li key={i} className="flex flex-col gap-2">
                  <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
                    {f.imageUrl ? (
                      <MediaImage
                        src={f.imageUrl}
                        alt={locked ? "Locked failed attempt" : `Failed attempt ${i + 1}`}
                        fill
                        sizes="(min-width: 640px) 200px, 50vw"
                        className={cn("object-cover", locked && "scale-110 blur-lg")}
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center text-muted-foreground">
                        <ImageOffIcon className="size-6" aria-hidden />
                      </div>
                    )}
                    {locked && (
                      <div className="absolute inset-0 flex items-center justify-center bg-scrim/30">
                        <span className="flex size-10 items-center justify-center rounded-full bg-card text-foreground">
                          <LockIcon className="size-4" aria-hidden />
                        </span>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {locked ? "Unlock to see why this failed." : f.note}
                  </p>
                </li>
              )
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
