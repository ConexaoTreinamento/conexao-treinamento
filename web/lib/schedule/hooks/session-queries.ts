import type { PageResponseExerciseResponseDto, SessionResponseDto, TrainerResponseDto } from "@/lib/api-client"
import {
  findAllExercisesOptions,
  findAllTrainersOptions,
  getScheduleOptions,
  getSessionOptions,
} from "@/lib/api-client/@tanstack/react-query.gen"
import { apiClient } from "@/lib/client"

export const sessionQueryOptions = (
  { sessionId, trainerId }: { sessionId: string; trainerId?: string },
) =>
  getSessionOptions({
    client: apiClient,
    path: { sessionId },
    query: trainerId ? { trainerId } : undefined,
  })

export const scheduleByDateQueryOptions = (
  { startDate, endDate }: { startDate: string; endDate: string },
) =>
  getScheduleOptions({
    client: apiClient,
    query: { startDate, endDate },
  })

export const trainersLookupQueryOptions = () =>
  findAllTrainersOptions({ client: apiClient })

export const exercisesQueryOptions = () =>
  findAllExercisesOptions({
    client: apiClient,
    query: { pageable: { page: 0, size: 200 } } as any,
  })

export type SessionQueryOptions = ReturnType<typeof sessionQueryOptions>
export type SessionQueryKey = SessionQueryOptions["queryKey"]

export type ScheduleQueryOptions = ReturnType<typeof scheduleByDateQueryOptions>
export type ScheduleQueryKey = ScheduleQueryOptions["queryKey"]

export type TrainersQueryOptions = ReturnType<typeof trainersLookupQueryOptions>
export type TrainersQueryKey = TrainersQueryOptions["queryKey"]

export type ExercisesQueryOptions = ReturnType<typeof exercisesQueryOptions>
export type ExercisesQueryKey = ExercisesQueryOptions["queryKey"]

export type { SessionResponseDto, TrainerResponseDto, PageResponseExerciseResponseDto }
