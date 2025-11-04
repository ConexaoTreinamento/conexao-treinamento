"use client"

import { Suspense, useEffect, useMemo, useState } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import Layout from "@/components/layout"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type { StudentCommitmentResponseDto } from "@/lib/api-client"
import { useForm } from "react-hook-form"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import type { StudentSummary } from "@/components/students/student-picker"
import { formatISODateToDisplay } from "@/lib/formatters/time"
import { SessionHeader } from "@/components/schedule/session/session-header"
import { SessionInfoCard } from "@/components/schedule/session/session-info-card"
import { SessionParticipantsCard } from "@/components/schedule/session/session-participants-card"
import { SessionAddParticipantDialog } from "@/components/schedule/session/session-add-participant-dialog"
import { SessionExerciseDialog } from "@/components/schedule/session/session-exercise-dialog"
import { SessionCreateExerciseDialog } from "@/components/schedule/session/session-create-exercise-dialog"
import { SessionTrainerDialog } from "@/components/schedule/session/session-trainer-dialog"
import {
  sessionQueryOptions,
  scheduleByDateQueryOptions,
  trainersLookupQueryOptions,
  exercisesQueryOptions,
  type PageExerciseResponseDto,
  type SessionResponseDto,
  type TrainerResponseDto,
} from "@/lib/schedule/hooks/session-queries"
import {
  addRegisteredParticipantExerciseMutationOptions,
  addSessionParticipantMutationOptions,
  cancelOrRestoreSessionMutationOptions,
  createExerciseMutationOptions,
  removeRegisteredParticipantExerciseMutationOptions,
  removeSessionParticipantMutationOptions,
  updatePresenceMutationOptions,
  updateRegisteredParticipantExerciseMutationOptions,
  updateSessionTrainerMutationOptions,
} from "@/lib/schedule/hooks/session-mutations"
import type { ExerciseResponseDto } from "@/lib/schedule/hooks/session-mutations"

export default function ClassDetailPage() {
  return (
    <Suspense
      fallback={(
        <Layout>
          <div className="p-6 text-sm text-muted-foreground">Carregando aula...</div>
        </Layout>
      )}
    >
      <ClassDetailPageContent />
    </Suspense>
  )
}

