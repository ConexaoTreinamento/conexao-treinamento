import type { CommitmentSummary, RecentClassEntry } from "@/components/students/profile/overview-tab"
import type { ExerciseRecord } from "@/components/students/profile/exercises-tab"
import type {
  StudentCommitmentResponseDto,
  StudentPlanAssignmentResponseDto,
  TrainerScheduleResponseDto,
  ScheduleResponseDto,
} from "@/lib/api-client/types.gen"
import {
  getAssignmentDaysRemaining,
  getAssignmentDurationDays,
  getAssignmentEndDate,
} from "@/components/plans/expiring-plans"

export const WEEKDAY_LABELS = [
  "Domingo",
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
]

export const ensureStudentId = (rawId: unknown): string => {
  if (typeof rawId === "string") {
    return rawId
  }
  if (Array.isArray(rawId) && rawId.length > 0 && typeof rawId[0] === "string") {
    return rawId[0]
  }
  return ""
}

export const formatLocalDate = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export const normalizeCommitmentStatus = (
  status: StudentCommitmentResponseDto["commitmentStatus"],
): CommitmentSummary["status"] => {
  if (status === "ATTENDING" || status === "NOT_ATTENDING" || status === "TENTATIVE") {
    return status
  }
  return "TENTATIVE"
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

export const formatCommitmentTimeRange = (
  startRaw: unknown,
  endRaw: unknown,
): string | undefined => {
  const normalize = (value: unknown): string | undefined => {
    if (typeof value !== "string" || value.trim().length === 0) {
      return undefined
    }

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

export const toCommitmentSummaries = (
  commitments: StudentCommitmentResponseDto[] | undefined,
  scheduleLookup: Map<string, TrainerScheduleResponseDto>,
  trainerLookup: Map<string, string>,
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
    const schedule = sessionSeriesId ? scheduleLookup.get(sessionSeriesId) : undefined
    const scheduleTimeLabel = getScheduleTimeLabel(schedule)
    const fallbackTimeLabel = formatCommitmentTimeRange(start, end)
    const timeLabel = scheduleTimeLabel ?? fallbackTimeLabel

    const scheduleTrainerName = schedule?.trainerId ? trainerLookup.get(String(schedule.trainerId)) : undefined
    const fallbackTrainer = typeof instructor === "string" && instructor.trim().length > 0 ? instructor.trim() : undefined
    const trainerName = scheduleTrainerName ?? fallbackTrainer
    const weekday = typeof schedule?.weekday === "number" ? schedule.weekday : undefined
    const weekdayLabel = schedule?.weekdayName ?? (typeof weekday === "number" ? WEEKDAY_LABELS[weekday] : undefined)

    return {
      id: String(rawId),
      seriesName: String(schedule?.seriesName ?? rawSeriesName ?? "Série"),
      status: normalizeCommitmentStatus(commitment.commitmentStatus),
      timeLabel,
      trainerName,
      weekday,
      weekdayLabel,
    }
  })
}

export const toRecentClassEntries = (
  schedule: ScheduleResponseDto | undefined,
  studentId: string,
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

export const toExerciseRecords = (
  schedule: ScheduleResponseDto | undefined,
  studentId: string,
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

export const toPlanHistoryViews = (
  history: StudentPlanAssignmentResponseDto[] | undefined,
) => {
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

export const getLastRenewalLabel = (
  history: StudentPlanAssignmentResponseDto[] | undefined,
): string | undefined => {
  if (!history || history.length === 0) {
    return undefined
  }

  const sorted = history
    .filter((entry) => Boolean(entry.startDate))
    .slice()

  sorted.sort((a, b) => new Date(b.startDate ?? 0).getTime() - new Date(a.startDate ?? 0).getTime())

  const latest = sorted[0]
  if (!latest?.startDate) {
    return undefined
  }

  return new Date(latest.startDate).toLocaleDateString("pt-BR")
}
