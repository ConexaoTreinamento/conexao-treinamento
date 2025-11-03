"use client"

import { RotateCcw, Trash2, Calendar, CalendarCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import ConfirmDeleteButton from "@/components/base/confirm-delete-button"
import { EntityCard, type EntityCardMetadataItem } from "@/components/base/entity-card"
import { StatusBadge } from "@/components/base/status-badge"
import type { ReactNode } from "react"

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

  const badges: ReactNode[] = [
    <StatusBadge key="status" active={active} activeLabel="Ativo" inactiveLabel="Inativo" />,
  ]

  const metadata: EntityCardMetadataItem[] = [
    {
      icon: <Calendar className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />,
      content: `Até ${maxDays}x por semana`,
    },
  ]

  const infoRows: ReactNode[] = [
    <span key="duration" className="flex items-center gap-2">
      <CalendarCheck className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
      <span>{`${durationDays} dias de duração`}</span>
    </span>,
  ]

  const body = description ? (
    <p className="text-sm text-muted-foreground line-clamp-3">{description}</p>
  ) : (
    <p className="text-sm italic text-muted-foreground">Sem descrição</p>
  )

  const mobileActions = active ? (
    <ConfirmDeleteButton
      size="icon"
      className="h-8 w-8"
      title="Excluir Plano"
      description={`Tem certeza que deseja excluir o plano "${name}"? Ele será desativado e poderá ser restaurado.`}
      onConfirm={() => onDelete?.(id)}
      disabled={deleting}
    >
      <Trash2 className="h-3 w-3" aria-hidden="true" />
    </ConfirmDeleteButton>
  ) : (
    <Button
      size="icon"
      variant="outline"
      className="h-8 w-8"
      disabled={restoring}
      onClick={() => onRestore?.(id)}
      aria-label="Restaurar plano"
    >
      <RotateCcw className="h-3 w-3" aria-hidden="true" />
    </Button>
  )

  const desktopActions = active ? (
    <ConfirmDeleteButton
      size="sm"
      className="h-8"
      title="Excluir Plano"
      description={`Tem certeza que deseja excluir o plano "${name}"? Ele será desativado e poderá ser restaurado.`}
      onConfirm={() => onDelete?.(id)}
      disabled={deleting}
    >
      <Trash2 className="mr-1 h-3 w-3" aria-hidden="true" />
      Excluir
    </ConfirmDeleteButton>
  ) : (
    <Button
      size="sm"
      variant="outline"
      className="h-8"
      disabled={restoring}
      onClick={() => onRestore?.(id)}
    >
      <RotateCcw className="mr-1 h-3 w-3" aria-hidden="true" />
      Restaurar
    </Button>
  )

  return (
    <EntityCard
      title={name}
      badges={badges}
      metadata={metadata}
      metadataColumns={2}
      infoRows={infoRows}
      body={body}
      mobileActions={mobileActions}
      desktopActions={desktopActions}
      muted={!active}
    />
  )
}
