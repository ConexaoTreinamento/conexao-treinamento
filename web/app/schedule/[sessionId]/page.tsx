"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import Layout from "@/components/layout"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ArrowLeft, Activity, Calendar, CheckCircle, Edit, Save, X, XCircle } from "lucide-react"
import { apiClient } from "@/lib/client"
import { Checkbox } from "@/components/ui/checkbox"
import { getScheduleOptions, getSessionOptions, findAllTrainersOptions, updateTrainerMutation, updatePresenceMutation, removeParticipantMutation, addParticipantMutation, addExerciseMutation, updateExerciseMutation, removeExerciseMutation, findAll1Options } from "@/lib/api-client/@tanstack/react-query.gen"
import { useStudents } from "@/lib/hooks/student-queries"

interface ParticipantExercise { id?:string; exerciseId?:string; exerciseName?:string; setsCompleted?:number; repsCompleted?:number; weightCompleted?:number; exerciseNotes?:string; done?: boolean }
interface SessionParticipant { studentId:string; studentName?:string; present?:boolean; commitmentStatus?: 'ATTENDING' | 'NOT_ATTENDING' | 'TENTATIVE'; participantExercises?:ParticipantExercise[] }
interface SessionData { sessionId:string; seriesName:string; trainerId?:string; trainerName?:string; startTime?:string; endTime?:string; notes?:string; canceled?:boolean; students?:SessionParticipant[]; maxParticipants?:number }

