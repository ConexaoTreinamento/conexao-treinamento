"use client"

import PlanCard from '@/components/plans/plan-card'
import { Card, CardContent } from '@/components/ui/card'
import type { PlanStatusValue, PlanWithId } from './plan-types'
import { PLAN_STATUS_EMPTY_MESSAGES } from './plan-types'

type PlanGridProps = {
  plans: PlanWithId[]
  statusFilter: PlanStatusValue
  isLoading: boolean
  error: unknown
  onDeletePlan: (planId: string) => void
  onRestorePlan: (planId: string) => void
  isDeleting: boolean
  isRestoring: boolean
}

const LOADING_PLACEHOLDERS = Array.from({ length: 3 })

export function PlanGrid(props: PlanGridProps) {
  const {
    plans,
    statusFilter,
    isLoading,
    error,
    onDeletePlan,
    onRestorePlan,
    isDeleting,
    isRestoring
  } = props

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-sm text-red-600">
          Erro ao carregar planos.
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-2">
        {LOADING_PLACEHOLDERS.map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardContent className="h-16" />
          </Card>
        ))}
      </div>
    )
  }

  if (plans.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-sm text-muted-foreground">
          {PLAN_STATUS_EMPTY_MESSAGES[statusFilter]}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
      {plans.map(({ id, name, maxDays, durationDays, active, description }) => (
        <PlanCard
          key={id}
          id={id}
          name={name ?? 'Plano sem nome'}
          maxDays={maxDays ?? 0}
          durationDays={durationDays ?? 0}
          active={Boolean(active)}
          description={description ?? null}
          onDelete={() => onDeletePlan(id)}
          onRestore={() => onRestorePlan(id)}
          deleting={isDeleting}
          restoring={isRestoring}
        />
      ))}
    </div>
  )
}
