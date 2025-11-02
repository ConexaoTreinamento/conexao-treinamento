import type { StudentPlanResponseDto } from '@/lib/api-client'

export type PlanStatusValue = 'all' | 'active' | 'inactive'

export type PlanWithId = StudentPlanResponseDto & { id: string }

export const PLAN_STATUS_EMPTY_MESSAGES: Record<PlanStatusValue, string> = {
  all: 'Nenhum plano cadastrado.',
  active: 'Nenhum plano ativo.',
  inactive: 'Nenhum plano inativo.'
}