export default function ClassDetailPage() {
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
  const sessionQuery = useQuery({ ...getSessionOptions({ client: apiClient, path:{ sessionId }, query:{ trainerId: hintedTrainer } }) })
  const session = sessionQuery.data as SessionData | undefined

  // Fallback lookup by day (when deep-linking with only date hints)
  const needFallback = !!hintedDate && (!!sessionQuery.error || !sessionQuery.data)
  useQuery({
    ...getScheduleOptions({ client: apiClient, query:{ startDate: hintedDate || '', endDate: hintedDate || '' } }),
    enabled: needFallback
  })

  // Trainers
  const trainersQuery = useQuery({ ...findAllTrainersOptions({ client: apiClient }) })

  // Students (for Add Student dialog) with pagination similar to Students page
  const [studentSearchTerm, setStudentSearchTerm] = useState("")
  const [studentPage, setStudentPage] = useState(0)
  const pageSize = 10
  const studentsQuery = useStudents({ search: studentSearchTerm || undefined, page: studentPage, pageSize })
  const pageData = (studentsQuery.data as any) || {}
  const allStudents = (pageData.content || []) as Array<{id?:string; name?:string; surname?:string}>
  useEffect(()=> { setStudentPage(0) }, [studentSearchTerm])

  // Exercises catalog (for exercise selection)
  const exercisesQuery = useQuery({ ...findAll1Options({ client: apiClient, query: { pageable: { page:0, size: 200 } as any } }) })
  const allExercises = ((exercisesQuery.data as any)?.content || []) as Array<{id?:string; name?:string}>

  // Local UI state derived from session
  const [participants, setParticipants] = useState<SessionParticipant[]>([])
  const [isExerciseOpen, setIsExerciseOpen] = useState(false)
  const [isEditClassOpen, setIsEditClassOpen] = useState(false)
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null)
  const [exerciseSearchTerm, setExerciseSearchTerm] = useState("")
  const [editTrainer, setEditTrainer] = useState<string>("none")
  const [addDialogOpen, setAddDialogOpen] = useState(false)

  // Exercise form
  const [exerciseForm, setExerciseForm] = useState({ exerciseId: "", sets: "", reps: "", weight: "", notes: "" })

  useEffect(() => {
  if (session) {
      setParticipants((session.students||[]).map(s => ({
        ...s,
        present: s.present ?? (s.commitmentStatus === 'ATTENDING'),
        participantExercises: s.participantExercises || []
      })))
      setEditTrainer(session.trainerId || "none")
    }
  }, [session])

  // Mutations
  const mUpdateTrainer = useMutation(updateTrainerMutation())
  const mPresence = useMutation(updatePresenceMutation())
  const mRemoveParticipant = useMutation(removeParticipantMutation())
  const mAddParticipant = useMutation(addParticipantMutation())
  const mAddExercise = useMutation(addExerciseMutation())
  const mUpdateExercise = useMutation(updateExerciseMutation())
  const mRemoveExercise = useMutation(removeExerciseMutation())

  const invalidate = () => qc.invalidateQueries({ queryKey: getSessionOptions({ client: apiClient, path:{ sessionId } }).queryKey })

  const togglePresence = async (sid: string) => {
    if (!session) return
    const current = participants.find(p=> p.studentId===sid)?.present ?? true
    setParticipants(prev => prev.map(p => p.studentId===sid ? ({ ...p, present: !current }) : p))
    await mPresence.mutateAsync({ client: apiClient, path:{ sessionId: session.sessionId, studentId: sid }, body:{ present: !current } })
    invalidate()
  }

  const removeStudent = async (sid: string) => {
    if (!session) return
    await mRemoveParticipant.mutateAsync({ client: apiClient, path:{ sessionId: session.sessionId, studentId: sid } })
    invalidate()
  }

  const addStudent = async (studentId: string) => {
    if (!session) return
    // Optimistic UI: mark as present by default
    setParticipants(prev => {
      const exists = prev.some(p => p.studentId === studentId)
      if (exists) return prev
      const name = (pageData.content || []).find((s:any)=> s.id===studentId)
      return [...prev, { studentId, studentName: name? `${name.name||''} ${name.surname||''}`.trim() : studentId, present: true, participantExercises: [] }]
    })
    await mAddParticipant.mutateAsync({ client: apiClient, path:{ sessionId: session.sessionId }, body:{ studentId } })
    // Ensure presence true also persisted (if backend doesn't default);
    try { await mPresence.mutateAsync({ client: apiClient, path:{ sessionId: session.sessionId, studentId }, body:{ present: true } }) } catch {}
    invalidate()
  }

  const openExerciseDialog = (sid: string) => {
    setSelectedStudentId(sid)
    setIsExerciseOpen(true)
    setExerciseForm({ exerciseId: "", sets: "", reps: "", weight: "", notes: "" })
  }

  const submitExercise = async () => {
    if (!session || !selectedStudentId || !exerciseForm.exerciseId) return
    await mAddExercise.mutateAsync({ client: apiClient, path:{ sessionId: session.sessionId, studentId: selectedStudentId }, body:{
      exerciseId: exerciseForm.exerciseId,
      setsCompleted: exerciseForm.sets ? parseInt(exerciseForm.sets) : undefined,
      repsCompleted: exerciseForm.reps ? parseInt(exerciseForm.reps) : undefined,
      weightCompleted: exerciseForm.weight ? parseFloat(exerciseForm.weight) : undefined,
      exerciseNotes: exerciseForm.notes || undefined
    } })
    setIsExerciseOpen(false)
    setSelectedStudentId(null)
    invalidate()
  }

  const deleteExercise = async (exerciseRecordId: string) => {
    if (!session) return
    await mRemoveExercise.mutateAsync({ client: apiClient, path:{ exerciseRecordId } })
    invalidate()
  }

  const toggleExerciseDone = async (studentId: string, exerciseRecordId: string, currentDone: boolean) => {
    // optimistic flip in local UI
    setParticipants(prev => prev.map(p => p.studentId === studentId ? {
      ...p,
      participantExercises: (p.participantExercises || []).map(ex => ex.id === exerciseRecordId ? { ...ex, done: !currentDone } : ex)
    } : p))
    await mUpdateExercise.mutateAsync({ client: apiClient, path:{ exerciseRecordId }, body:{ done: !currentDone } })
    invalidate()
  }

  const saveTrainer = async () => {
    if (!session) return
    const mapped = editTrainer === 'none' ? undefined : editTrainer
    await mUpdateTrainer.mutateAsync({ client: apiClient, path:{ sessionId: session.sessionId }, body:{ trainerId: mapped } })
    setIsEditClassOpen(false)
    invalidate()
  }

  if (sessionQuery.isLoading) return <Layout><div className="p-6 text-sm">Carregando...</div></Layout>
  if (sessionQuery.error || !session) return <Layout><div className="p-6 text-sm text-red-600">Sessão não encontrada.</div></Layout>

  // Derived
  const filteredStudents = participants.filter(s => ((s.studentName || s.studentId || '').toLowerCase()).includes(studentSearchTerm.toLowerCase()))
  const excludedIds = new Set((participants||[]).map(p => p.studentId))
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
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Informações da Aula
                </CardTitle>
                <Button size="sm" variant="outline" onClick={() => setIsEditClassOpen(true)} className="h-8 px-2">
                  <Edit className="w-3 h-3 mr-1" />
                  Editar
                </Button>
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
                    {(participants||[]).length}/{session.maxParticipants || participants.length} alunos
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
                <Button variant="outline" size="sm" onClick={() => setAddDialogOpen(true)}>Adicionar Aluno</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Search Input */}
                <div>
                  <Label htmlFor="studentSearch">Buscar Aluno</Label>
                  <Input id="studentSearch" placeholder="Digite o nome do aluno..." value={studentSearchTerm} onChange={(e)=> setStudentSearchTerm(e.target.value)} />
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
                      </div>
                      <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                        <div className="flex gap-2 w-full sm:w-auto">
                          <Button size="sm" variant={student.present ? "default" : "outline"} onClick={() => togglePresence(student.studentId)} className={`w-full sm:w-28 h-8 text-xs ${student.present? 'bg-green-600 hover:bg-green-700' : 'border-red-300 text-red-600 hover:bg-red-50 dark:border-red-600 dark:text-red-400 dark:hover:bg-red-950'}`}>
                            {student.present ? (<><CheckCircle className="w-3 h-3 mr-1" />Presente</>) : (<><XCircle className="w-3 h-3 mr-1" />Ausente</>)}
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => openExerciseDialog(student.studentId)} className="w-full sm:w-28 h-8 text-xs">
                            <Activity className="w-3 h-3 mr-1" />Exercícios
                          </Button>
                        </div>
                        <Button size="sm" variant="ghost" onClick={() => removeStudent(student.studentId)} className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950 flex-shrink-0">
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Student Exercises */}
                    {(student.participantExercises||[]).length > 0 && (
                      <div className="space-y-2 pt-2 border-t">
                        <p className="text-sm font-medium">Exercícios registrados:</p>
                        <div className="space-y-1">
                          {(student.participantExercises||[]).map((ex) => (
                            <div key={ex.id} className="flex items-center justify-between p-2 bg-muted/50 rounded text-sm gap-2">
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <Checkbox checked={!!ex.done} onCheckedChange={(v)=> ex.id && toggleExerciseDone(student.studentId, ex.id, !!ex.done)} aria-label="Marcar como concluído" />
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
                    <Button variant="outline" size="sm" onClick={() => setStudentSearchTerm("") } className="mt-2">Limpar filtro</Button>
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
                <Input placeholder="Buscar aluno..." value={studentSearchTerm} onChange={(e)=> setStudentSearchTerm(e.target.value)} />
              </div>
              <div className="max-h-60 overflow-y-auto space-y-2">
                {(availableStudents||[]).filter(s=> (`${s.name||''} ${s.surname||''}`.trim().toLowerCase().includes(studentSearchTerm.toLowerCase())) ).map(s => (
                  <div key={s.id} className="flex items-center justify-between p-2 rounded border hover:bg-muted/50 cursor-pointer" onClick={() => s.id && addStudent(s.id)}>
                    <span className="text-sm">{`${s.name||''} ${s.surname||''}`.trim()}</span>
                    <Button size="sm" variant="outline">Adicionar</Button>
                  </div>
                ))}
                {availableStudents.length===0 && <div className="text-center text-sm text-muted-foreground py-6">Nenhum aluno disponível.</div>}
              </div>
              <div className="flex items-center justify-between pt-2">
                <Button size="sm" variant="outline" disabled={studentPage<=0 || studentsQuery.isFetching} onClick={()=> setStudentPage(p=> Math.max(0, p-1))}>Anterior</Button>
                <span className="text-xs text-muted-foreground">Página {studentPage + 1} de {Math.max(1, (pageData.totalPages ?? 1))}</span>
                <Button size="sm" variant="outline" disabled={(studentPage+1)>= (pageData.totalPages ?? 1) || studentsQuery.isFetching} onClick={()=> setStudentPage(p=> p+1)}>Próxima</Button>
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
              <DialogTitle>Registrar Exercício</DialogTitle>
              <DialogDescription>Adicione um exercício realizado pelo aluno</DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div className="space-y-1">
                <Label>Exercício</Label>
                <div className="space-y-2">
                  <Input placeholder="Buscar exercício..." value={exerciseSearchTerm} onChange={(e)=> setExerciseSearchTerm(e.target.value)} />
                  <div className="max-h-48 overflow-y-auto border rounded">
                    {(filteredExercises||[]).map(ex => (
                      <button key={ex.id} type="button" className={`w-full text-left px-3 py-2 text-sm cursor-pointer hover:bg-muted ${exerciseForm.exerciseId===ex.id? 'bg-muted':''}`} onClick={(e)=> { e.preventDefault(); setExerciseForm(prev => ({ ...prev, exerciseId: ex.id || '' })); }}>
                        {ex.name}
                      </button>
                    ))}
                    {filteredExercises.length===0 && <div className="text-center text-sm text-muted-foreground py-4">Nenhum exercício encontrado</div>}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label>Séries</Label>
                  <Input type="number" value={exerciseForm.sets} onChange={(e)=> setExerciseForm(prev => ({ ...prev, sets: e.target.value }))} placeholder="3" />
                </div>
                <div className="space-y-1">
                  <Label>Repetições</Label>
                  <Input type="number" value={exerciseForm.reps} onChange={(e)=> setExerciseForm(prev => ({ ...prev, reps: e.target.value }))} placeholder="10" />
                </div>
                <div className="space-y-1">
                  <Label>Carga (kg)</Label>
                  <Input type="number" step="0.5" value={exerciseForm.weight} onChange={(e)=> setExerciseForm(prev => ({ ...prev, weight: e.target.value }))} placeholder="20" />
                </div>
              </div>
              <div className="space-y-1">
                <Label>Notas</Label>
                <Input value={exerciseForm.notes} onChange={(e)=> setExerciseForm(prev => ({ ...prev, notes: e.target.value }))} placeholder="Observações do exercício..." />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={()=> setIsExerciseOpen(false)}>Cancelar</Button>
              <Button onClick={submitExercise} className="bg-green-600 hover:bg-green-700"><Save className="w-4 h-4 mr-2" />Registrar</Button>
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