function ClassDetailPageContent() {
  const { sessionId: rawSessionId } = useParams<{sessionId:string}>()
  const router = useRouter()
  const searchParams = useSearchParams()
  const qc = useQueryClient()

  const sessionId = useMemo(() => {
    try { return rawSessionId?.includes('%') ? decodeURIComponent(rawSessionId) : rawSessionId } catch { return rawSessionId }
  }, [rawSessionId])

  const invalidateReportsQueries = () => {
    qc.invalidateQueries({
      predicate: (query) => {
        const key = query.queryKey
        if (!Array.isArray(key) || key.length === 0) return false
        const root = key[0]
        return typeof root === "object" && root !== null && (root as { _id?: string })._id === "getReports"
      }
    })
  }

  // Query session (with hint for trainer if provided)
  const hintedDate = searchParams.get('date') || undefined
  const hintedTrainer = searchParams.get('trainer') || undefined
  const sessionOptions = sessionQueryOptions({ sessionId, trainerId: hintedTrainer || undefined })
  const sessionQuery = useQuery(sessionOptions)
  const session = sessionQuery.data as SessionResponseDto | undefined

  // Fallback lookup by day (when deep-linking with only date hints)
  const needFallback = !!hintedDate && (!!sessionQuery.error || !sessionQuery.data)
  useQuery({
    ...scheduleByDateQueryOptions({ startDate: hintedDate || "", endDate: hintedDate || "" }),
    enabled: needFallback,
  })

  // Trainers
  const trainersQuery = useQuery(trainersLookupQueryOptions())

  // Students (for Add Student dialog) with pagination similar to Students page

  // Exercises catalog (for exercise selection)
  const exercisesQuery = useQuery(exercisesQueryOptions())
  const allExercises: ExerciseResponseDto[] = useMemo(() => {
    const page = exercisesQuery.data as PageExerciseResponseDto | undefined
    return page?.content ?? []
  }, [exercisesQuery.data])

  // Local UI state derived from session
  const [isExerciseOpen, setIsExerciseOpen] = useState(false)
  const [isEditClassOpen, setIsEditClassOpen] = useState(false)
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null)
  const [exerciseSearchTerm, setExerciseSearchTerm] = useState("")
  const [isExerciseListOpen, setIsExerciseListOpen] = useState(false)
  const [editTrainer, setEditTrainer] = useState<string>("none")
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [isCreateExerciseOpen, setIsCreateExerciseOpen] = useState(false)
  const [removeStudentConfirm, setRemoveStudentConfirm] = useState<{ id: string; name: string } | null>(null)
  const [removeExerciseConfirm, setRemoveExerciseConfirm] = useState<{ id: string; name: string } | null>(null)

  // Exercise forms (react-hook-form)
  type RegisterExerciseForm = { exerciseId: string; sets?: string; reps?: string; weight?: string; notes?: string }
  const registerExerciseForm = useForm<RegisterExerciseForm>({ defaultValues: { exerciseId: "", sets: "", reps: "", weight: "", notes: "" } })
  type CreateExerciseForm = { name: string; description?: string }
  const createExerciseForm = useForm<CreateExerciseForm>({ defaultValues: { name: "", description: "" } })
  // removed local create exercise state in favor of react-hook-form

  useEffect(() => {
    if (session) {
      setEditTrainer(session.trainerId || "none")
    }
  }, [session])

  useEffect(() => {
    if (!isExerciseOpen) {
      setExerciseSearchTerm("")
      setIsExerciseListOpen(false)
    }
  }, [isExerciseOpen])

  // Mutations
  const mUpdateTrainer = useMutation(updateSessionTrainerMutationOptions())
  const mPresence = useMutation(updatePresenceMutationOptions())
  const mRemoveParticipant = useMutation(removeSessionParticipantMutationOptions())
  const mAddParticipant = useMutation(addSessionParticipantMutationOptions())
  const mAddExercise = useMutation(addRegisteredParticipantExerciseMutationOptions())
  const mUpdateExercise = useMutation(updateRegisteredParticipantExerciseMutationOptions())
  const mRemoveExercise = useMutation(removeRegisteredParticipantExerciseMutationOptions())
  const mCancelRestore = useMutation(cancelOrRestoreSessionMutationOptions())
  const mCreateExercise = useMutation(createExerciseMutationOptions())

  // Invalidate this session and also the schedule listing for the month containing this session's date
  const invalidateScheduleForSessionMonth = () => {
    const dateIso = (session?.startTime?.slice(0,10)) || hintedDate || undefined
    if(!dateIso) return
    // Compute month boundaries in UTC to match schedule query usage
    const d = new Date(dateIso)
    const monthStart = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1))
    const monthEnd = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth()+1, 0))
    const monthStartIso = monthStart.toISOString().slice(0,10)
    const monthEndIso = monthEnd.toISOString().slice(0,10)
  qc.invalidateQueries({ queryKey: scheduleByDateQueryOptions({ startDate: monthStartIso, endDate: monthEndIso }).queryKey })
    // Also invalidate the recent 7-day schedule window (Student > Recent Classes)
    const today = new Date()
    const formatLocalDate = (dt: Date) => {
      const y = dt.getFullYear()
      const m = String(dt.getMonth() + 1).padStart(2, '0')
      const day = String(dt.getDate()).padStart(2, '0')
      return `${y}-${m}-${day}`
    }
    const recentEnd = formatLocalDate(today)
    const recentStart = formatLocalDate(new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7))
  qc.invalidateQueries({ queryKey: scheduleByDateQueryOptions({ startDate: recentStart, endDate: recentEnd }).queryKey })
    // Fallback: broadly invalidate all schedule queries regardless of date ranges to avoid key mismatches due to timezone/date formatting differences
    qc.invalidateQueries({
      predicate: (q) => {
        const k0 = (q.queryKey as unknown[])?.[0] as { _id?: string } | undefined
        return !!(k0 && typeof k0 === 'object' && k0._id === 'getSchedule')
      }
    })
  }
  const invalidate = () => {
    // Invalidate this exact session query key
    qc.invalidateQueries({ queryKey: sessionOptions.queryKey })
    // Broadly invalidate any getSession queries for this sessionId to account for different query params/usages
    if (sessionId) {
      qc.invalidateQueries({
        predicate: (q) => {
          const k0 = (q.queryKey as unknown[])?.[0] as { _id?: string; path?: { sessionId?: string } } | undefined
          return !!(k0 && typeof k0 === 'object' && k0._id === 'getSession' && k0.path?.sessionId === sessionId)
        }
      })
    }
    invalidateScheduleForSessionMonth()
    invalidateReportsQueries()
  }

  const togglePresence = async (sid: string) => {
    if (!session) return
    const key = sessionOptions.queryKey
    // Optimistic update in cache
    qc.setQueryData<SessionResponseDto>(key, (old) => {
      if (!old) return old
      const students = (old.students ?? []).map(s => s.studentId === sid ? ({ ...s, present: !(s.present ?? (s.commitmentStatus === 'ATTENDING')) }) : s)
      return { ...old, students }
    })
    const current = (session.students ?? []).find(p=> p.studentId===sid)?.present ?? true
  await mPresence.mutateAsync({ path: { sessionId: session.sessionId!, studentId: sid }, body: { present: !current } })
    invalidate()
  }

  const removeStudent = async (sid: string) => {
    if (!session) return
    // Optimistic remove from cache
    qc.setQueryData<SessionResponseDto>(sessionOptions.queryKey, (old) => {
      if (!old) return old
      return { ...old, students: (old.students ?? []).filter(s => s.studentId !== sid) }
    })
  await mRemoveParticipant.mutateAsync({ path: { sessionId: session.sessionId!, studentId: sid } })
    invalidate()
  }

  const addStudent = async (student: StudentSummary) => {
    if (!session || !student.id) return
    const studentId = student.id
    const studentName = `${student.name ?? ''} ${student.surname ?? ''}`.trim() || studentId
    // Optimistic add to cache
    qc.setQueryData<SessionResponseDto>(sessionOptions.queryKey, (old) => {
      if (!old) return old
      const exists = (old.students ?? []).some(p => p.studentId === studentId)
      if (exists) return old
      const newEntry: StudentCommitmentResponseDto = { studentId, studentName, present: true, commitmentStatus: 'ATTENDING', participantExercises: [] }
      return { ...old, students: [...(old.students ?? []), newEntry] }
    })
  await mAddParticipant.mutateAsync({ path: { sessionId: session.sessionId! }, body: { studentId } })
    // Ensure presence true also persisted (if backend doesn't default);
  try { await mPresence.mutateAsync({ path: { sessionId: session.sessionId!, studentId }, body: { present: true } }) } catch {}
    invalidate()
  }

  const openExerciseDialog = (sid: string) => {
    setSelectedStudentId(sid)
    setIsExerciseOpen(true)
    registerExerciseForm.reset({ exerciseId: "", sets: "", reps: "", weight: "", notes: "" })
    setExerciseSearchTerm("")
    setIsExerciseListOpen(false)
  }

  const openCreateExercise = () => {
    createExerciseForm.reset({ name: "", description: "" })
    setIsCreateExerciseOpen(true)
  }

  const addToExercisesCaches = (ex: ExerciseResponseDto) => {
    const entries = qc.getQueriesData<PageExerciseResponseDto>({
      predicate: (q) => {
        const k0 = (q.queryKey as unknown[])?.[0] as { _id?: string } | undefined
        return !!(k0 && typeof k0 === 'object' && k0._id === 'findAllExercises')
      }
    })
    entries.forEach(([key, data]) => {
      if (!data) return
      const content = data.content ?? []
      if (content.some(e => e.id === ex.id)) return
      qc.setQueryData(key, { ...data, content: [ex, ...content] })
    })
  }

  const createExerciseAndUse = createExerciseForm.handleSubmit(async (values) => {
    const name = values.name.trim()
    if (!name) return
    const description = values.description?.trim() || undefined
  const created = await mCreateExercise.mutateAsync({ body: { name, description } })
    // Update local caches so it appears in the list
    addToExercisesCaches(created)
    // Select it in the register exercise modal
    registerExerciseForm.setValue("exerciseId", created.id || "")
    setExerciseSearchTerm("")
    setIsExerciseListOpen(false)
    closeCreateExerciseDialog()
  })

  const submitExercise = registerExerciseForm.handleSubmit(async (values) => {
    if (!session || !selectedStudentId || !values.exerciseId) return
    await mAddExercise.mutateAsync({ path: { sessionId: session.sessionId!, studentId: selectedStudentId! }, body: {
      exerciseId: values.exerciseId,
      setsCompleted: values.sets ? parseInt(values.sets) : undefined,
      repsCompleted: values.reps ? parseInt(values.reps) : undefined,
      weightCompleted: values.weight ? parseFloat(values.weight) : undefined,
      exerciseNotes: values.notes || undefined
    } })
    closeExerciseDialog()
    invalidate()
  })

  const deleteExercise = async (exerciseRecordId: string) => {
    if (!session) return
    // Optimistic removal from cache
    qc.setQueryData<SessionResponseDto>(sessionOptions.queryKey, (old) => {
      if (!old) return old
      const students = (old.students ?? []).map(s => ({
        ...s,
        participantExercises: (s.participantExercises ?? []).filter(ex => ex.id !== exerciseRecordId)
      }))
      return { ...old, students }
    })
  await mRemoveExercise.mutateAsync({ path: { exerciseRecordId } })
    invalidate()
  }

  const toggleExerciseDone = async (studentId: string, exerciseRecordId: string, currentDone: boolean) => {
    // Optimistic flip in cache
    qc.setQueryData<SessionResponseDto>(sessionOptions.queryKey, (old) => {
      if (!old) return old
      const students = (old.students ?? []).map(p => p.studentId === studentId ? ({
        ...p,
        participantExercises: (p.participantExercises ?? []).map(ex => ex.id === exerciseRecordId ? { ...ex, done: !currentDone } : ex)
      }) : p)
      return { ...old, students }
    })
  await mUpdateExercise.mutateAsync({ path: { exerciseRecordId }, body: { done: !currentDone } })
    invalidate()
  }

  const saveTrainer = async () => {
    if (!session) return
    const mapped = editTrainer === 'none' ? undefined : editTrainer
  await mUpdateTrainer.mutateAsync({ path: { sessionId: session.sessionId! }, body: { trainerId: mapped } })
    setIsEditClassOpen(false)
    invalidate()
  }

  const toggleCancel = async () => {
    if (!session) return
  await mCancelRestore.mutateAsync({ path: { sessionId: session.sessionId! }, body: { cancel: !session.canceled } })
    invalidate()
  }

  // Move all derived values and hooks before early returns
  const selectedExerciseId = registerExerciseForm.watch("exerciseId")
  const selectedExercise = useMemo(() => {
    if (!selectedExerciseId) return null
    return (allExercises || []).find((ex) => ex.id === selectedExerciseId) ?? null
  }, [allExercises, selectedExerciseId])
  const trainers = useMemo(() => (trainersQuery.data as TrainerResponseDto[] | undefined) ?? [], [trainersQuery.data])

  const closeExerciseDialog = () => {
    setIsExerciseOpen(false)
    setSelectedStudentId(null)
    setExerciseSearchTerm("")
    setIsExerciseListOpen(false)
    registerExerciseForm.reset({ exerciseId: "", sets: "", reps: "", weight: "", notes: "" })
  }

  const closeCreateExerciseDialog = () => {
    setIsCreateExerciseOpen(false)
    createExerciseForm.reset({ name: "", description: "" })
  }

  if (sessionQuery.isLoading) return <Layout><div className="p-6 text-sm">Carregando...</div></Layout>
  if (sessionQuery.error || !session) return <Layout><div className="p-6 text-sm text-red-600">Sessão não encontrada.</div></Layout>

  // Derived
  const students: StudentCommitmentResponseDto[] = (session.students ?? []).map(s => ({
    ...s,
    present: s.present ?? (s.commitmentStatus === 'ATTENDING'),
    participantExercises: s.participantExercises ?? []
  }))
  const selectedStudentName = selectedStudentId
    ? students.find((s) => s.studentId === selectedStudentId)?.studentName || ""
    : ""
  const sessionTitle = session.seriesName || "Aula"
  const sessionDateLabel = formatISODateToDisplay(session.startTime)
  const startTimeLabel = session.startTime?.slice(11, 16) ?? "--:--"
  const endTimeLabel = session.endTime ? session.endTime.slice(11, 16) : ""
  const sessionTimeLabel = endTimeLabel ? `${startTimeLabel} - ${endTimeLabel}` : startTimeLabel
  const studentCount = students.length
  const filteredStudents = students
  const excludedIds = new Set((students||[]).map(p => p.studentId).filter(Boolean) as string[])
  const handleStudentSelect = (student: StudentSummary) => {
    void addStudent(student)
    setAddDialogOpen(false)
  }
  const normalizedExerciseSearch = exerciseSearchTerm.trim().toLowerCase()
  const filteredExercises = (allExercises||[]).filter(e => (e.name || '').toLowerCase().includes(normalizedExerciseSearch))
  const shouldShowExerciseList = isExerciseListOpen && exerciseSearchTerm.trim().length > 0
  return (
    <Layout>
      <div className="space-y-4">
        <SessionHeader
          title={sessionTitle}
          dateLabel={sessionDateLabel}
          timeLabel={sessionTimeLabel}
          onBack={() => router.back()}
        />

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <SessionInfoCard
            dateLabel={sessionDateLabel}
            timeLabel={sessionTimeLabel}
            studentCount={studentCount}
            trainerName={session.trainerName}
            notes={session.notes}
            isCanceled={Boolean(session.canceled)}
            onEdit={() => setIsEditClassOpen(true)}
            onToggleCancel={toggleCancel}
            isTogglingCancel={mCancelRestore.isPending}
          />

          <SessionParticipantsCard
            filteredParticipants={filteredStudents}
            onAddParticipant={() => setAddDialogOpen(true)}
            onTogglePresence={togglePresence}
            onOpenExercises={openExerciseDialog}
            onRemoveParticipant={(studentId: string) => {
              const name = students.find(s => s.studentId === studentId)?.studentName || studentId
              setRemoveStudentConfirm({ id: studentId, name })
            }}
            onToggleExerciseDone={toggleExerciseDone}
            onDeleteExercise={(exerciseRecordId: string) => {
              let exerciseName = exerciseRecordId
              for (const p of students) {
                const ex = (p.participantExercises ?? []).find(e => e.id === exerciseRecordId)
                if (ex) { exerciseName = ex.exerciseName || ex.exerciseId || exerciseName; break }
              }
              setRemoveExerciseConfirm({ id: exerciseRecordId, name: exerciseName })
            }}
          />
        </div>

        <SessionAddParticipantDialog
          open={addDialogOpen}
          onOpenChange={setAddDialogOpen}
          onClose={() => setAddDialogOpen(false)}
          excludedStudentIds={excludedIds}
          onSelect={handleStudentSelect}
        />

        <SessionExerciseDialog
          open={isExerciseOpen}
          selectedStudentName={selectedStudentName}
          form={registerExerciseForm}
          searchTerm={exerciseSearchTerm}
          onSearchTermChange={setExerciseSearchTerm}
          filteredExercises={filteredExercises}
          shouldShowExerciseList={shouldShowExerciseList}
          selectedExerciseId={selectedExerciseId}
          selectedExerciseLabel={selectedExercise?.name}
          onSelectExercise={(exerciseId) => registerExerciseForm.setValue("exerciseId", exerciseId)}
          onToggleExerciseList={setIsExerciseListOpen}
          onSubmit={submitExercise}
          onRequestCreateExercise={openCreateExercise}
          onClose={closeExerciseDialog}
        />

        <SessionCreateExerciseDialog
          open={isCreateExerciseOpen}
          form={createExerciseForm}
          onSubmit={createExerciseAndUse}
          onClose={closeCreateExerciseDialog}
        />

        <SessionTrainerDialog
          open={isEditClassOpen}
          trainers={trainers}
          value={editTrainer}
          onValueChange={setEditTrainer}
          onSubmit={saveTrainer}
          onClose={() => setIsEditClassOpen(false)}
        />

        {/* Confirm Remove Student AlertDialog */}
        <AlertDialog open={!!removeStudentConfirm} onOpenChange={(open) => !open && setRemoveStudentConfirm(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Deseja remover este aluno da aula?</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja remover <strong>{removeStudentConfirm?.name}</strong> desta aula? Todos os exercícios registrados para este aluno nesta aula também serão removidos.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={async () => { if (removeStudentConfirm) { await removeStudent(removeStudentConfirm.id); setRemoveStudentConfirm(null) } }} className="bg-red-600 hover:bg-red-700">
                Remover
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Confirm Remove Exercise AlertDialog */}
        <AlertDialog open={!!removeExerciseConfirm} onOpenChange={(open) => !open && setRemoveExerciseConfirm(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remover exercício?</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja remover o exercício <strong>{removeExerciseConfirm?.name}</strong>? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={async () => { if (removeExerciseConfirm) { await deleteExercise(removeExerciseConfirm.id); setRemoveExerciseConfirm(null) } }} className="bg-red-600 hover:bg-red-700">
                Remover
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

      </div>
    </Layout>
  )
}
