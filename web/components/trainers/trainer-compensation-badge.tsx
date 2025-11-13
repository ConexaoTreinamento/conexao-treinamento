import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export type TrainerCompensationType = "HOURLY" | "MONTHLY" | null | undefined

export const getTrainerCompensationLabel = (
  compensationType?: TrainerCompensationType
): string | null => {
  if (compensationType === "MONTHLY") {
    return "Mensalista"
  }

  if (compensationType === "HOURLY") {
    return "Horista"
  }

  return null
}

interface TrainerCompensationBadgeProps {
  compensationType?: TrainerCompensationType
  fallbackLabel?: string
  className?: string
}

export function TrainerCompensationBadge({
  compensationType,
  fallbackLabel,
  className,
}: TrainerCompensationBadgeProps) {
  const label = getTrainerCompensationLabel(compensationType)
  const displayLabel = label ?? fallbackLabel

  if (!displayLabel) {
    return null
  }

  return (
    <Badge
      variant={label ? "secondary" : "outline"}
      className={cn("text-xs font-medium", className)}
    >
      {displayLabel}
    </Badge>
  )
}
