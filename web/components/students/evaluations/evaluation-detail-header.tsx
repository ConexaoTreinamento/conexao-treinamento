"use client"

import { ArrowLeft, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { EditButton } from "@/components/base/edit-button"

interface EvaluationDetailHeaderProps {
  studentName: string
  evaluationDate?: string
  onBack: () => void
  onEdit?: () => void
}

const formatDate = (value?: string): string => {
  if (!value) {
    return ""
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return ""
  }

  return date.toLocaleDateString("pt-BR")
}

export function EvaluationDetailHeader({
  studentName,
  evaluationDate,
  onBack,
  onEdit,
}: EvaluationDetailHeaderProps) {
  const formattedDate = formatDate(evaluationDate)

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-xl font-bold">Avaliação Física</h1>
          <p className="text-sm text-muted-foreground">{studentName}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {formattedDate ? (
          <Badge variant="outline" className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {formattedDate}
          </Badge>
        ) : null}
        {onEdit ? (
          <EditButton
            size="sm"
            variant="outline"
            onClick={onEdit}
            fullWidthOnDesktop={false}
          />
        ) : null}
      </div>
    </div>
  )
}
