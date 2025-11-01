"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import Layout from "@/components/layout"
import { EvaluationLoading } from "@/components/students/evaluations/evaluation-loading"
import { EvaluationNotFound } from "@/components/students/evaluations/evaluation-not-found"
import { ClassScheduleHeader } from "@/components/students/class-schedule/class-schedule-header"
import { ClassSchedulePlanSummary } from "@/components/students/class-schedule/class-schedule-plan-summary"
import { ClassScheduleTrainerFilter } from "@/components/students/class-schedule/class-schedule-trainer-filter"
import { ClassScheduleDayCard } from "@/components/students/class-schedule/class-schedule-day-card"
import { ClassScheduleFooter } from "@/components/students/class-schedule/class-schedule-footer"
import { ClassScheduleParticipantsDialog } from "@/components/students/class-schedule/class-schedule-participants-dialog"
import { ClassScheduleHistoryDialog } from "@/components/students/class-schedule/class-schedule-history-dialog"
import { Card, CardContent } from "@/components/ui/card"
import { apiClient } from "@/lib/client"
import {
  bulkUpdateCommitmentsMutation,
  getAvailableSessionSeriesOptions,
  getCommitmentHistoryOptions,
  getCurrentActiveCommitmentsOptions,
  getCurrentActiveCommitmentsQueryKey,
  getCurrentStudentPlanOptions,
  getScheduleQueryKey,
  getSessionSeriesCommitmentsOptions,
  getStudentCommitmentsQueryKey,
  getTrainersForLookupOptions,
} from "@/lib/api-client/@tanstack/react-query.gen"
import type { CommitmentDetailResponseDto, TrainerSchedule } from "@/lib/api-client"
import type { TrainerLookupDto } from "@/lib/api-client/types.gen"
import type { NormalizedSeries } from "@/components/students/class-schedule/types"

const weekdayMap: Record<number, string> = {
  0: "Domingo",
  1: "Segunda-feira",
  2: "Terça-feira",
  3: "Quarta-feira",
  4: "Quinta-feira",
  5: "Sexta-feira",
  6: "Sábado",
}

const pad2 = (value: number) => (value < 10 ? `0${value}` : `${value}`)

const addMinutesHHmm = (time: string, minutes: number): string => {
  const [hours, mins] = time.split(":").map(Number)
  const total = hours * 60 + mins + minutes
  const normalized = ((total % (24 * 60)) + 24 * 60) % (24 * 60)
  const h2 = Math.floor(normalized / 60)
  const m2 = normalized % 60
  return `${pad2(h2)}:${pad2(m2)}`
}

const toHHmm = (value?: string): string => (value ?? "").slice(0, 5) || ""

const deriveEndTime = (start?: string, intervalDuration?: number) => {
  const base = toHHmm(start)
  if (!base) {
    return undefined
  }
  const duration = intervalDuration ?? 60
  return `${addMinutesHHmm(base, duration)}:00`
}

const hasTimeWindow = (
  series?: NormalizedSeries | null
): series is NormalizedSeries & { startTime: string; endTime: string } => {
  return Boolean(series?.startTime && series?.endTime)
}

type ParticipantFilter = "ALL" | "ATTENDING"

type WeekdayGroup = {
  weekday: number
  day: string
  classes: NormalizedSeries[]
}

const statusLabel = (status?: string) => {
  switch (status) {
    case "ATTENDING":
      return "Ativo"
    case "NOT_ATTENDING":
      return "Inativo"
    case "TENTATIVE":
      return "Talvez"
    default:
      return "—"
  }
}

