"use client"

import { User } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface BmiStatusInfo {
  label: string
  className: string
}

interface EvaluationSummaryCardProps {
  weight?: number | null
  height?: number | null
  bmi?: number | null
  bmiStatus?: BmiStatusInfo
}

const formatValue = (value?: number | null, unit?: string): string => {
  if (value === null || value === undefined) {
    return "-"
  }

  const formatted = Number(value).toLocaleString("pt-BR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })

  return unit ? `${formatted} ${unit}` : formatted
}

export function EvaluationSummaryCard({
  weight,
  height,
  bmi,
  bmiStatus,
}: EvaluationSummaryCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Dados Básicos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">{formatValue(weight, "kg")}</p>
            <p className="text-sm text-muted-foreground">Peso</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">{formatValue(height, "cm")}</p>
            <p className="text-sm text-muted-foreground">Altura</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">{formatValue(bmi)}</p>
            <p className="text-sm text-muted-foreground">IMC</p>
          </div>
          <div className="text-center">
            {bmiStatus ? (
              <Badge className={`${bmiStatus.className} text-white`}>{bmiStatus.label}</Badge>
            ) : (
              <Badge variant="outline">Sem classificação</Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
