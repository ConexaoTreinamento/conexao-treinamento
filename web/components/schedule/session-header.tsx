"use client"

import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SessionHeaderProps {
  title: string
  dateLabel: string
  timeLabel: string
  onBack?: () => void
}

export function SessionHeader({ title, dateLabel, timeLabel, onBack }: SessionHeaderProps) {
  return (
    <div className="flex items-center gap-4">
      <Button
        variant="ghost"
        size="icon"
        onClick={onBack}
        aria-label="Voltar"
        title="Voltar"
      >
        <ArrowLeft className="h-4 w-4" />
      </Button>
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-xl font-bold">{title}</h1>
        <p className="text-sm text-muted-foreground">
          {dateLabel} • {timeLabel}
        </p>
      </div>
    </div>
  )
}
