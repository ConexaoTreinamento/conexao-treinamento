import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  testId?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
  testId,
}: EmptyStateProps) {
  return (
    <div
      data-testid={testId}
      className={cn(
        "flex min-h-[240px] flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-muted-foreground/20 bg-muted/10 p-8 text-center",
        className,
      )}
    >
      {icon ? <div className="text-muted-foreground">{icon}</div> : null}
      <div className="space-y-1">
        <h3 className="text-lg font-semibold">{title}</h3>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {action ? <div className="flex items-center gap-2">{action}</div> : null}
    </div>
  );
}