export default function ClassSchedulePage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const studentId = params.id
  const queryClient = useQueryClient()

  const [selectedSeries, setSelectedSeries] = useState<string[]>([])
  const [initializedSelection, setInitializedSelection] = useState(false)
  const [openParticipantsFor, setOpenParticipantsFor] = useState<string | null>(null)
  const [openHistoryFor, setOpenHistoryFor] = useState<string | null>(null)
  const [participantsFilter, setParticipantsFilter] = useState<ParticipantFilter>("ALL")
  const [trainerFilter, setTrainerFilter] = useState<string>("all")

  const studentIdQueryOptions = useMemo(
    () => ({ path: { studentId }, client: apiClient }),
    [studentId]
  )

  const availableQuery = useQuery(getAvailableSessionSeriesOptions({ client: apiClient }))
  const planQuery = useQuery(getCurrentStudentPlanOptions(studentIdQueryOptions))
  const mutation = useMutation(bulkUpdateCommitmentsMutation({ client: apiClient }))
  const activeCommitmentsQuery = useQuery(getCurrentActiveCommitmentsOptions(studentIdQueryOptions))
  const trainersQuery = useQuery(getTrainersForLookupOptions({ client: apiClient }))

  const participantsQuery = useQuery({
    ...getSessionSeriesCommitmentsOptions({
      path: { sessionSeriesId: openParticipantsFor || "placeholder" },
      client: apiClient,
    }),
    enabled: Boolean(openParticipantsFor),
    queryKey: [
      {
        path: { sessionSeriesId: openParticipantsFor || "placeholder" },
        _id: `sessionSeriesCommitments-${openParticipantsFor || "none"}`,
      },
    ],
  })

  const historyQuery = useQuery({
    ...getCommitmentHistoryOptions({
      path: { studentId, sessionSeriesId: openHistoryFor || "placeholder" },
      client: apiClient,
    }),
    enabled: Boolean(openHistoryFor),
    queryKey: [
      {
        path: { studentId, sessionSeriesId: openHistoryFor || "placeholder" },
        _id: `commitmentHistory-${openHistoryFor || "none"}`,
      },
    ],
  })

  const participantsData: CommitmentDetailResponseDto[] = Array.isArray(participantsQuery.data)
    ? participantsQuery.data
    : []
  const historyData: CommitmentDetailResponseDto[] = Array.isArray(historyQuery.data)
    ? historyQuery.data
    : []

  const activeSeriesIds = useMemo(() => {
    const active = Array.isArray(activeCommitmentsQuery.data)
      ? activeCommitmentsQuery.data
      : []
    return new Set(
      active
        .filter((commitment) => commitment.commitmentStatus === "ATTENDING")
        .map((commitment) => commitment.sessionSeriesId)
        .filter((id): id is string => Boolean(id))
    )
  }, [activeCommitmentsQuery.data])

  const planDays = planQuery.data?.planMaxDays ?? 3

  useEffect(() => {
    if (!initializedSelection && activeCommitmentsQuery.data) {
      const attending = activeCommitmentsQuery.data
        .filter((commitment) => commitment.commitmentStatus === "ATTENDING")
        .map((commitment) => commitment.sessionSeriesId)
        .filter((id): id is string => Boolean(id))
      setSelectedSeries(attending)
      setInitializedSelection(true)
    }
  }, [activeCommitmentsQuery.data, initializedSelection])

  const trainerOptions = useMemo(
    () =>
      (trainersQuery.data ?? []).filter(
        (trainer): trainer is TrainerLookupDto & { id: string } => Boolean(trainer?.id)
      ),
    [trainersQuery.data]
  )

  const trainerNameById = useMemo(() => {
    const map = new Map<string, string>()
    for (const trainer of trainerOptions) {
      map.set(trainer.id, trainer.name ?? "Nome não informado")
    }
    return map
  }, [trainerOptions])

  useEffect(() => {
    if (
      trainerFilter !== "all" &&
      trainerOptions.length > 0 &&
      !trainerOptions.some((trainer) => trainer.id === trainerFilter)
    ) {
      setTrainerFilter("all")
    }
  }, [trainerFilter, trainerOptions])

  const normalizedSeries: NormalizedSeries[] = useMemo(() => {
    type LegacyTrainerSchedule = TrainerSchedule & { dayOfWeek?: number; name?: string }

    const synonym = {
      weekday: (schedule: LegacyTrainerSchedule) => schedule.weekday ?? schedule.dayOfWeek,
      seriesName: (schedule: LegacyTrainerSchedule) =>
        schedule.seriesName ?? schedule.name ?? "Série",
    }

    const pickString = <Key extends string>(source: unknown, key: Key): string | undefined => {
      if (typeof source !== "object" || source === null) {
        return undefined
      }
      const value = (source as Record<string, unknown>)[key]
      return typeof value === "string" ? value : undefined
    }

    const pickNumber = <Key extends string>(source: unknown, key: Key): number | undefined => {
      if (typeof source !== "object" || source === null) {
        return undefined
      }
      const value = (source as Record<string, unknown>)[key]
      return typeof value === "number" ? value : undefined
    }

    const raw = (availableQuery.data ?? []) as LegacyTrainerSchedule[]

    return raw
      .filter((schedule) => Boolean(schedule?.id) && Boolean(synonym.weekday(schedule)) && schedule.active)
      .map((schedule) => {
        const intervalDuration = pickNumber(schedule, "intervalDuration")
        const trainerId = pickString(schedule, "trainerId")
        const trainerName =
          pickString(schedule, "trainerName") ?? (trainerId ? trainerNameById.get(trainerId) : undefined)

        return {
          id: schedule.id!,
          weekday: synonym.weekday(schedule)!,
          startTime: schedule.startTime,
          endTime: deriveEndTime(schedule.startTime, intervalDuration),
          seriesName: synonym.seriesName(schedule),
          active: true,
          intervalDuration,
          capacity: pickNumber(schedule, "capacity"),
          enrolledCount: pickNumber(schedule, "enrolledCount"),
          trainerId,
          trainerName,
        }
      })
  }, [availableQuery.data, trainerNameById])

  const filteredSeries = useMemo(() => {
    if (trainerFilter === "all") {
      return normalizedSeries
    }
    return normalizedSeries.filter((series) => series.trainerId === trainerFilter)
  }, [normalizedSeries, trainerFilter])

  const weeklyByWeekday: WeekdayGroup[] = useMemo(() => {
    const grouped: Record<number, NormalizedSeries[]> = {}
    for (const series of filteredSeries) {
      if (!grouped[series.weekday]) {
        grouped[series.weekday] = []
      }
      grouped[series.weekday].push(series)
    }

    return Object.keys(grouped)
      .map(Number)
      .sort((a, b) => a - b)
      .map((weekday) => ({
        weekday,
        day: weekdayMap[weekday],
        classes: grouped[weekday].slice().sort((a, b) => (a.startTime || "").localeCompare(b.startTime || "")),
      }))
  }, [filteredSeries])

  const seriesById = useMemo(() => {
    const map = new Map<string, NormalizedSeries>()
    for (const series of normalizedSeries) {
      map.set(series.id, series)
    }
    return map
  }, [normalizedSeries])

  const selectedDays = useMemo(() => {
    const weekdays = new Set<number>()
    for (const seriesId of selectedSeries) {
      const series = seriesById.get(seriesId)
      if (series) {
        weekdays.add(series.weekday)
      }
    }
    return Array.from(weekdays).map((weekday) => weekdayMap[weekday])
  }, [selectedSeries, seriesById])

  const canSelectSeries = (seriesId: string) => {
    if (selectedSeries.includes(seriesId)) {
      return true
    }
    const series = seriesById.get(seriesId)
    if (!series) {
      return false
    }
    const sameDayAlreadySelected = selectedSeries.some((id) => seriesById.get(id)?.weekday === series.weekday)
    if (sameDayAlreadySelected) {
      return true
    }
    return selectedDays.length < planDays
  }

  useEffect(() => {
    const interval = setInterval(() => {
      if (openParticipantsFor) {
        void participantsQuery.refetch()
      }
      if (openHistoryFor) {
        void historyQuery.refetch()
      }
      void activeCommitmentsQuery.refetch()
    }, 15000)

    return () => {
      clearInterval(interval)
    }
  }, [openParticipantsFor, openHistoryFor, participantsQuery, historyQuery, activeCommitmentsQuery])

  const hasConflict = (series: NormalizedSeries) => {
    if (!hasTimeWindow(series)) {
      return false
    }
    return selectedSeries.some((id) => {
      if (id === series.id) {
        return false
      }
      const other = seriesById.get(id)
      if (!hasTimeWindow(other) || other.weekday !== series.weekday) {
        return false
      }
      return other.startTime < series.endTime && series.startTime < other.endTime
    })
  }

  const anyConflict = useMemo(() => {
    for (const id of selectedSeries) {
      const series = seriesById.get(id)
      if (!hasTimeWindow(series)) {
        continue
      }
      for (const otherId of selectedSeries) {
        if (otherId === id) {
          continue
        }
        const other = seriesById.get(otherId)
        if (!hasTimeWindow(other) || other.weekday !== series.weekday) {
          continue
        }
        if (other.startTime < series.endTime && series.startTime < other.endTime) {
          return true
        }
      }
    }
    return false
  }, [selectedSeries, seriesById])

  const toggleSeries = (seriesId: string) => {
    setInitializedSelection(true)
    setSelectedSeries((prev) => {
      if (prev.includes(seriesId)) {
        return prev.filter((id) => id !== seriesId)
      }
      if (!canSelectSeries(seriesId)) {
        return prev
      }
      return [...prev, seriesId]
    })
  }

  const invalidateScheduleWindows = async () => {
    const today = new Date()
    const monthStart = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1))
    const monthEnd = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() + 1, 0))
    const monthStartIso = monthStart.toISOString().slice(0, 10)
    const monthEndIso = monthEnd.toISOString().slice(0, 10)

    await queryClient.invalidateQueries({
      queryKey: getScheduleQueryKey({
        client: apiClient,
        query: { startDate: monthStartIso, endDate: monthEndIso },
      }),
    })

    const formatDate = (value: Date) =>
      `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`

    const recentEnd = formatDate(new Date())
    const recentStart = formatDate(
      new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7)
    )

    await queryClient.invalidateQueries({
      queryKey: getScheduleQueryKey({
        client: apiClient,
        query: { startDate: recentStart, endDate: recentEnd },
      }),
    })
  }

  const handleSave = async () => {
    const currentAttending = (activeCommitmentsQuery.data ?? [])
      .filter((commitment) => commitment.commitmentStatus === "ATTENDING")
      .map((commitment) => commitment.sessionSeriesId)
      .filter((id): id is string => Boolean(id))

    const toAttend = selectedSeries.filter((id) => !currentAttending.includes(id))
    const toRemove = currentAttending.filter((id) => !selectedSeries.includes(id))

    try {
      if (toRemove.length > 0) {
        await mutation.mutateAsync({
          path: { studentId },
          body: { sessionSeriesIds: toRemove, commitmentStatus: "NOT_ATTENDING" },
          client: apiClient,
        })
      }

      if (toAttend.length > 0) {
        await mutation.mutateAsync({
          path: { studentId },
          body: { sessionSeriesIds: toAttend, commitmentStatus: "ATTENDING" },
          client: apiClient,
        })
      }

      await queryClient.invalidateQueries({
        queryKey: getStudentCommitmentsQueryKey(studentIdQueryOptions),
      })
      await queryClient.invalidateQueries({
        queryKey: getCurrentActiveCommitmentsQueryKey(studentIdQueryOptions),
      })
      await invalidateScheduleWindows()

      router.back()
    } catch (error) {
      console.error("Erro ao salvar cronograma:", error)
    }
  }

  const getTrainerLabel = (series: NormalizedSeries) =>
    series.trainerName ?? (series.trainerId ? trainerNameById.get(series.trainerId) : undefined) ?? "Instrutor não definido"

  const lastUpdatedLabel = !activeCommitmentsQuery.isLoading && activeCommitmentsQuery.data
    ? new Date().toLocaleTimeString("pt-BR")
    : undefined

  const isInitialLoading =
    (availableQuery.isLoading && !availableQuery.data) ||
    (planQuery.isLoading && !planQuery.data) ||
    (trainersQuery.isLoading && !trainersQuery.data)

  if (isInitialLoading) {
    return (
      <Layout>
        <EvaluationLoading message="Carregando cronograma..." />
      </Layout>
    )
  }

  if (availableQuery.isError || planQuery.isError || trainersQuery.isError) {
    return (
      <Layout>
        <EvaluationNotFound message="Não foi possível carregar o cronograma de aulas." />
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-4">
        <ClassScheduleHeader onBack={() => router.back()} />

        <ClassSchedulePlanSummary
          planDays={planDays}
          selectedDaysCount={selectedDays.length}
          selectedSeriesCount={selectedSeries.length}
        />

        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-start">
          <ClassScheduleTrainerFilter
            trainers={trainerOptions}
            value={trainerFilter}
            onValueChange={setTrainerFilter}
            isLoading={trainersQuery.isLoading}
            isError={Boolean(trainersQuery.isError)}
          />
        </div>

        {availableQuery.isLoading && weeklyByWeekday.length === 0 ? (
          <EvaluationLoading message="Carregando séries disponíveis..." />
        ) : (
          <>
            {availableQuery.isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, index) => (
                  <Card key={index} className="animate-pulse">
                    <CardContent className="h-16" />
                  </Card>
                ))}
              </div>
            ) : null}

            {weeklyByWeekday.length === 0 && !availableQuery.isLoading ? (
              <EvaluationNotFound message="Nenhuma série disponível para este filtro." />
            ) : (
              weeklyByWeekday.map((day) => (
                <ClassScheduleDayCard
                  key={day.weekday}
                  dayLabel={day.day}
                  weekday={day.weekday}
                  classes={day.classes}
                  selectedSeries={selectedSeries}
                  activeSeriesIds={activeSeriesIds}
                  canSelectSeries={canSelectSeries}
                  toggleSeries={toggleSeries}
                  hasConflict={hasConflict}
                  getTrainerLabel={getTrainerLabel}
                  onOpenParticipants={setOpenParticipantsFor}
                  onOpenHistory={setOpenHistoryFor}
                />
              ))
            )}
          </>
        )}

        <ClassScheduleFooter
          selectedDaysCount={selectedDays.length}
          planDays={planDays}
          selectedSeriesCount={selectedSeries.length}
          activeSeriesCount={activeSeriesIds.size}
          lastUpdatedLabel={lastUpdatedLabel}
          isCommitmentsLoading={activeCommitmentsQuery.isLoading}
          isSaving={mutation.isPending}
          hasConflict={anyConflict}
          onCancel={() => router.back()}
          onSave={handleSave}
        />

        <ClassScheduleParticipantsDialog
          open={Boolean(openParticipantsFor)}
          onOpenChange={(open) => {
            if (!open) {
              setOpenParticipantsFor(null)
            }
          }}
          participants={participantsData}
          isLoading={participantsQuery.isLoading}
          filter={participantsFilter}
          onFilterChange={setParticipantsFilter}
          statusLabel={statusLabel}
        />

        <ClassScheduleHistoryDialog
          open={Boolean(openHistoryFor)}
          onOpenChange={(open) => {
            if (!open) {
              setOpenHistoryFor(null)
            }
          }}
          history={historyData}
          isLoading={historyQuery.isLoading}
          statusLabel={statusLabel}
        />
      </div>
    </Layout>
  )
}
