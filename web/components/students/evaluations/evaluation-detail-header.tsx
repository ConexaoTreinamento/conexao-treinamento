"use client"

import { Calendar } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { EditButton } from "@/components/base/edit-button"
import { PageHeader } from "@/components/base/page-header"

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

  const rightActions = (
    <>
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
    </>
  )

  return (
    <PageHeader title="Avaliação Física" description={studentName} onBack={onBack} rightActions={rightActions} />
  )
}
