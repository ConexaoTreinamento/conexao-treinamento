import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/client"
import {
  getAllPlansOptions,
  getAllPlansQueryKey,
  createPlanMutation,
  deletePlanMutation,
  getCurrentStudentPlanOptions,
  assignPlanToStudentMutation,
  restorePlanMutation,
} from "@/lib/api-client/@tanstack/react-query.gen"
import {
  StudentPlanRequestDto,
  StudentPlanResponseDto,
  StudentPlanAssignmentResponseDto,
  AssignPlanRequestDto,
} from "@/lib/api-client/types.gen"

/**
 * Lightweight placeholder shape used when required params are missing.
 */
type MinimalQueryResult<T> = {
  data?: T
  isLoading: boolean
  isError: boolean
  error?: unknown
}

/**
 * Plans-related hooks wrapped around generated react-query helpers.
 *
 * These wrappers:
 * - keep call-sites simple (accept plain body / ids)
 * - preserve typing (avoid `any` in implementations)
 */

export function usePlans(includeInactive?: boolean) {
  return useQuery(
    getAllPlansOptions({ client: apiClient, query: { includeInactive: includeInactive ?? false } })
  )
}

export function useCreatePlan() {
  const queryClient = useQueryClient()
  const baseMutationOptions = createPlanMutation({ client: apiClient })
  const mutation = useMutation({
    ...baseMutationOptions,
    onSuccess: (...args: unknown[]) => {
      // invalidate all getAllPlans queries (both active and inactive variants)
      queryClient.invalidateQueries({ predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0]?._id === 'getAllPlans' })
      if (baseMutationOptions.onSuccess) {
        // @ts-expect-error: pass-through
        baseMutationOptions.onSuccess(...(args as any[]))
      }
    }
  })

  return {
    isPending: mutation.isPending,
    isError: mutation.isError,
    isSuccess: mutation.isSuccess,
    error: mutation.error,
    data: mutation.data,
    reset: mutation.reset,
    mutate: (body: StudentPlanRequestDto, options?: Parameters<typeof mutation.mutate>[1]) =>
      mutation.mutate({ body }, options),
    mutateAsync: (body: StudentPlanRequestDto, options?: Parameters<typeof mutation.mutateAsync>[1]) =>
      mutation.mutateAsync({ body }, options),
  }
}

export function useDeletePlan() {
  const queryClient = useQueryClient()
  const baseMutationOptions = deletePlanMutation({ client: apiClient })
  const mutation = useMutation({
    ...baseMutationOptions,
    onSuccess: (...args: unknown[]) => {
      // invalidate all getAllPlans queries
      queryClient.invalidateQueries({ predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0]?._id === 'getAllPlans' })
      if (baseMutationOptions.onSuccess) {
        // @ts-expect-error: pass-through
        baseMutationOptions.onSuccess(...(args as any[]))
      }
    }
  })

  return {
    ...mutation,
    mutate: (planId: string, options?: Parameters<typeof mutation.mutate>[1]) =>
      mutation.mutate({ path: { planId } }, options),
    mutateAsync: (planId: string, options?: Parameters<typeof mutation.mutateAsync>[1]) =>
      mutation.mutateAsync({ path: { planId } }, options),
  }
}

/**
 * Restore a soft-deleted plan.
 * Uses a direct fetch to the backend restore endpoint and invalidates the plans query on success.
 */
export function useRestorePlan() {
  const queryClient = useQueryClient()
  const baseMutationOptions = restorePlanMutation({ client: apiClient })
  const mutation = useMutation({
    ...baseMutationOptions,
    onSuccess: (...args: unknown[]) => {
      // invalidate all getAllPlans queries
      queryClient.invalidateQueries({ predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0]?._id === 'getAllPlans' })
      if (baseMutationOptions.onSuccess) {
        // @ts-expect-error: pass-through
        baseMutationOptions.onSuccess(...(args as any[]))
      }
    }
  })

  return {
    ...mutation,
    mutate: (planId: string, options?: Parameters<typeof mutation.mutate>[1]) =>
      mutation.mutate({ path: { planId } }, options),
    mutateAsync: (planId: string, options?: Parameters<typeof mutation.mutateAsync>[1]) =>
      mutation.mutateAsync({ path: { planId } }, options),
  }
}

export function useCurrentStudentPlan(studentId?: string) {
  if (!studentId) {
    const placeholder: MinimalQueryResult<StudentPlanAssignmentResponseDto> = {
      data: undefined,
      isLoading: false,
      isError: false,
      error: undefined,
    }
    return placeholder
  }

  return useQuery(getCurrentStudentPlanOptions({ client: apiClient, path: { studentId } }))
}

/**
 * Assign a plan to a student.
 * Usage: const assign = useAssignPlanToStudent(); assign.mutate(studentId, { planId, effectiveFromTimestamp })
 */
export function useAssignPlanToStudent() {
  const queryClient = useQueryClient()
  const baseMutationOptions = assignPlanToStudentMutation({ client: apiClient })
  const mutation = useMutation({
    ...baseMutationOptions,
    onSuccess: (data, variables) => {
      const studentId = variables.path.studentId
      // Invalidate all plans queries
      queryClient.invalidateQueries({ predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0]?._id === 'getAllPlans' })
      // Invalidate student-specific plan queries (current plan)
      queryClient.invalidateQueries({ predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0]?._id === 'getCurrentStudentPlan' && q.queryKey[0]?.path?.studentId === studentId })
      // Invalidate students list to refresh plan status
      queryClient.invalidateQueries({ predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0]?._id === 'findAll' })
      if (baseMutationOptions.onSuccess) {
        // @ts-expect-error
        baseMutationOptions.onSuccess(data, variables)
      }
    }
  })

  return {
    ...mutation,
    mutate: (studentId: string, body: AssignPlanRequestDto, options?: Parameters<typeof mutation.mutate>[1]) =>
      mutation.mutate({ path: { studentId }, body }, options),
    mutateAsync: (studentId: string, body: AssignPlanRequestDto, options?: Parameters<typeof mutation.mutateAsync>[1]) =>
      mutation.mutateAsync({ path: { studentId }, body }, options),
  }
}
