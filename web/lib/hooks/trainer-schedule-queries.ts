"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/client"
import {
  getSeriesOptions,
  createSeriesMutation,
  updateScheduleMutation,
  findAllTrainersOptions,
} from "@/lib/api-client/@tanstack/react-query.gen"
import type { TrainerScheduleRequestDto, TrainerScheduleResponseDto, UpdateScheduleData } from "@/lib/api-client/types.gen"

// Fetch trainer schedules (series). Optional trainerId filter handled by options.query
export function useTrainerSeries(trainerId?: string) {
  return useQuery(getSeriesOptions({
    client: apiClient,
    query: trainerId ? { trainerId } : undefined
  }))
}

// Create a new trainer schedule series
export function useCreateTrainerSeries(trainerId?: string) {
  const qc = useQueryClient()
  const base = createSeriesMutation({ client: apiClient })
  const mutation = useMutation({
    ...base,
    onSuccess: (...args: unknown[]) => {
      // Invalidate the exact getSeries key used by useTrainerSeries
      qc.invalidateQueries({
        queryKey: getSeriesOptions({ client: apiClient, query: trainerId ? { trainerId } : undefined }).queryKey
      })
      // @ts-expect-error pass-through generated callback
      base.onSuccess?.(...(args as any[]))
    }
  })
  return {
    ...mutation,
    mutate: (body: TrainerScheduleRequestDto, options?: Parameters<typeof mutation.mutate>[1]) =>
      mutation.mutate({ body }, options),
    mutateAsync: (body: TrainerScheduleRequestDto, options?: Parameters<typeof mutation.mutateAsync>[1]) =>
      mutation.mutateAsync({ body }, options),
  }
}

// Update an existing series with temporal split (requires seriesId path and newEffectiveFrom query)
export function useUpdateTrainerSeries(trainerId?: string) {
  const qc = useQueryClient()
  const base = updateScheduleMutation({ client: apiClient })
  const mutation = useMutation({
    ...base,
    onSuccess: (...args: unknown[]) => {
      // Invalidate the exact getSeries key used by useTrainerSeries
      qc.invalidateQueries({
        queryKey: getSeriesOptions({ client: apiClient, query: trainerId ? { trainerId } : undefined }).queryKey
      })
      // @ts-expect-error pass-through
      base.onSuccess?.(...(args as any[]))
    }
  })
  return {
    ...mutation,
    mutate: (params: { seriesId: string; body: TrainerScheduleRequestDto; newEffectiveFrom: string }, options?: Parameters<typeof mutation.mutate>[1]) =>
      mutation.mutate({ path: { seriesId: params.seriesId }, body: params.body, query: { newEffectiveFrom: params.newEffectiveFrom } }, options),
    mutateAsync: (params: { seriesId: string; body: TrainerScheduleRequestDto; newEffectiveFrom: string }, options?: Parameters<typeof mutation.mutateAsync>[1]) =>
      mutation.mutateAsync({ path: { seriesId: params.seriesId }, body: params.body, query: { newEffectiveFrom: params.newEffectiveFrom } }, options),
  }
}

// List trainers via generated client
export function useTrainersList() {
  return useQuery(findAllTrainersOptions({ client: apiClient }))
}
