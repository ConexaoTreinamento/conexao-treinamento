"use client"

import { Suspense, useEffect, useMemo, useState } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import Layout from "@/components/layout"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ArrowLeft, Activity, Calendar, CheckCircle, Edit, Save, X, XCircle, Plus } from "lucide-react"
import { apiClient } from "@/lib/client"
import { Checkbox } from "@/components/ui/checkbox"
import { getScheduleOptions, getSessionOptions, findAllTrainersOptions, updatePresenceMutation, getScheduleQueryKey, findAllExercisesOptions, updateRegisteredParticipantExerciseMutation, addRegisteredParticipantExerciseMutation, removeRegisteredParticipantExerciseMutation, updateSessionTrainerMutation, removeSessionParticipantMutation, addSessionParticipantMutation, cancelOrRestoreSessionMutation, createExerciseMutation } from "@/lib/api-client/@tanstack/react-query.gen"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useStudents } from "@/lib/hooks/student-queries"
import type { ExerciseResponseDto, PageExerciseResponseDto, PageStudentResponseDto, SessionResponseDto, StudentCommitmentResponseDto, TrainerResponseDto, ScheduleResponseDto } from "@/lib/api-client"
import { useForm } from "react-hook-form"

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

  // Query session (with hint for trainer if provided)
  const hintedDate = searchParams.get('date') || undefined
  const hintedTrainer = searchParams.get('trainer') || undefined
  const sessionOptions = getSessionOptions({ client: apiClient, path:{ sessionId }, query:{ trainerId: hintedTrainer } })
  const sessionQuery = useQuery({ ...sessionOptions })
  const session = sessionQuery.data as SessionResponseDto | undefined

  // Fallback lookup by day (when deep-linking with only date hints)
  const needFallback = !!hintedDate && (!!sessionQuery.error || !sessionQuery.data)
  useQuery({
    ...getScheduleOptions({ client: apiClient, query:{ startDate: hintedDate || '', endDate: hintedDate || '' } }),
    enabled: needFallback
  })

  // Trainers
  const trainersQuery = useQuery({ ...findAllTrainersOptions({ client: apiClient }) })

  // Students (for Add Student dialog) with pagination similar to Students page
  const [participantSearchTerm, setParticipantSearchTerm] = useState("")
  const [availableStudentSearchTerm, setAvailableStudentSearchTerm] = useState("")
  const [studentPage, setStudentPage] = useState(0)
  const pageSize = 10
  const studentsQuery = useStudents({ search: availableStudentSearchTerm || undefined, page: studentPage, pageSize })
  const pageData = (studentsQuery.data as PageStudentResponseDto | undefined)
  const allStudents: Array<{ id?: string; name?: string; surname?: string }> = pageData?.content ?? []
  useEffect(()=> { setStudentPage(0) }, [availableStudentSearchTerm])

  // Exercises catalog (for exercise selection)
  const exercisesQuery = useQuery({ ...findAllExercisesOptions({ client: apiClient, query: { pageable: { page:0, size: 200 } } }) })
  const allExercises: ExerciseResponseDto[] = ((exercisesQuery.data as PageExerciseResponseDto | undefined)?.content) ?? []

  // Local UI state derived from session
  const [isExerciseOpen, setIsExerciseOpen] = useState(false)
  const [isEditClassOpen, setIsEditClassOpen] = useState(false)
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null)
  const [exerciseSearchTerm, setExerciseSearchTerm] = useState("")
  const [editTrainer, setEditTrainer] = useState<string>("none")
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [isCreateExerciseOpen, setIsCreateExerciseOpen] = useState(false)

  useEffect(() => {
    if (addDialogOpen) return
    setAvailableStudentSearchTerm("")
    setStudentPage(0)
  }, [addDialogOpen])

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

  // Mutations
  const mUpdateTrainer = useMutation(updateSessionTrainerMutation())
  const mPresence = useMutation(updatePresenceMutation())
  const mRemoveParticipant = useMutation(removeSessionParticipantMutation())
  const mAddParticipant = useMutation(addSessionParticipantMutation())
  const mAddExercise = useMutation(addRegisteredParticipantExerciseMutation())
  const mUpdateExercise = useMutation(updateRegisteredParticipantExerciseMutation())
  const mRemoveExercise = useMutation(removeRegisteredParticipantExerciseMutation())
  const mCancelRestore = useMutation(cancelOrRestoreSessionMutation())
  const mCreateExercise = useMutation(createExerciseMutation())

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
    qc.invalidateQueries({ queryKey: getScheduleQueryKey({ client: apiClient, query: { startDate: monthStartIso, endDate: monthEndIso } }) })
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
    qc.invalidateQueries({ queryKey: getScheduleQueryKey({ client: apiClient, query: { startDate: recentStart, endDate: recentEnd } }) })
    // Fallback: broadly invalidate all schedule queries regardless of date ranges to avoid key mismatches due to timezone/date formatting differences
    qc.invalidateQueries({
      predicate: (q) => {
        const k0 = (q.queryKey as any)?.[0]
        return k0 && typeof k0 === 'object' && k0._id === 'getSchedule'
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
          const k0 = (q.queryKey as any)?.[0]
          return k0 && typeof k0 === 'object' && k0._id === 'getSession' && k0.path?.sessionId === sessionId
        }
      })
    }
    invalidateScheduleForSessionMonth()
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
    await mPresence.mutateAsync({ client: apiClient, path:{ sessionId: session.sessionId!, studentId: sid }, body:{ present: !current } })
    invalidate()
  }

  const removeStudent = async (sid: string) => {
    if (!session) return
    // Optimistic remove from cache
    qc.setQueryData<SessionResponseDto>(sessionOptions.queryKey, (old) => {
      if (!old) return old
      return { ...old, students: (old.students ?? []).filter(s => s.studentId !== sid) }
    })
  await mRemoveParticipant.mutateAsync({ client: apiClient, path:{ sessionId: session.sessionId!, studentId: sid } })
    invalidate()
  }

  const addStudent = async (studentId: string) => {
    if (!session) return
    // Optimistic add to cache
    qc.setQueryData<SessionResponseDto>(sessionOptions.queryKey, (old) => {
      if (!old) return old
      const exists = (old.students ?? []).some(p => p.studentId === studentId)
      if (exists) return old
      const found = (pageData?.content ?? []).find(s => s.id === studentId)
      const studentName = found ? `${found.name ?? ''} ${found.surname ?? ''}`.trim() : studentId
      const newEntry: StudentCommitmentResponseDto = { studentId, studentName, present: true, commitmentStatus: 'ATTENDING', participantExercises: [] }
      return { ...old, students: [...(old.students ?? []), newEntry] }
    })
  await mAddParticipant.mutateAsync({ client: apiClient, path:{ sessionId: session.sessionId! }, body:{ studentId } })
    // Ensure presence true also persisted (if backend doesn't default);
  try { await mPresence.mutateAsync({ client: apiClient, path:{ sessionId: session.sessionId!, studentId }, body:{ present: true } }) } catch {}
    invalidate()
  }

  const openExerciseDialog = (sid: string) => {
    setSelectedStudentId(sid)
    setIsExerciseOpen(true)
    registerExerciseForm.reset({ exerciseId: "", sets: "", reps: "", weight: "", notes: "" })
  }

  const openCreateExercise = () => {
    createExerciseForm.reset({ name: "", description: "" })
    setIsCreateExerciseOpen(true)
  }

  const addToExercisesCaches = (ex: ExerciseResponseDto) => {
    const entries = qc.getQueriesData<import("@/lib/api-client").PageExerciseResponseDto>({
      predicate: (q) => {
        const k0 = (q.queryKey as any)?.[0]
        return k0 && typeof k0 === 'object' && k0._id === 'findAllExercises'
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
    const created = await mCreateExercise.mutateAsync({ client: apiClient, body: { name, description } })
    // Update local caches so it appears in the list
    addToExercisesCaches(created)
    // Select it in the register exercise modal
    registerExerciseForm.setValue("exerciseId", created.id || "")
    setIsCreateExerciseOpen(false)
  })

  const submitExercise = registerExerciseForm.handleSubmit(async (values) => {
    if (!session || !selectedStudentId || !values.exerciseId) return
    await mAddExercise.mutateAsync({ client: apiClient, path:{ sessionId: session.sessionId!, studentId: selectedStudentId! }, body:{
      exerciseId: values.exerciseId,
      setsCompleted: values.sets ? parseInt(values.sets) : undefined,
      repsCompleted: values.reps ? parseInt(values.reps) : undefined,
      weightCompleted: values.weight ? parseFloat(values.weight) : undefined,
      exerciseNotes: values.notes || undefined
    } })
    setIsExerciseOpen(false)
    setSelectedStudentId(null)
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
    await mRemoveExercise.mutateAsync({ client: apiClient, path:{ exerciseRecordId } })
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
    await mUpdateExercise.mutateAsync({ client: apiClient, path:{ exerciseRecordId }, body:{ done: !currentDone } })
    invalidate()
  }

  const saveTrainer = async () => {
    if (!session) return
    const mapped = editTrainer === 'none' ? undefined : editTrainer
  await mUpdateTrainer.mutateAsync({ client: apiClient, path:{ sessionId: session.sessionId! }, body:{ trainerId: mapped } })
    setIsEditClassOpen(false)
    invalidate()
  }

  const toggleCancel = async () => {
    if (!session) return
  await mCancelRestore.mutateAsync({ client: apiClient, path: { sessionId: session.sessionId! }, body: { cancel: !session.canceled } })
    invalidate()
  }

  if (sessionQuery.isLoading) return <Layout><div className="p-6 text-sm">Carregando...</div></Layout>
  if (sessionQuery.error || !session) return <Layout><div className="p-6 text-sm text-red-600">Sessão não encontrada.</div></Layout>

  // Derived
  const students: StudentCommitmentResponseDto[] = (session.students ?? []).map(s => ({
    ...s,
    present: s.present ?? (s.commitmentStatus === 'ATTENDING'),
    participantExercises: s.participantExercises ?? []
  }))
  const filteredStudents = students.filter(s => ((s.studentName || s.studentId || '').toLowerCase()).includes(participantSearchTerm.toLowerCase()))
  const excludedIds = new Set((students||[]).map(p => p.studentId).filter(Boolean) as string[])
  const availableStudents = (allStudents||[]).filter(s => !!s.id && !excludedIds.has(s.id!))
  const filteredExercises = (allExercises||[]).filter(e => (e.name || '').toLowerCase().includes(exerciseSearchTerm.toLowerCase()))

  return (
    <Layout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold truncate">{session.seriesName}</h1>
            <p className="text-sm text-muted-foreground">
              {session.startTime?.slice(0,10)} • {session.startTime?.slice(11,16)}{session.endTime? ` - ${session.endTime.slice(11,16)}`:''}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Class Info */}
          <Card>
            <CardHeader className="pb-4 sm:pb-5">
              <div className="space-y-2">
                <CardTitle className="text-base sm:text-lg flex items-center gap-2 min-w-0">
                  <Activity className="w-5 h-5 flex-shrink-0" />
                  <span className="truncate">Informações da Aula</span>
                </CardTitle>
                <div className="flex items-center gap-2 flex-wrap">
                  {session.canceled && (
                    <TooltipProvider delayDuration={300}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge variant="destructive" className="text-[10px] flex-shrink-0 cursor-help">Cancelada</Badge>
                        </TooltipTrigger>
                        <TooltipContent>Esta aula foi cancelada</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsEditClassOpen(true)}
                    className="h-8 px-2"
                    aria-label="Editar aula"
                    title="Editar"
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    <span className="hidden sm:inline">Editar</span>
                  </Button>
                  <Button
                    size="sm"
                    variant={session.canceled ? "default" : "destructive"}
                    onClick={toggleCancel}
                    disabled={mCancelRestore.isPending}
                    className="h-8 px-2"
                    aria-label={session.canceled ? "Restaurar aula" : "Cancelar aula"}
                    title={session.canceled ? "Restaurar" : "Cancelar"}
                  >
                    {session.canceled ? (
                      <>
                        <CheckCircle className="w-3 h-3 mr-1" />
                        <span className="hidden sm:inline">Restaurar</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3 h-3 mr-1" />
                        <span className="hidden sm:inline">Cancelar</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>{session.startTime?.slice(0,10)} • {session.startTime?.slice(11,16)}{session.endTime? ` - ${session.endTime.slice(11,16)}`:''}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="w-4 h-4 inline-flex items-center justify-center rounded-full bg-muted text-[10px]">P</span>
                  <span>
                    {(students||[]).length} aluno{(students||[]).length === 1 ? '' : 's'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="w-4 h-4 inline-flex items-center justify-center rounded-full bg-muted text-[10px]">I</span>
                  <span>{session.trainerName || '—'}</span>
                </div>
              </div>

              {session.notes && (
                <div className="pt-3 border-t">
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{session.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Students List */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Alunos da Aula
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => setAddDialogOpen(true)}>
                    Adicionar Aluno
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Search Input */}
                <div>
                  <Label htmlFor="studentSearch">Buscar Aluno</Label>
                  <Input id="studentSearch" placeholder="Digite o nome do aluno..." value={participantSearchTerm} onChange={(e)=> setParticipantSearchTerm(e.target.value)} />
                </div>

                {filteredStudents.map((student) => (
                  <div key={student.studentId} className="p-3 rounded-lg border bg-card">
                    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${student.participantExercises?.length ? 'mb-3' : ''}`}>
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-green-700 dark:text-green-300 font-semibold text-sm select-none">
                            {(student.studentName||'')
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{student.studentName || student.studentId}</p>
                        </div>
                        {/* Remove on small screens next to the name */}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => student.studentId && removeStudent(student.studentId)}
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950 flex-shrink-0 sm:hidden"
                          aria-label="Remover aluno da aula"
                          title="Remover"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                        <div className="flex gap-2 w-full sm:w-auto">
                          <Button size="sm" variant={student.present ? "default" : "outline"} onClick={() => student.studentId && togglePresence(student.studentId)} className={`w-full sm:w-28 h-8 text-xs ${student.present? 'bg-green-600 hover:bg-green-700' : 'border-red-300 text-red-600 hover:bg-red-50 dark:border-red-600 dark:text-red-400 dark:hover:bg-red-950'}`}>
                            {student.present ? (<><CheckCircle className="w-3 h-3 mr-1" />Presente</>) : (<><XCircle className="w-3 h-3 mr-1" />Ausente</>)}
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => student.studentId && openExerciseDialog(student.studentId)} className="w-full sm:w-28 h-8 text-xs">
                            <Activity className="w-3 h-3 mr-1" />Exercícios
                          </Button>
                        </div>
                        <Button size="sm" variant="ghost" onClick={() => student.studentId && removeStudent(student.studentId)} className="hidden sm:flex h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950 flex-shrink-0" aria-label="Remover aluno da aula" title="Remover">
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Student Exercises */}
                    {(student.participantExercises||[]).length > 0 && (
                      <div className="space-y-2 pt-2 border-t">
                        <p className="text-sm font-medium">Exercícios registrados:</p>
                        <div className="space-y-1">
                          {[...((student.participantExercises||[]))].sort((a,b)=> (a.exerciseName||'').localeCompare(b.exerciseName||'')).map((ex) => (
                            <div key={ex.id} className="flex items-center justify-between p-2 bg-muted/50 rounded text-sm gap-2">
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <Checkbox checked={!!ex.done} onCheckedChange={(v)=> ex.id && student.studentId && toggleExerciseDone(student.studentId, ex.id, !!ex.done)} aria-label="Marcar como concluído" />
                                <span className={`flex-1 min-w-0 truncate ${ex.done? 'line-through opacity-70':''}`}>
                                  {ex.exerciseName || ex.exerciseId} {ex.setsCompleted!=null && `- ${ex.setsCompleted}x${ex.repsCompleted ?? ''}`} {ex.weightCompleted!=null && `- ${ex.weightCompleted}kg`}
                                </span>
                              </div>
                              <Button size="sm" variant="ghost" onClick={() => ex.id && deleteExercise(ex.id)} className="h-6 w-6 p-0 flex-shrink-0 ml-2 text-red-500">
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {filteredStudents.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <p className="text-sm">Nenhum aluno encontrado.</p>
                    <Button variant="outline" size="sm" onClick={() => setParticipantSearchTerm("") } className="mt-2">Limpar filtro</Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Add Student Dialog */}
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Adicionar Aluno</DialogTitle>
              <DialogDescription>Selecione um aluno para adicionar à aula</DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Input placeholder="Buscar aluno..." value={availableStudentSearchTerm} onChange={(e)=> setAvailableStudentSearchTerm(e.target.value)} />
              </div>
              <div className="max-h-60 overflow-y-auto space-y-2">
                {(availableStudents||[]).filter(s=> (`${s.name||''} ${s.surname||''}`.trim().toLowerCase().includes(availableStudentSearchTerm.toLowerCase())) ).map(s => (
                  <div key={s.id} className="flex items-center justify-between p-2 rounded border hover:bg-muted/50 cursor-pointer" onClick={() => s.id && addStudent(s.id)}>
                    <span className="text-sm">{`${s.name||''} ${s.surname||''}`.trim()}</span>
                    <Button size="sm" variant="outline">Adicionar</Button>
                  </div>
                ))}
                {availableStudents.length===0 && <div className="text-center text-sm text-muted-foreground py-6">Nenhum aluno disponível.</div>}
              </div>
              <div className="flex items-center justify-between pt-2">
                <Button size="sm" variant="outline" disabled={studentPage<=0 || studentsQuery.isFetching} onClick={()=> setStudentPage(p=> Math.max(0, p-1))}>Anterior</Button>
                <span className="text-xs text-muted-foreground">Página {studentPage + 1} de {Math.max(1, (pageData?.totalPages ?? 1))}</span>
                <Button size="sm" variant="outline" disabled={(studentPage+1)>= (pageData?.totalPages ?? 1) || studentsQuery.isFetching} onClick={()=> setStudentPage(p=> p+1)}>Próxima</Button>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={()=> setAddDialogOpen(false)}>Fechar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Exercise Dialog */}
        <Dialog open={isExerciseOpen} onOpenChange={setIsExerciseOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                Registrar Exercício{selectedStudentId ? ` - ${(students.find(s=> s.studentId===selectedStudentId)?.studentName)||''}`: ''}
              </DialogTitle>
              <DialogDescription>Adicione um exercício realizado pelo aluno</DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div className="space-y-1">
                <Label>Exercício</Label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Input placeholder="Buscar exercício..." value={exerciseSearchTerm} onChange={(e)=> setExerciseSearchTerm(e.target.value)} className="flex-1" />
                    <Button type="button" size="icon" variant="outline" onClick={openCreateExercise} aria-label="Novo exercício" title="Novo exercício">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="max-h-48 overflow-y-auto border rounded">
                    {(filteredExercises||[]).map(ex => {
                      const selected = registerExerciseForm.watch('exerciseId')===ex.id
                      return (
                        <button
                          key={ex.id}
                          type="button"
                          className={`w-full text-left px-3 py-2 text-sm cursor-pointer ${selected ? 'bg-green-600 text-white hover:bg-green-700' : 'hover:bg-muted'} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600`}
                          aria-pressed={selected}
                          onClick={(e)=> { e.preventDefault(); registerExerciseForm.setValue('exerciseId', ex.id || ''); }}
                        >
                          {ex.name}
                        </button>
                      )
                    })}
                    {filteredExercises.length===0 && <div className="text-center text-sm text-muted-foreground py-4">Nenhum exercício encontrado</div>}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label>Séries</Label>
                  <Input type="number" placeholder="3" {...registerExerciseForm.register('sets')} />
                </div>
                <div className="space-y-1">
                  <Label>Repetições</Label>
                  <Input type="number" placeholder="10 ou 30s" {...registerExerciseForm.register('reps')} />
                </div>
                <div className="space-y-1">
                  <Label>Carga (kg)</Label>
                  <Input type="number" step="0.5" placeholder="20" {...registerExerciseForm.register('weight')} />
                </div>
              </div>
              <div className="space-y-1">
                <Label>Notas</Label>
                <Input placeholder="Observações do exercício..." {...registerExerciseForm.register('notes')} />
              </div>
            </div>
            <DialogFooter className="gap-y-2">
              <Button variant="outline" onClick={()=> setIsExerciseOpen(false)}>Cancelar</Button>
              <Button onClick={submitExercise} className="bg-green-600 hover:bg-green-700"><Save className="w-4 h-4 mr-2" />Registrar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Create Exercise Dialog */}
        <Dialog open={isCreateExerciseOpen} onOpenChange={setIsCreateExerciseOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Novo Exercício</DialogTitle>
              <DialogDescription>Crie um novo exercício</DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div className="space-y-1">
                <Label>Nome do Exercício</Label>
                <Input placeholder="Ex: Supino Inclinado" {...createExerciseForm.register('name', { required: true })} />
              </div>
              <div className="space-y-1">
                <Label>Descrição</Label>
                <Input placeholder="Descrição do exercício..." {...createExerciseForm.register('description')} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={()=> setIsCreateExerciseOpen(false)}>Cancelar</Button>
              <Button onClick={createExerciseAndUse} disabled={!createExerciseForm.watch('name')?.trim()} className="bg-green-600 hover:bg-green-700">
                <Save className="w-4 h-4 mr-2" />Criar e Usar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Class Dialog (Trainer) */}
        <Dialog open={isEditClassOpen} onOpenChange={setIsEditClassOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Editar Aula</DialogTitle>
              <DialogDescription>Atualize o instrutor desta instância da aula</DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div className="space-y-1">
                <Label>Instrutor</Label>
                <Select value={editTrainer} onValueChange={setEditTrainer}>
                  <SelectTrigger className="w-full h-9"><SelectValue placeholder="Selecione"/></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">(Sem instrutor)</SelectItem>
                    {(trainersQuery.data||[])
                      .filter((t:any)=> !!t?.id)
                      .map((t:any)=> <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={()=> setIsEditClassOpen(false)}>Cancelar</Button>
              <Button onClick={saveTrainer} className="bg-green-600 hover:bg-green-700"><Save className="w-4 h-4 mr-2" />Salvar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </Layout>
  )
}
