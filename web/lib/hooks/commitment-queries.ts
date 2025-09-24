import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/client"
import {
  getCommitmentsAtOptions,
  createCommitmentMutation,
  splitCommitmentMutation,
} from "@/lib/api-client/@tanstack/react-query.gen"
import { StudentCommitment, CommitmentRequestDto, SplitRequestDto } from "@/lib/api-client/types.gen"

/**
 * Minimal lightweight query result shape used when we need to return a placeholder
 * (keeps call sites simple when required params are missing).
 */
type MinimalQueryResult<T> = {
  data?: T
  isLoading: boolean
  isError: boolean
  error?: unknown
}

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
    const placeholder: MinimalQueryResult<Array<StudentCommitment>> = {
      data: undefined,
      isLoading: false,
      isError: false,
      error: undefined,
    }
    return placeholder
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
    onSuccess: (...args: unknown[]) => {
      // invalidate relevant caches if needed (caller should also refetch as appropriate)
      if (baseOptions.onSuccess) {
        // delegate to generated hook's onSuccess preserving typing
        // @ts-expect-error: pass-through dynamic args to generated callback
        baseOptions.onSuccess(...(args as any[]))
      }
    }
  })

  return {
    ...mutation,
    // mutate: (studentId, body)
    mutate: (studentId: string, body: CommitmentRequestDto, options?: Parameters<typeof mutation.mutate>[1]) =>
      mutation.mutate({ path: { studentId }, body }, options),
    mutateAsync: (studentId: string, body: CommitmentRequestDto, options?: Parameters<typeof mutation.mutateAsync>[1]) =>
      mutation.mutateAsync({ path: { studentId }, body }, options),
  }
}

export function useSplitCommitment() {
  const queryClient = useQueryClient()
  const baseOptions = splitCommitmentMutation({ client: apiClient })
  const mutation = useMutation({
    ...baseOptions,
    onSuccess: (...args: unknown[]) => {
      if (baseOptions.onSuccess) {
        // @ts-expect-error: pass-through
        baseOptions.onSuccess(...(args as any[]))
      }
    }
  })

  const { isPending, isError, isSuccess, error } = mutation

  return {
    ...mutation,
    // expose common status flags explicitly so call sites can read them without complex unions
    isPending,
    isError,
    isSuccess,
    error,
    // mutate: (commitmentId, body)
    mutate: (commitmentId: string, body: SplitRequestDto, options?: Parameters<typeof mutation.mutate>[1]) =>
      mutation.mutate({ path: { commitmentId }, body }, options),
    mutateAsync: (commitmentId: string, body: SplitRequestDto, options?: Parameters<typeof mutation.mutateAsync>[1]) =>
      mutation.mutateAsync({ path: { commitmentId }, body }, options),
  }
}
