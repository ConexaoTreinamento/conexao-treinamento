import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface StatusBadgeProps {
  active: boolean
  activeLabel?: string
  inactiveLabel?: string
  className?: string
}

export function StatusBadge({
  active,
  activeLabel = "Ativo",
  inactiveLabel = "Inativo",
  className,
}: StatusBadgeProps) {
  return (
    <Badge
      variant={active ? "default" : "outline"}
      className={cn(
        "text-xs",
        active ? "bg-green-600 hover:bg-green-700 text-white" : "text-muted-foreground",
        className,
      )}
    >
      {active ? activeLabel : inactiveLabel}
    </Badge>
  )
}
