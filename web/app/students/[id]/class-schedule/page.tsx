"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Save, Calendar, Clock, User } from "lucide-react"
import { useRouter, useParams } from "next/navigation"
import Layout from "@/components/layout"
import { useCreateCommitment, useCommitmentsForSeries, useSplitCommitment } from "@/lib/hooks/commitment-queries"
import { useToast } from "@/hooks/use-toast"
import { getScheduleOptions } from "@/lib/api-client/@tanstack/react-query.gen"
import { apiClient } from "@/lib/client"
import { useQuery } from "@tanstack/react-query"
import { useEnrollStudent } from "@/lib/hooks/enrollment-queries"
import { useStudent } from "@/lib/hooks/student-queries"
import type { ScheduleResponseDto, ScheduledSession, StudentResponseDto, EnrollmentRequestDto } from "@/lib/api-client/types.gen"

function SeriesCommitActions({ studentId, seriesId, sessionStart, available }: { studentId?: string; seriesId?: string; sessionStart?: string; available?: boolean }) {
  const createCommitment = useCreateCommitment()
  const splitCommitment = useSplitCommitment()
  const commitmentsQuery = useCommitmentsForSeries(studentId, seriesId)
  const { toast } = useToast()

  const existingCommitment = (commitmentsQuery.data && commitmentsQuery.data.length > 0) ? commitmentsQuery.data[0] : undefined

  const handleCreateSeriesCommitment = async () => {
    if (!studentId || !seriesId) return
    try {
      await createCommitment.mutateAsync(studentId, {
        sessionSeriesId: seriesId,
        commitmentStatus: "ATTENDING",
        effectiveFromTimestamp: new Date().toISOString()
      })
      toast({ title: "Compromisso criado", description: "Compromisso em série criado com sucesso.", duration: 3000 })
    } catch (e) {
      toast({ title: "Erro", description: "Não foi possível criar compromisso.", duration: 4000 })
      // eslint-disable-next-line no-console
      console.error(e)
    }
  }

  const handleSplit = async () => {
    if (!existingCommitment || !existingCommitment.id || !sessionStart) return
    try {
      // SplitRequestDto expects `splitFrom` (ISO string) per generated types
      await splitCommitment.mutateAsync(existingCommitment.id, {
        splitFrom: String(sessionStart)
      })
      toast({ title: "Compromisso dividido", description: "O compromisso foi dividido a partir desta aula.", duration: 3000 })
    } catch (e) {
      toast({ title: "Erro", description: "Não foi possível dividir o compromisso.", duration: 4000 })
      // eslint-disable-next-line no-console
      console.error(e)
    }
  }

  return (
    <div className="mt-2 flex gap-2">
      <Button
        size="sm"
        variant="outline"
        onClick={handleCreateSeriesCommitment}
        disabled={!available}
      >
        Comprometer-se (série)
      </Button>

      {existingCommitment && (
        <Button
          size="sm"
          variant="ghost"
          onClick={handleSplit}
          disabled={!available || splitCommitment.isPending}
        >
          Esta e seguintes
        </Button>
      )}
    </div>
  )
}

