import type { ReactNode } from "react"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface LoadingStateProps {
  message?: string
  icon?: ReactNode
  className?: string
  testId?: string
}

export function LoadingState({
  message = "Carregando...",
  icon,
  className,
  testId,
}: LoadingStateProps) {
  return (
    <div
      data-testid={testId}
      className={cn(
        "flex min-h-[200px] flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-muted p-6 text-center",
        className,
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        {icon ?? <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />}
      </div>
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  )
}
