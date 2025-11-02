"use client"

import {useCallback, useMemo, useState} from 'react'
import Layout from '@/components/layout'
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'
import {apiClient} from '@/lib/client'
import {getAllPlansOptions, getAllPlansQueryKey, createPlanMutation, deletePlanMutation, restorePlanMutation} from '@/lib/api-client/@tanstack/react-query.gen'
import {useToast} from '@/hooks/use-toast'
import type {StudentPlanResponseDto} from '@/lib/api-client'
import { PageHeader } from '@/components/base/page-header'
import { handleHttpError } from '@/lib/error-utils'
import { PlanStatusFilter } from '@/components/plans/plan-status-filter'
import { PlanCreateDialog, type PlanFormValues } from '@/components/plans/plan-create-dialog'
import { PlanGrid } from '@/components/plans/plan-grid'
import type { PlanStatusValue, PlanWithId } from '@/components/plans/plan-types'

const PLAN_STATUS_TO_INVALIDATE: PlanStatusValue[] = ['active', 'inactive', 'all']

const hasStatus = (value: unknown): value is { status?: number } =>
  typeof value === 'object' && value !== null && 'status' in value

const hasPlanId = (plan: StudentPlanResponseDto | undefined): plan is PlanWithId =>
  typeof plan?.id === 'string' && plan.id.length > 0

export default function PlansPage(){
  const qc = useQueryClient()
  const {toast} = useToast()

  const [statusFilter, setStatusFilter] = useState<PlanStatusValue>('all')
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  const invalidateAllStatusVariants = useCallback(
    () => Promise.all(
      PLAN_STATUS_TO_INVALIDATE.map((status) =>
        qc.invalidateQueries({ queryKey: getAllPlansQueryKey({ client: apiClient, query: { status } }) })
      )
    ),
    [qc]
  )

  const plansQueryOptions = useMemo(
    () => getAllPlansOptions({ client: apiClient, query: { status: statusFilter } }),
    [statusFilter]
  )

  const {data, isLoading, error} = useQuery(plansQueryOptions)

  const createPlan = useMutation({
    ...createPlanMutation({client: apiClient}),
    onSuccess: async () => {
      await invalidateAllStatusVariants()
      toast({title:'Plano criado', variant: 'success'})
    },
    onError: (err) => {
      if (hasStatus(err) && err.status === 409) {
        toast({
          title: 'Nome já utilizado',
          description: 'Já existe um plano com este nome. Escolha outro nome e tente novamente.',
          variant: 'destructive'
        })
      } else {
        handleHttpError(err, 'criar plano', 'Erro ao criar plano')
      }
    }
  })

  const deletePlan = useMutation({
    ...deletePlanMutation({client: apiClient}),
    onMutate: async (vars) => {
      await qc.cancelQueries({queryKey: plansQueryOptions.queryKey})
      const prev = qc.getQueryData<StudentPlanResponseDto[]>(plansQueryOptions.queryKey)
      if (prev) {
        const next = prev.map(plan => (plan?.id === vars.path.planId ? ({...plan, active: false}) : plan))
        qc.setQueryData(plansQueryOptions.queryKey, next)
      }
      return {prev}
    },
    onError: (_err, _vars, context) => {
      if (context?.prev) {
        qc.setQueryData(plansQueryOptions.queryKey, context.prev)
      }
      toast({title:'Erro ao excluir plano', variant:'destructive'})
    },
    onSuccess: () => toast({title:'Plano excluído'}),
    onSettled: async () => {
      await invalidateAllStatusVariants()
    }
  })

  const restorePlan = useMutation({
    ...restorePlanMutation({client: apiClient}),
    onMutate: async () => {
      await qc.cancelQueries({queryKey: plansQueryOptions.queryKey})
    },
    onSuccess: async () => {
      toast({title:'Plano restaurado'})
      await invalidateAllStatusVariants()
    },
    onError: (err) => handleHttpError(err, 'restaurar plano', 'Erro ao restaurar plano'),
    onSettled: async () => {
      await invalidateAllStatusVariants()
    }
  })

  const plans = useMemo(() => {
    const list = Array.isArray(data) ? data : []
    const withId = list.filter(hasPlanId)
    withId.sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''))
    return withId
  }, [data])

  const handleCreatePlan = useCallback(
    async (values: PlanFormValues) => {
      await createPlan.mutateAsync({
        body: {
          name: values.name,
          maxDays: values.maxDays,
          durationDays: values.durationDays
        },
        client: apiClient
      })
    },
    [createPlan]
  )

  const handleDeletePlan = useCallback(
    (planId: string) => {
      deletePlan.mutate({ path: { planId }, client: apiClient })
    },
    [deletePlan]
  )

  const handleRestorePlan = useCallback(
    (planId: string) => {
      restorePlan.mutate({ path: { planId }, client: apiClient })
    },
    [restorePlan]
  )

  return (
    <Layout>
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <PageHeader
            title="Planos"
            description="Gerencie os planos de assinatura"
          />
          <div className="flex items-center gap-2">
            <PlanStatusFilter
              value={statusFilter}
              onValueChange={setStatusFilter}
              open={isFilterOpen}
              onOpenChange={setIsFilterOpen}
            />
            <PlanCreateDialog
              onCreate={handleCreatePlan}
              isSubmitting={createPlan.isPending}
            />
          </div>
        </div>

        <PlanGrid
          plans={plans}
          statusFilter={statusFilter}
          isLoading={isLoading}
          error={error}
          onDeletePlan={handleDeletePlan}
          onRestorePlan={handleRestorePlan}
          isDeleting={deletePlan.isPending}
          isRestoring={restorePlan.isPending}
        />
      </div>
    </Layout>
  )
}
