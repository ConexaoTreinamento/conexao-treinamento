import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import React from "react";

interface IPageHeaderProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  onBack?: () => void;
  rightActions?: React.ReactNode;
}

export function PageHeader({
  title,
  description,
  onBack,
  rightActions,
}: IPageHeaderProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3 sm:items-center">
        {onBack ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            aria-label="Voltar"
            title="Voltar"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        ) : null}

        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-bold">{title}</h1>
          {description ? (
            <p className="text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
      </div>

      {rightActions ? (
        <div className="flex flex-wrap gap-2 sm:justify-end">
          {rightActions}
        </div>
      ) : null}
    </div>
  );
}
