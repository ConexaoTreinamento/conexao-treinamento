"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import ConfirmDeleteButton from "@/components/base/confirm-delete-button"
import { cn } from "@/lib/utils"
import { RotateCcw, Trash2 } from "lucide-react"
import React from "react"

export type PlanCardProps = {
  id: string
  name: string
  maxDays: number
  durationDays: number
  active: boolean
  description?: string | null
  deleting?: boolean
  restoring?: boolean
  onDelete?: (id: string) => void
  onRestore?: (id: string) => void
}

export default function PlanCard(props: PlanCardProps){
  const { id, name, maxDays, durationDays, active, description, deleting, restoring, onDelete, onRestore } = props

  return (
    <Card
      className={cn(
        "group relative transition-shadow hover:shadow-md",
        active ? "border border-border" : "border border-dashed bg-muted/60"
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-base font-semibold leading-tight truncate" title={name}>
            {name}
          </CardTitle>
          <Badge
            variant={active ? "outline" : "secondary"}
            className={cn("text-[11px] tracking-wide", active ? "border-green-500 text-green-600" : "bg-muted text-muted-foreground")}
          >
            {active ? "Ativo" : "Inativo"}
          </Badge>
        </div>
        <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
          <Badge variant="outline" className="border-transparent bg-muted/60">
            Até {maxDays}x por semana
          </Badge>
          <Badge variant="outline" className="border-transparent bg-muted/60">
            {durationDays} dias
          </Badge>
        </div>
        {description && (
          <p className="mt-2 line-clamp-3 text-xs text-muted-foreground">
            {description}
          </p>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-wrap items-center gap-2">
          {active ? (
            <ConfirmDeleteButton
              size="sm"
              variant="outline"
              className="h-8 gap-1 px-2"
              title="Excluir Plano"
              description={`Tem certeza que deseja excluir o plano "${name}"? Ele será desativado e poderá ser restaurado.`}
              onConfirm={() => onDelete?.(id)}
              disabled={deleting}
            >
              <Trash2 className="h-3 w-3" />
              Excluir
            </ConfirmDeleteButton>
          ) : (
            <Button
              size="sm"
              variant="outline"
              className="h-8 gap-1 px-3"
              disabled={restoring}
              onClick={() => onRestore?.(id)}
            >
              <RotateCcw className="h-3 w-3" />
              Restaurar
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
