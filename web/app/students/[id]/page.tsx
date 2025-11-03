"use client"

import { useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import Layout from "@/components/layout"
import { useToast } from "@/hooks/use-toast"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  assignPlanToStudentMutation,
  getAllPlansOptions,
  getAllSchedulesOptions,
  getCurrentStudentPlanOptions,
  getCurrentStudentPlanQueryKey,
  findAllTrainersOptions,
  getScheduleOptions,
  getStudentCommitmentsOptions,
  getStudentCommitmentsQueryKey,
  getStudentPlanHistoryOptions,
  getStudentPlanHistoryQueryKey,
} from "@/lib/api-client/@tanstack/react-query.gen"
import type {
  ListTrainersDto,
  ScheduleResponseDto,
  StudentCommitmentResponseDto,
  StudentPlanAssignmentResponseDto,
  TrainerScheduleResponseDto,
} from "@/lib/api-client/types.gen"
import { apiClient } from "@/lib/client"
import { useStudent } from "@/lib/students/hooks/student-queries"
import { useDeleteStudent, useRestoreStudent } from "@/lib/students/hooks/student-mutations"
import { useEvaluations } from "@/lib/evaluations/hooks/evaluation-queries"
import {
  getAssignmentDaysRemaining,
  getAssignmentDurationDays,
  getAssignmentEndDate,
} from "@/components/plans/expiring-plans"
import { hasInsomniaTypes, impairmentTypes } from "@/lib/students/student-types"
import { handleHttpError } from "@/lib/error-utils"
import { StudentProfileSummaryCard } from "@/components/students/profile/profile-summary-card"
import {
  CommitmentSummary,
  RecentClassEntry,
  StudentOverviewTab,
} from "@/components/students/profile/overview-tab"
import {
  PlanHistoryEntryView,
  StudentPlanHistoryTab,
} from "@/components/students/profile/plan-history-tab"
import { StudentEvaluationsTab } from "@/components/students/profile/evaluations-tab"
import { ExerciseRecord, StudentExercisesTab } from "@/components/students/profile/exercises-tab"
import { StudentDetailsTab } from "@/components/students/profile/details-tab"
import { PlanAssignmentDialog } from "@/components/students/profile/plan-assignment-dialog"

const ensureStudentId = (rawId: unknown): string => {
  if (typeof rawId === "string") {
    return rawId
  }
  if (Array.isArray(rawId) && rawId.length > 0 && typeof rawId[0] === "string") {
    return rawId[0]
  }
  return ""
}

const formatLocalDate = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

const normalizeCommitmentStatus = (
  status: StudentCommitmentResponseDto["commitmentStatus"]
): CommitmentSummary["status"] => {
  if (status === "ATTENDING" || status === "NOT_ATTENDING" || status === "TENTATIVE") {
    return status
  }
  return "TENTATIVE"
}

const formatCommitmentTimeRange = (startRaw: unknown, endRaw: unknown): string | undefined => {
  const normalize = (value: unknown): string | undefined => {
    if (typeof value !== "string" || value.trim().length === 0) {
      return undefined
    }

    // Expecting HH:mm or HH:mm:ss; fallback to trimmed value
    const time = value.trim()
    if (/^\d{2}:\d{2}(:\d{2})?$/.test(time)) {
      return time.slice(0, 5)
    }

    return time
  }

  const start = normalize(startRaw)
  const end = normalize(endRaw)

  if (start && end) {
    return `${start} - ${end}`
  }
  if (start) {
    return start
  }
  if (end) {
    return end
  }
  return undefined
}

const parseTimeToMinutes = (value: unknown): number | undefined => {
  if (typeof value !== "string") {
    return undefined
  }

  const trimmed = value.trim()
  const match = trimmed.match(/^(\d{2}):(\d{2})(?::(\d{2}))?$/)
  if (!match) {
    return undefined
  }

  const hours = Number(match[1])
  const minutes = Number(match[2])
  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return undefined
  }

  return hours * 60 + minutes
}

