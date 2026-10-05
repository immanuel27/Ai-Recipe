import { ArrowLeftIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

/** Card header for multi-step flows: back button, step count, progress, title. */
export function StepHeader({
  step,
  total,
  title,
  description,
  onBack,
}: {
  step: number
  total: number
  title: string
  description?: string
  onBack?: () => void
}) {
  return (
    <CardHeader className="gap-4">
      <div className="flex items-center gap-3">
        {onBack ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="-ml-1 rounded-full"
            onClick={onBack}
            aria-label="Previous step"
          >
            <ArrowLeftIcon />
          </Button>
        ) : null}
        <span className="label-caps">
          Step {step} of {total}
        </span>
      </div>
      <Progress
        value={(step / total) * 100}
        aria-label={`Step ${step} of ${total}`}
        className="h-1.5"
      />
      <div className="flex flex-col gap-1">
        <CardTitle className="text-2xl font-bold tracking-tight">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </div>
    </CardHeader>
  )
}
