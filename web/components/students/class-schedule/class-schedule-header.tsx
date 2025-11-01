"use client"

import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ClassScheduleHeaderProps {
  onBack: () => void
}

export function ClassScheduleHeader({ onBack }: ClassScheduleHeaderProps) {
  return (
    <div className="flex items-center gap-4">
      <Button variant="ghost" size="icon" onClick={onBack}>
        <ArrowLeft className="h-4 w-4" />
      </Button>
      <div>
        <h1 className="text-xl font-bold">Cronograma de Aulas</h1>
        <p className="text-sm text-muted-foreground">
          Selecione as séries que deseja frequentar
        </p>
      </div>
    </div>
  )
}