export default function ClassSchedulePage() {
  const router = useRouter()
  const params = useParams()
  const [selectedClasses, setSelectedClasses] = useState<string[]>([])
  // Get real student data instead of mocked object
  const studentQuery = useStudent({ path: { id: String(params.id) } })
  const student = studentQuery.data as StudentResponseDto | undefined

  // Derive a minimal plan view used by this page (fallbacks kept for offline/dev)
  const studentPlan = {
    name: student?.activePlan?.planName ?? "Plano Mensal",
    // approximate days per week from plan max days when available, otherwise default to 3
    daysPerWeek: student?.activePlan?.planMaxDays ? Math.max(1, Math.min(7, Math.round((student.activePlan.planMaxDays || 0) / 4))) : 3,
    maxClasses: student?.activePlan?.planMaxDays ?? 12,
  }

  // Fetch schedule from API (falls back to mock data when API not available)
  const startDate = new Date().toISOString().slice(0,10)
  const endDate = new Date(Date.now() + 7*24*60*60*1000).toISOString().slice(0,10)
  const scheduleQuery = useQuery(getScheduleOptions({ client: apiClient, query: { startDate, endDate } }))

  // Map API sessions into the weekly schedule shape if present
  type ClassItem = {
    id: string
    name: string
    time: string
    duration: number
    instructor: string
    maxStudents: number
    currentStudents: number
    available: boolean
    raw?: ScheduledSession
  }

  const apiSessions = (scheduleQuery.data as ScheduleResponseDto | undefined)?.sessions ?? []
  const groupedByDay: Record<string, ClassItem[]> = {}

  apiSessions.forEach((s) => {
    if (!s || !s.startTime) return
    try {
      const day = new Date(s.startTime).toLocaleDateString("pt-BR", { weekday: "long" })
      groupedByDay[day] = groupedByDay[day] || []
      const duration =
        Math.max(0, Math.round((new Date(s.endTime ?? s.startTime).getTime() - new Date(s.startTime).getTime()) / 60000))

      groupedByDay[day].push({
        id: String(s.sessionId ?? s.id ?? ""),
        name: s.seriesName ?? "Aula",
        time: new Date(s.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        duration,
        instructor: s.trainer?.name ?? "—",
        maxStudents: s.maxParticipants ?? 0,
        currentStudents: (s.participants?.length ?? 0),
        available: s.maxParticipants == null || (s.participants?.length ?? 0) < (s.maxParticipants ?? Infinity),
        raw: s
      })
    } catch (e) {
      // Ignore mapping errors for malformed session objects
      // eslint-disable-next-line no-console
      console.error("Error mapping session", e, s)
    }
  })

  const apiWeeklySchedule = Object.keys(groupedByDay).length
    ? Object.keys(groupedByDay).map((day) => ({ day, classes: groupedByDay[day] }))
    : null

  // Minimal fallback weekly schedule (only used when API is unavailable)
  const weekdays = [
    "Segunda-feira",
    "Terça-feira",
    "Quarta-feira",
    "Quinta-feira",
    "Sexta-feira",
    "Sábado",
    "Domingo"
  ]

  const weeklySchedule = apiWeeklySchedule ?? weekdays.map((d) => ({ day: d, classes: [] as ClassItem[] }))

  const getSelectedDays = () => {
    const selectedDays = new Set<string>()
    selectedClasses.forEach((classId) => {
      const daySchedule = weeklySchedule.find((day) => day.classes.some((cls) => cls.id === classId))
      if (daySchedule) {
        selectedDays.add(daySchedule.day)
      }
    })
    return Array.from(selectedDays)
  }

  const selectedDays = getSelectedDays()

  const canSelectClass = (classId: string) => {
    if (selectedClasses.includes(classId)) return true // Already selected

    const daySchedule = weeklySchedule.find((day) => day.classes.some((cls) => cls.id === classId))

    if (!daySchedule) return false

    // If this day is already selected, allow more classes from same day
    if (selectedDays.includes(daySchedule.day)) return true

    // If selecting this class would add a new day, check day limit
    return selectedDays.length < studentPlan.daysPerWeek
  }

  const handleClassToggle = (classId: string) => {
    setSelectedClasses((prev) => {
      if (prev.includes(classId)) {
        return prev.filter((id) => id !== classId)
      } else if (canSelectClass(classId)) {
        return [...prev, classId]
      }
      return prev
    })
  }

  const handleDayToggle = (day: string) => {
    const dayClasses = weeklySchedule.find((d) => d.day === day)?.classes || []
    const availableClasses = dayClasses.filter((cls) => cls.available)

    if (selectedDays.includes(day)) {
      // Remove all classes from this day
      setSelectedClasses((prev) => prev.filter((classId) => !availableClasses.some((cls) => cls.id === classId)))
    } else if (selectedDays.length < studentPlan.daysPerWeek) {
      // Add all available classes from this day
      const newClassIds = availableClasses.map((cls) => cls.id)
      setSelectedClasses((prev) => [...prev, ...newClassIds])
    }
  }

  const createCommitment = useCreateCommitment()
  const splitCommitment = useSplitCommitment()
  const { toast } = useToast()
  const enrollStudent = useEnrollStudent()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const studentId = String(params.id)

  const handleCommitSeries = async (seriesId: string) => {
    if (!studentId) return
    try {
      await createCommitment.mutateAsync(studentId, {
        sessionSeriesId: apiSessions.find(s => s.sessionSeriesId === seriesId)?.sessionId || seriesId,
        commitmentStatus: "ATTENDING",
        effectiveFromTimestamp: new Date().toISOString()
      })
      toast({ title: "Compromisso criado", description: "Compromisso em série criado com sucesso.", duration: 3000 })
    } catch (e) {
      toast({ title: "Erro", description: "Não foi possível criar compromisso.", duration: 4000 })
      // eslint-disable-next-line no-console
      console.error(e)
    }
  }

  const handleSplit = async (commitmentId: string) => {
    if (!commitmentId) return
    try {
      await splitCommitment.mutateAsync(commitmentId, {
        splitFrom: new Date().toISOString()
      })
      toast({ title: "Compromisso dividido", description: "O compromisso foi dividido.", duration: 3000 })
    } catch (e) {
      toast({ title: "Erro", description: "Não foi possível dividir o compromisso.", duration: 4000 })
      // eslint-disable-next-line no-console
      console.error(e)
    }
  }

  const handleSave = async () => {
    if (!studentId) return

    // Client-side plan validation (prevent accidental over-bookings)
    if (studentPlan.maxClasses != null && selectedClasses.length > studentPlan.maxClasses) {
      toast({
        title: "Limite de aulas excedido",
        description: `Seu plano permite no máximo ${studentPlan.maxClasses} aulas. Remova ${selectedClasses.length - studentPlan.maxClasses} aula(s) antes de salvar.`,
        duration: 5000,
        variant: "destructive",
      })
      return
    }

    if (selectedDays.length > studentPlan.daysPerWeek) {
      toast({
        title: "Limite de dias excedido",
        description: `Selecione no máximo ${studentPlan.daysPerWeek} dia(s) por semana conforme seu plano.`,
        duration: 5000,
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    // Build enrollment payload from selected classes
    const sessions = selectedClasses.map((classId) => {
      const daySchedule = weeklySchedule.find((d) => d.classes.some((c) => c.id === classId))
      const cls = daySchedule?.classes.find((c) => c.id === classId)
      const raw = cls?.raw

      if (raw) {
        const start = String(raw.startTime ?? `${startDate}T${cls?.time ?? "00:00"}:00`)
        const end = String(raw.endTime ?? new Date(new Date(start).getTime() + ((cls?.duration ?? 60) * 60000)).toISOString())
        return {
          sessionId: String(raw.sessionId ?? raw.id ?? classId),
          sessionSeriesId: raw.sessionSeriesId ?? undefined,
          startTime: start,
          endTime: end,
          trainerId: raw.trainer?.id ?? raw.trainerId ?? undefined,
          maxParticipants: raw.maxParticipants ?? cls?.maxStudents ?? undefined,
          seriesName: raw.seriesName ?? cls?.name ?? undefined
        }
      } else {
        // Fallback: construct ISO times from startDate and class time
        const startIso = `${startDate}T${cls?.time ?? "00:00"}:00`
        const endIso = new Date(new Date(startIso).getTime() + ((cls?.duration ?? 60) * 60000)).toISOString()
        return {
          sessionId: classId,
          sessionSeriesId: undefined,
          startTime: startIso,
          endTime: endIso,
          trainerId: undefined,
          maxParticipants: cls?.maxStudents ?? undefined,
          seriesName: cls?.name ?? undefined
        }
      }
    })

    const payload: EnrollmentRequestDto = {
      studentId,
      sessions
    }

    try {
      await enrollStudent.mutateAsync(payload)
      toast({ title: "Matrículas salvas", description: "As aulas selecionadas foram salvas no servidor.", duration: 3000 })
      router.back()
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error saving enrollment:", error)
      toast({ title: "Erro", description: "Erro ao conectar com o servidor.", duration: 4000 })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getOccupancyColor = (current: number, max: number) => {
    const percentage = (current / max) * 100
    if (percentage >= 90) return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
    if (percentage >= 70) return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
    return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
  }

  return (
    <Layout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">Cronograma de Aulas</h1>
            <p className="text-sm text-muted-foreground">
              {studentQuery.isLoading ? "Carregando..." : studentQuery.isError ? "Erro ao carregar aluno" : student?.name ?? "—"}
            </p>
          </div>
        </div>

        {/* Plan Info */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{studentPlan.name}</h3>
                <p className="text-sm text-muted-foreground">Selecione até {studentPlan.daysPerWeek} dias por semana</p>
              </div>
              <div className="text-right">
                <Badge variant="outline" className="mb-1">
                  {selectedDays.length}/{studentPlan.daysPerWeek} dias
                </Badge>
                <p className="text-xs text-muted-foreground">{selectedClasses.length} aulas selecionadas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Weekly Schedule */}
        <div className="space-y-3">
          {weeklySchedule.map((daySchedule) => {
            const isDaySelected = selectedDays.includes(daySchedule.day)
            const canSelectDay = selectedDays.length < studentPlan.daysPerWeek || isDaySelected

            return (
              <Card key={daySchedule.day}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Checkbox
                        checked={isDaySelected}
                        onCheckedChange={() => handleDayToggle(daySchedule.day)}
                        disabled={daySchedule.classes.length === 0 || !canSelectDay}
                      />
                      <Calendar className="w-4 h-4" />
                      {daySchedule.day}
                    </CardTitle>
                    <Badge variant="outline" className="text-xs">
                      {daySchedule.classes.length} aulas
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {daySchedule.classes.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">
                      <p className="text-sm">Nenhuma aula disponível</p>
                    </div>
                  ) : (
                    daySchedule.classes.map((classItem) => {
                      const isClassSelected = selectedClasses.includes(classItem.id)
                      const canSelect = canSelectClass(classItem.id)

                      return (
                        <div
                          key={classItem.id}
                          className={`p-3 rounded-lg border transition-colors ${
                            !classItem.available
                              ? "opacity-50 bg-muted/50"
                              : isClassSelected
                                ? "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800"
                                : "hover:bg-muted/50"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <Checkbox
                              checked={isClassSelected}
                              onCheckedChange={() => handleClassToggle(classItem.id)}
                              disabled={!classItem.available || (!isClassSelected && !canSelect)}
                              className="mt-0.5"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium text-sm">{classItem.name}</h4>
                                <Badge
                                  className={`${getOccupancyColor(classItem.currentStudents, classItem.maxStudents)} text-xs`}
                                >
                                  {classItem.currentStudents}/{classItem.maxStudents}
                                </Badge>
                                {!classItem.available && (
                                  <Badge variant="destructive" className="text-xs">
                                    Lotada
                                  </Badge>
                                )}
                              </div>

                              <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  <span>
                                    {classItem.time} ({classItem.duration}min)
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <User className="w-3 h-3" />
                                  <span>{classItem.instructor}</span>
                                </div>
                              </div>

                              <SeriesCommitActions
                                studentId={String(params.id)}
                                seriesId={classItem.raw?.sessionSeriesId ? String(classItem.raw.sessionSeriesId) : undefined}
                                sessionStart={classItem.raw?.startTime ? String(classItem.raw.startTime) : undefined}
                                available={classItem.available}
                              />
                            </div>
                          </div>
                        </div>
                      )
                    })
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4">
          <Button type="button" variant="outline" onClick={() => router.back()} className="flex-1">
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            className="bg-green-600 hover:bg-green-700 flex-1"
            disabled={
              selectedClasses.length === 0 ||
              studentQuery.isLoading ||
              scheduleQuery.isLoading ||
              isSubmitting ||
              (studentPlan.maxClasses != null && selectedClasses.length > studentPlan.maxClasses) ||
              selectedDays.length > studentPlan.daysPerWeek
            }
          >
            <Save className="w-4 h-4 mr-2" />
            {isSubmitting ? "Salvando..." : "Salvar Cronograma"}
          </Button>
        </div>
      </div>
    </Layout>
  )
}
