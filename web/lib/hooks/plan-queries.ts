import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/client"
import { StudentPlanResponseDto } from "@/lib/api-client/types.gen"
import { getAllPlansOptions, getAllPlansQueryKey, createPlanMutation, deletePlanMutation, getCurrentStudentPlanOptions, assignPlanToStudentMutation, getCurrentStudentPlanQueryKey } from "@/lib/api-client/@tanstack/react-query.gen"

/**
 * Use the generated @tanstack/react-query helpers.
 * - Queries use getAllPlansOptions({ client: apiClient })
 * - Mutations use createPlanMutation / deletePlanMutation with the same client
 *
 * The generated mutations expect an options object (e.g. { body } or { path }).
 * To keep the existing call-site simpler, we wrap mutate/mutateAsync to accept
 * plain payloads (body for create, planId for delete).
 */

export function usePlans() {
  return useQuery(getAllPlansOptions({ client: apiClient }))
}

export function useCreatePlan() {
  const queryClient = useQueryClient()
  const baseMutationOptions = createPlanMutation({ client: apiClient })
  const mutation = useMutation({
    ...baseMutationOptions,
    onSuccess: (...args: any[]) => {
      // invalidate generated query key
      queryClient.invalidateQueries({ queryKey: getAllPlansQueryKey({ client: apiClient }) })
      if (baseMutationOptions.onSuccess) {
        // call original onSuccess if present
        // @ts-ignore
        baseMutationOptions.onSuccess(...args)
      }
    }
  })

  return {
    ...mutation,
    mutate: (body: any, options?: any) => mutation.mutate({ body }, options),
    mutateAsync: (body: any, options?: any) => mutation.mutateAsync({ body }, options),
  }
}

export function useDeletePlan() {
  const queryClient = useQueryClient()
  const baseMutationOptions = deletePlanMutation({ client: apiClient })
  const mutation = useMutation({
    ...baseMutationOptions,
    onSuccess: (...args: any[]) => {
      queryClient.invalidateQueries({ queryKey: getAllPlansQueryKey({ client: apiClient }) })
      if (baseMutationOptions.onSuccess) {
        // @ts-ignore
        baseMutationOptions.onSuccess(...args)
      }
    }
  })

  return {
    ...mutation,
    mutate: (planId: string, options?: any) => mutation.mutate({ path: { planId } }, options),
    mutateAsync: (planId: string, options?: any) => mutation.mutateAsync({ path: { planId } }, options),
  }
}

export function useCurrentStudentPlan(studentId?: string) {
  // return a lightweight placeholder when no studentId is provided to keep call sites simple
  if (!studentId) {
    // match the returned shape from useQuery for easier consumption (consumer should handle undefined data)
    return {
      data: undefined,
      isLoading: false,
      isError: false,
      error: undefined,
    } as any
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
    onSuccess: (...args: any[]) => {
      // Invalidate the current student plan cache for the student specified in the mutation args
      // The generated mutation does not expose the path in onSuccess, so callers should also invalidate where appropriate.
      if (baseMutationOptions.onSuccess) {
        // @ts-ignore
        baseMutationOptions.onSuccess(...args)
      }
    }
  })

  return {
    ...mutation,
    // convenience wrapper: (studentId, body)
    mutate: (studentId: string, body: any, options?: any) => mutation.mutate({ path: { studentId }, body }, options),
    mutateAsync: (studentId: string, body: any, options?: any) => mutation.mutateAsync({ path: { studentId }, body }, options),
  }
}
