import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface SectionProps {
  title?: string
  description?: string
  icon?: ReactNode
  actions?: ReactNode
  children: ReactNode
  className?: string
  headerClassName?: string
  contentClassName?: string
}

export function Section({
  title,
  description,
  icon,
  actions,
  children,
  className,
  headerClassName,
  contentClassName,
}: SectionProps) {
  return (
    <section className={cn("space-y-4", className)}>
      {(title || actions) && (
        <header className={cn("flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between", headerClassName)}>
          <div className="flex items-start gap-2">
            {icon}
            <div className="space-y-1">
              {title ? <h2 className="text-lg font-semibold leading-tight">{title}</h2> : null}
              {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
            </div>
          </div>
          {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
        </header>
      )}
      <div className={cn("space-y-4", contentClassName)}>{children}</div>
    </section>
  )
}