const formatMinutesToTime = (totalMinutes: number): string => {
  const minutesPerDay = 24 * 60
  const normalized = ((totalMinutes % minutesPerDay) + minutesPerDay) % minutesPerDay
  const hours = Math.floor(normalized / 60)
  const minutes = normalized % 60
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`
}

const getScheduleTimeLabel = (schedule?: TrainerScheduleResponseDto): string | undefined => {
  if (!schedule?.startTime) {
    return undefined
  }

  const startMinutes = parseTimeToMinutes(schedule.startTime)
  if (typeof startMinutes !== "number") {
    return undefined
  }

  const startLabel = formatMinutesToTime(startMinutes)
  const duration = typeof schedule.intervalDuration === "number" ? schedule.intervalDuration : undefined

  if (duration && duration > 0) {
    const endLabel = formatMinutesToTime(startMinutes + duration)
    return `${startLabel} - ${endLabel}`
  }

  return startLabel
}

const toCommitmentSummaries = (
  commitments?: StudentCommitmentResponseDto[],
  scheduleLookup?: Map<string, TrainerScheduleResponseDto>,
  trainerLookup?: Map<string, string>,
): CommitmentSummary[] => {
  if (!commitments) {
    return []
  }

  return commitments.map((commitment, index) => {
    const record = commitment as Record<string, unknown>
    const rawId = record.id ?? `commitment-${index}`
    const rawSeriesName = record.seriesName ?? record.sessionSeriesName ?? record.name ?? "Série"
    const start = record.seriesStartTime ?? record.startTime ?? record.beginTime ?? record.start
    const end = record.seriesEndTime ?? record.endTime ?? record.finishTime ?? record.end
    const instructor = record.trainerName ?? record.instructorName ?? record.seriesTrainer ?? record.instructor
    const sessionSeriesRecord = typeof record.sessionSeries === "object" && record.sessionSeries !== null
      ? (record.sessionSeries as Record<string, unknown>)
      : undefined
    const seriesRecord = typeof record.series === "object" && record.series !== null
      ? (record.series as Record<string, unknown>)
      : undefined

    const sessionSeriesIdRaw = record.sessionSeriesId
      ?? record.seriesId
      ?? sessionSeriesRecord?.id
      ?? seriesRecord?.id

    const sessionSeriesId = sessionSeriesIdRaw ? String(sessionSeriesIdRaw) : undefined
    const schedule = sessionSeriesId ? scheduleLookup?.get(sessionSeriesId) : undefined
    const scheduleTimeLabel = getScheduleTimeLabel(schedule)
    const fallbackTimeLabel = formatCommitmentTimeRange(start, end)
    const timeLabel = scheduleTimeLabel ?? fallbackTimeLabel

    const scheduleTrainerName = schedule?.trainerId ? trainerLookup?.get(String(schedule.trainerId)) : undefined
    const fallbackTrainer = typeof instructor === "string" && instructor.trim().length > 0 ? instructor.trim() : undefined
    const trainerName = scheduleTrainerName ?? fallbackTrainer

    return {
      id: String(rawId),
      seriesName: String(schedule?.seriesName ?? rawSeriesName ?? "Série"),
      status: normalizeCommitmentStatus(commitment.commitmentStatus),
      timeLabel,
      trainerName,
    }
  })
}

const toRecentClassEntries = (
  schedule: ScheduleResponseDto | undefined,
  studentId: string
): RecentClassEntry[] => {
  const sessions = schedule?.sessions ?? []

  const enriched: Array<RecentClassEntry & { sortTimestamp: number }> = sessions
    .filter((session) => session.students?.some((attendee) => attendee.studentId === studentId))
    .map((session, index) => {
      const participant = session.students?.find((attendee) => attendee.studentId === studentId)
      const wasPresent = Boolean(participant?.present ?? (participant?.commitmentStatus === "ATTENDING"))
      const start = session.startTime ? new Date(session.startTime) : undefined
      const sortTimestamp = start?.getTime() ?? 0

      return {
        id: String(session.sessionId ?? `${session.seriesName ?? "session"}-${session.startTime ?? index}`),
        title: session.seriesName ?? "Aula",
        trainerName: session.trainerName ?? "Instrutor",
        dateLabel: start ? start.toLocaleDateString("pt-BR") : "—",
        status: wasPresent ? "Presente" : "Ausente",
        sortTimestamp,
      }
    })

  return enriched
    .sort((a, b) => b.sortTimestamp - a.sortTimestamp)
    .map((entry) => ({
      id: entry.id,
      title: entry.title,
      trainerName: entry.trainerName,
      dateLabel: entry.dateLabel,
      status: entry.status,
    }))
}

const toExerciseRecords = (
  schedule: ScheduleResponseDto | undefined,
  studentId: string
): ExerciseRecord[] => {
  const sessions = schedule?.sessions ?? []

  const records: Array<(ExerciseRecord & { timeValue: number }) | null> = sessions
    .map((session, index) => {
      const participant = session.students?.find((attendee) => attendee.studentId === studentId)
      const exercises = participant?.participantExercises ?? []

      if (exercises.length === 0) {
        return null
      }

      const classDate = session.startTime ? new Date(session.startTime) : undefined

      return {
        key: String(session.sessionId ?? `${session.seriesName ?? "session"}-${index}`),
        className: session.seriesName ?? "Aula",
        instructor: session.trainerName ?? "Instrutor",
        classDateLabel: classDate ? classDate.toLocaleDateString("pt-BR") : "—",
        timeValue: classDate?.getTime() ?? 0,
        exercises: exercises
          .slice()
          .sort((a, b) => (a.exerciseName ?? "").localeCompare(b.exerciseName ?? ""))
          .map((exercise, exerciseIndex) => {
            const setsPart = exercise.setsCompleted != null ? `${exercise.setsCompleted}x` : ""
            const repsPart = exercise.repsCompleted != null ? String(exercise.repsCompleted) : ""
            let detail = `${setsPart}${repsPart}`.trim()

            if (exercise.weightCompleted != null) {
              detail += `${detail ? " " : ""}• ${exercise.weightCompleted}kg`
            }
            if (exercise.exerciseNotes) {
              detail += `${detail ? " " : ""}• ${exercise.exerciseNotes}`
            }

            return {
              id: String(exercise.id ?? `${session.sessionId ?? "session"}-${exercise.exerciseId ?? exerciseIndex}`),
              name: exercise.exerciseName ?? exercise.exerciseId ?? "Exercício",
              detail,
            }
          }),
      }
    })
    .filter((record): record is ExerciseRecord & { timeValue: number } => Boolean(record))

  const nonEmptyRecords = records.filter(
    (record): record is ExerciseRecord & { timeValue: number } => Boolean(record)
  )

  return nonEmptyRecords
    .sort((a, b) => b.timeValue - a.timeValue)
    .map((record) => ({
      key: record.key,
      className: record.className,
      instructor: record.instructor,
      classDateLabel: record.classDateLabel,
      exercises: record.exercises,
    }))
}

const formatDateLabel = (value?: string | null) => (value ? new Date(value).toLocaleDateString("pt-BR") : "N/A")

const toPlanHistoryViews = (
  history?: StudentPlanAssignmentResponseDto[]
): PlanHistoryEntryView[] => {
  if (!history) {
    return []
  }

  return history.map((entry, index) => {
    const id = entry.id ?? `plan-history-${index}`
    const derivedEndDate = getAssignmentEndDate(entry) ?? null
    const derivedDuration = getAssignmentDurationDays(entry) ?? entry.planMaxDays ?? entry.planDurationDays ?? null
    const derivedDaysRemaining = getAssignmentDaysRemaining(entry)

    const daysRemainingLabel = typeof derivedDaysRemaining === "number"
      ? `${Math.max(derivedDaysRemaining, 0)}`
      : entry.daysRemaining != null
        ? String(entry.daysRemaining)
        : "N/A"

    return {
      id: String(id),
      planName: entry.planName ?? "Plano",
      isActive: Boolean(entry.active),
      isExpiringSoon: Boolean(entry.expiringSoon),
      isExpired: Boolean(entry.expired),
      startDateLabel: formatDateLabel(entry.startDate),
      endDateLabel: formatDateLabel(derivedEndDate ?? undefined),
      durationLabel: derivedDuration != null ? `${derivedDuration} dias` : "N/A",
      daysRemainingLabel,
      createdAtLabel: formatDateLabel(entry.createdAt),
    }
  })
}

const getLastRenewalLabel = (history?: StudentPlanAssignmentResponseDto[]): string | undefined => {
  if (!history || history.length === 0) {
    return undefined
  }

  const sorted = history
    .filter((entry) => Boolean(entry.startDate))
    .slice()
    .sort((a, b) => new Date(b.startDate ?? 0).getTime() - new Date(a.startDate ?? 0).getTime())

  const latest = sorted[0]
  if (!latest?.startDate) {
    return undefined
  }

  return new Date(latest.startDate).toLocaleDateString("pt-BR")
}

export default function StudentProfilePage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const studentId = ensureStudentId(params.id)
  const hasStudentId = studentId.length > 0

  const currentPlanOptions = useMemo(
    () => ({ path: { studentId }, client: apiClient }),
    [studentId]
  )

  const { data: studentData, isLoading, error } = useStudent(
    { path: { id: studentId } },
    { enabled: hasStudentId }
  )

  const currentPlanQuery = useQuery({
    ...getCurrentStudentPlanOptions(currentPlanOptions),
    enabled: hasStudentId,
  })
  const planHistoryQuery = useQuery({
    ...getStudentPlanHistoryOptions(currentPlanOptions),
    enabled: hasStudentId,
  })
  const commitmentsQuery = useQuery({
    ...getStudentCommitmentsOptions(currentPlanOptions),
    enabled: hasStudentId,
  })
  const allPlansQuery = useQuery({
    ...getAllPlansOptions({ client: apiClient }),
  })
  const trainerSchedulesQuery = useQuery({
    ...getAllSchedulesOptions({ client: apiClient }),
    enabled: hasStudentId,
  })
  const trainersQuery = useQuery({
    ...findAllTrainersOptions({ client: apiClient }),
    enabled: hasStudentId,
  })

  const now = useMemo(() => new Date(), [])
  const endDateIso = formatLocalDate(now)
  const startDateIso = formatLocalDate(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7))
  const recentScheduleQuery = useQuery({
    ...getScheduleOptions({ client: apiClient, query: { startDate: startDateIso, endDate: endDateIso } }),
    enabled: hasStudentId,
  })

  const startExercisesIso = formatLocalDate(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30))
  const exercisesScheduleQuery = useQuery({
    ...getScheduleOptions({ client: apiClient, query: { startDate: startExercisesIso, endDate: endDateIso } }),
    enabled: hasStudentId,
  })

  const { data: evaluations, isLoading: isLoadingEvaluations } = useEvaluations(studentId, {
    enabled: hasStudentId,
  })

  const assignPlanMutation = useMutation(assignPlanToStudentMutation({ client: apiClient }))
  const { mutateAsync: deleteStudent, isPending: isDeleting } = useDeleteStudent()
  const { mutateAsync: restoreStudent, isPending: isRestoring } = useRestoreStudent()

  const [isPlanDialogOpen, setIsPlanDialogOpen] = useState(false)
  const [assignPlanId, setAssignPlanId] = useState("")
  const [assignStartDate, setAssignStartDate] = useState(() => formatLocalDate(new Date()))
  const [assignNotes, setAssignNotes] = useState("")

  const commitmentsData = commitmentsQuery.data as StudentCommitmentResponseDto[] | undefined
  const recentSchedule = recentScheduleQuery.data as ScheduleResponseDto | undefined
  const exercisesSchedule = exercisesScheduleQuery.data as ScheduleResponseDto | undefined
  const planHistoryData = planHistoryQuery.data as StudentPlanAssignmentResponseDto[] | undefined
  const trainerSchedulesData = trainerSchedulesQuery.data as TrainerScheduleResponseDto[] | undefined
  const trainersData = trainersQuery.data as ListTrainersDto[] | undefined

  const scheduleLookup = useMemo(() => {
    if (!trainerSchedulesData?.length) {
      return new Map<string, TrainerScheduleResponseDto>()
    }

    const map = new Map<string, TrainerScheduleResponseDto>()
    for (const schedule of trainerSchedulesData) {
      if (!schedule?.id) {
        continue
      }
      map.set(String(schedule.id), schedule)
    }
    return map
  }, [trainerSchedulesData])

  const trainerLookup = useMemo(() => {
    if (!trainersData?.length) {
      return new Map<string, string>()
    }

    const map = new Map<string, string>()
    for (const trainer of trainersData) {
      if (!trainer?.id) {
        continue
      }
      map.set(String(trainer.id), trainer.name ?? "Treinador")
    }
    return map
  }, [trainersData])

  const commitmentSummaries = useMemo(
    () => toCommitmentSummaries(commitmentsData, scheduleLookup, trainerLookup),
    [commitmentsData, scheduleLookup, trainerLookup]
  )
  const recentClasses = useMemo(
    () => toRecentClassEntries(recentSchedule, studentId),
    [recentSchedule, studentId]
  )
  const exerciseRecords = useMemo(
    () => toExerciseRecords(exercisesSchedule, studentId),
    [exercisesSchedule, studentId]
  )
  const planHistoryViews = useMemo(
    () => toPlanHistoryViews(planHistoryData),
    [planHistoryData]
  )
  const lastRenewalLabel = useMemo(
    () => getLastRenewalLabel(planHistoryData),
    [planHistoryData]
  )

  const currentAssignment = currentPlanQuery.data ?? null
  const canAccessSchedule = Boolean(currentAssignment)
  const isStudentInactive = Boolean(studentData?.deletedAt)

  const handleDelete = async () => {
    await deleteStudent({ path: { id: studentId }, client: apiClient })
    toast({
      title: "Aluno excluído",
      description: "O aluno foi marcado como inativo.",
      duration: 3000,
    })
    router.back()
  }

  const handleRestore = async () => {
    await restoreStudent({ path: { id: studentId }, client: apiClient })
    toast({
      title: "Aluno reativado",
      description: "O aluno foi reativado com sucesso.",
      duration: 3000,
      variant: "success",
    })
  }

  const resetPlanForm = () => {
    setAssignNotes("")
    setAssignPlanId("")
    setAssignStartDate(formatLocalDate(new Date()))
  }

  const handleAssignPlan = async () => {
    if (!assignPlanId) {
      toast({ title: "Selecione um plano", variant: "destructive" })
      return
    }

    try {
      await assignPlanMutation.mutateAsync({
        path: { studentId },
        body: {
          planId: assignPlanId,
          startDate: assignStartDate,
          assignmentNotes: assignNotes || undefined,
        },
        client: apiClient,
      })

      toast({
        title: "Plano atribuído",
        description: "O plano foi atribuído/renovado com sucesso.",
        variant: "success",
      })

      setIsPlanDialogOpen(false)
      resetPlanForm()

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: getCurrentStudentPlanQueryKey(currentPlanOptions) }),
        queryClient.invalidateQueries({ queryKey: getStudentPlanHistoryQueryKey(currentPlanOptions) }),
        queryClient.invalidateQueries({ queryKey: getStudentCommitmentsQueryKey(currentPlanOptions) }),
      ])
    } catch (error: unknown) {
      handleHttpError(error, "atribuir plano", "Não foi possível atribuir o plano. Tente novamente.")
    }
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto" />
            <p className="mt-2 text-sm text-muted-foreground">Carregando dados do aluno...</p>
          </div>
        </div>
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-lg font-semibold text-red-600">Erro ao carregar dados do aluno</p>
            <p className="text-sm text-muted-foreground mt-2">
              {error.message || "Ocorreu um erro inesperado"}
            </p>
            <Button
              variant="outline"
              onClick={() => router.push("/students")}
              className="mt-4"
            >
              Voltar para lista de alunos
            </Button>
          </div>
        </div>
      </Layout>
    )
  }

  if (!studentData) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-lg font-semibold">Aluno não encontrado</p>
            <Button
              variant="outline"
              onClick={() => router.push("/students")}
              className="mt-4"
            >
              Voltar para lista de alunos
            </Button>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <>
      <Layout>
        <div className="space-y-4">
          <StudentProfileSummaryCard
            heading="Perfil do Aluno"
            description="Informações completas e histórico"
            onBack={() => router.back()}
            student={studentData}
            currentAssignment={currentAssignment}
            onEdit={() => router.push(`/students/${studentId}/edit`)}
            onCreateEvaluation={() => router.push(`/students/${studentId}/evaluation/new`)}
            onOpenSchedule={() => router.push(`/students/${studentId}/class-schedule`)}
            onOpenAssignPlan={() => setIsPlanDialogOpen(true)}
            onDelete={handleDelete}
            onRestore={handleRestore}
            isDeleting={isDeleting}
            isRestoring={isRestoring}
            canAccessSchedule={canAccessSchedule}
            isInactive={isStudentInactive}
          />

          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="grid h-auto w-full max-w-xl grid-cols-2 gap-2 mx-auto sm:grid-cols-3 lg:max-w-none lg:grid-cols-5">
              <TabsTrigger value="overview" className="w-full px-2 py-2 text-xs">
                Geral
              </TabsTrigger>
              <TabsTrigger value="evaluations" className="w-full px-2 py-2 text-xs">
                Avaliações
              </TabsTrigger>
              <TabsTrigger value="exercises" className="w-full px-2 py-2 text-xs">
                Exercícios
              </TabsTrigger>
              <TabsTrigger value="details" className="w-full px-2 py-2 text-xs">
                Detalhes
              </TabsTrigger>
              <TabsTrigger value="plans" className="w-full px-2 py-2 text-xs">
                Planos
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <StudentOverviewTab
                planName={currentAssignment?.planName}
                planMaxDays={currentAssignment?.planMaxDays}
                commitments={commitmentSummaries}
                commitmentsLoading={
                  commitmentsQuery.isLoading ||
                  trainerSchedulesQuery.isLoading ||
                  trainersQuery.isLoading
                }
                recentClasses={recentClasses}
                recentClassesLoading={recentScheduleQuery.isLoading}
              />
            </TabsContent>

            <TabsContent value="evaluations">
              <StudentEvaluationsTab
                evaluations={evaluations}
                isLoading={isLoadingEvaluations}
                onCreateEvaluation={() => router.push(`/students/${studentId}/evaluation/new`)}
                onOpenEvaluation={(evaluationId) => router.push(`/students/${studentId}/evaluation/${evaluationId}`)}
              />
            </TabsContent>

            <TabsContent value="exercises">
              <StudentExercisesTab
                records={exerciseRecords}
                isLoading={exercisesScheduleQuery.isLoading}
              />
            </TabsContent>

            <TabsContent value="details">
              <StudentDetailsTab
                student={studentData}
                lastRenewalLabel={lastRenewalLabel}
                insomniaOptions={hasInsomniaTypes}
                impairmentTypeOptions={impairmentTypes}
              />
            </TabsContent>

            <TabsContent value="plans">
              <StudentPlanHistoryTab
                entries={planHistoryViews}
                isLoading={planHistoryQuery.isLoading}
                onAssignPlan={() => setIsPlanDialogOpen(true)}
              />
            </TabsContent>
          </Tabs>
        </div>
      </Layout>

      <PlanAssignmentDialog
        open={isPlanDialogOpen}
        onOpenChange={(open) => {
          setIsPlanDialogOpen(open)
          if (!open) {
            resetPlanForm()
          }
        }}
        plans={allPlansQuery.data}
        selectedPlanId={assignPlanId}
        onSelectPlan={setAssignPlanId}
        startDate={assignStartDate}
        onChangeStartDate={setAssignStartDate}
        notes={assignNotes}
        onChangeNotes={setAssignNotes}
        onConfirm={handleAssignPlan}
        onCancel={() => {
          setIsPlanDialogOpen(false)
          resetPlanForm()
        }}
        isSubmitting={assignPlanMutation.isPending}
        hasActivePlan={canAccessSchedule}
      />
    </>
  )
}
