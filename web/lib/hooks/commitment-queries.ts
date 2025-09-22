import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/client"
import { getCommitmentsAtOptions, createCommitmentMutation, splitCommitmentMutation } from "@/lib/api-client/@tanstack/react-query.gen"

/**
 * Hooks for commitments (series-level commitments / "this and following" split)
 *
 * - useCommitmentsForSeries(studentId, seriesId, opts?) => queries commitments at "now" or provided timestamp
 * - useCreateCommitment() => mutation wrapper for creating a commitment for a student
 * - useSplitCommitment() => mutation wrapper for splitting an existing commitment ("this and following")
 *
 * The generated helpers expect the full options object; these wrappers accept simpler args for convenience.
 */

export function useCommitmentsForSeries(studentId?: string, seriesId?: string, timestamp?: string) {
  if (!studentId || !seriesId) {
    return {
      data: undefined,
      isLoading: false,
      isError: false,
      error: undefined,
    } as any
  }

  return useQuery(getCommitmentsAtOptions({
    client: apiClient,
    path: { studentId, seriesId },
    query: timestamp ? { timestamp } : undefined
  }))
}

export function useCreateCommitment() {
  const queryClient = useQueryClient()
  const baseOptions = createCommitmentMutation({ client: apiClient })
  const mutation = useMutation({
    ...baseOptions,
    onSuccess: (...args: any[]) => {
      // invalidate relevant caches if needed (caller should also refetch as appropriate)
      if (baseOptions.onSuccess) {
        // @ts-ignore
        baseOptions.onSuccess(...args)
      }
    }
  })

  return {
    ...mutation,
    // mutate: (studentId, body)
    mutate: (studentId: string, body: any, options?: any) => mutation.mutate({ path: { studentId }, body }, options),
    mutateAsync: (studentId: string, body: any, options?: any) => mutation.mutateAsync({ path: { studentId }, body }, options),
  }
}

export function useSplitCommitment() {
  const queryClient = useQueryClient()
  const baseOptions = splitCommitmentMutation({ client: apiClient })
  const mutation = useMutation({
    ...baseOptions,
    onSuccess: (...args: any[]) => {
      if (baseOptions.onSuccess) {
        // @ts-ignore
        baseOptions.onSuccess(...args)
      }
    }
  })

  return {
    ...mutation,
    // mutate: (commitmentId, body)
    mutate: (commitmentId: string, body: any, options?: any) => mutation.mutate({ path: { commitmentId }, body }, options),
    mutateAsync: (commitmentId: string, body: any, options?: any) => mutation.mutateAsync({ path: { commitmentId }, body }, options),
  }
}
