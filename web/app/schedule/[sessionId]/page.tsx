"use client"

import { useParams, useRouter, useSearchParams } from "next/navigation"
import Layout from "@/components/layout"
import { useEffect, useState } from "react"
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { ArrowLeft, CheckCircle, Trash2, XCircle } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { apiClient } from "@/lib/client"
import { getSessionOptions, getScheduleOptions, updateSessionMutation, updateTrainerMutation, cancelOrRestoreMutation, addParticipantMutation, updatePresenceMutation, removeParticipantMutation, addExerciseMutation, updateExerciseMutation, removeExerciseMutation, findAllTrainersOptions } from "@/lib/api-client/@tanstack/react-query.gen"

interface ParticipantExercise { id?:string; exerciseId?:string; exerciseName?:string; setsCompleted?:number; repsCompleted?:number; weightCompleted?:number; exerciseNotes?:string }
interface SessionParticipant { studentId:string; studentName?:string; present?:boolean; participantExercises?:ParticipantExercise[] }
interface SessionData { sessionId:string; seriesName:string; trainerId?:string; trainerName?:string; startTime?:string; endTime?:string; notes?:string; canceled?:boolean; students?:SessionParticipant[]; maxParticipants?:number; presentCount?:number }

export default function SessionDetailPage(){
  const { sessionId: rawSessionId } = useParams<{sessionId:string}>()
  const router = useRouter()
  const searchParams = useSearchParams()
  const qc = useQueryClient()

  const sessionId = (() => {
    // Normalize: decode once if it looks encoded to avoid %25 double-encoding later
    try {
      return rawSessionId?.includes('%') ? decodeURIComponent(rawSessionId) : rawSessionId
    } catch {
      return rawSessionId
    }
  })()

  // Queries
  // Hints from URL to assist backend disambiguation (e.g., trainer-based resolution)
  const hintedDate = searchParams.get('date') || undefined
  const hintedStart = searchParams.get('start') || undefined // HHmm
  const hintedTrainer = searchParams.get('trainer') || undefined
  const sessionQuery = useQuery({ ...getSessionOptions({ client: apiClient, path:{ sessionId }, query: { trainerId: hintedTrainer } }) })
  // Fallback: if session not found but we have hints, try to find canonical by date/start/trainer
  const needFallback = !!hintedDate && (!!sessionQuery.error || !sessionQuery.data)
  const dayLookupQuery = useQuery({
    ...getScheduleOptions({ client: apiClient, query: { startDate: hintedDate || '', endDate: hintedDate || '' } }),
    enabled: needFallback
  })
  const trainersQuery = useQuery({ ...findAllTrainersOptions({ client: apiClient }) })

  // Local UI state
  const [notes, setNotes] = useState('')
  const [trainer, setTrainer] = useState('none')
  const [adding, setAdding] = useState(false)
  const [newStudentId, setNewStudentId] = useState('')
  const [participants, setParticipants] = useState<SessionParticipant[]>([])
  const [expandedStudent, setExpandedStudent] = useState<string | null>(null)
  const [addingExerciseFor, setAddingExerciseFor] = useState<string | null>(null)
  const [newExercise, setNewExercise] = useState({ exerciseId:'', setsCompleted:'', repsCompleted:'', weightCompleted:'', exerciseNotes:'' })
  const [editingExercise, setEditingExercise] = useState<{ studentId:string; exercise:ParticipantExercise } | null>(null)

  const session = sessionQuery.data as SessionData | undefined

  useEffect(()=>{
    if(session){
      // If backend canonical sessionId differs (e.g., series renamed), redirect to canonical URL
      if(session.sessionId && session.sessionId !== sessionId){
        const dateParam = session.startTime ? session.startTime.slice(0,10) : undefined
        const qs = dateParam ? `?date=${dateParam}` : ''
        router.replace(`/schedule/${session.sessionId}${qs}`)
      }
      setNotes(session.notes || '')
  setTrainer(session.trainerId || 'none')
      setParticipants((session.students||[]).map(s=> ({
        ...s,
        // honor backend-provided presence if available
        present: s.present ?? false,
        // carry over any participant-specific exercise records
        participantExercises: s.participantExercises || []
      })))
    }
  }, [session])

  // Mutations
  const mUpdateNotes = useMutation(updateSessionMutation())
  const mUpdateTrainer = useMutation(updateTrainerMutation())
  const mCancel = useMutation(cancelOrRestoreMutation())
  const mAddParticipant = useMutation(addParticipantMutation())
  const mPresence = useMutation(updatePresenceMutation())
  const mRemoveParticipant = useMutation(removeParticipantMutation())
  const mAddExercise = useMutation(addExerciseMutation())
  const mUpdateExercise = useMutation(updateExerciseMutation())
  const mRemoveExercise = useMutation(removeExerciseMutation())

  const invalidate = () => qc.invalidateQueries({ queryKey: getSessionOptions({ client: apiClient, path:{ sessionId } }).queryKey })

  const updateNotes = async ()=> {
    if(!session) return
    await mUpdateNotes.mutateAsync({ client: apiClient, path:{ sessionId: session.sessionId }, body:{ notes } })
    invalidate()
  }
  const updateTrainer = async (tid:string)=> {
    if(!session) return
    setTrainer(tid)
    const mapped = (tid === 'none' || !tid) ? undefined : tid
    await mUpdateTrainer.mutateAsync({ client: apiClient, path:{ sessionId: session.sessionId }, body:{ trainerId: mapped } })
    invalidate()
  }
  const toggleCancel = async ()=> {
    if(!session) return
    await mCancel.mutateAsync({ client: apiClient, path:{ sessionId: session.sessionId }, body:{ cancel: !session.canceled } })
    invalidate()
  }
  const togglePresence = async (sid:string, present:boolean)=> {
    if(!session) return
    setParticipants(p=> p.map(sp=> sp.studentId===sid? {...sp, present}: sp))
    await mPresence.mutateAsync({ client: apiClient, path:{ sessionId: session.sessionId, studentId: sid }, body:{ present } })
    invalidate()
  }
  const addStudent = async ()=> {
    if(!session || !newStudentId) return
    await mAddParticipant.mutateAsync({ client: apiClient, path:{ sessionId: session.sessionId }, body:{ studentId: newStudentId } })
    setNewStudentId('')
    setAdding(false)
    invalidate()
  }
  const removeStudent = async (sid:string)=> {
    if(!session) return
    await mRemoveParticipant.mutateAsync({ client: apiClient, path:{ sessionId: session.sessionId, studentId: sid } })
    invalidate()
  }

  // Exercise helpers
  const startAddExercise = (studentId:string)=> {
    setAddingExerciseFor(studentId)
    setNewExercise({ exerciseId:'', setsCompleted:'', repsCompleted:'', weightCompleted:'', exerciseNotes:'' })
  }
  const submitAddExercise = async ()=> {
    if(!session || !addingExerciseFor) return
    const body:any = {}
    if(newExercise.exerciseId) body.exerciseId = newExercise.exerciseId
    if(newExercise.setsCompleted) body.setsCompleted = parseInt(newExercise.setsCompleted)
    if(newExercise.repsCompleted) body.repsCompleted = parseInt(newExercise.repsCompleted)
    if(newExercise.weightCompleted) body.weightCompleted = parseFloat(newExercise.weightCompleted)
    if(newExercise.exerciseNotes) body.exerciseNotes = newExercise.exerciseNotes
    await mAddExercise.mutateAsync({ client: apiClient, path:{ sessionId: session.sessionId, studentId: addingExerciseFor }, body })
    setAddingExerciseFor(null)
    invalidate()
  }
  const startEditExercise = (studentId:string, ex:ParticipantExercise)=> {
    setEditingExercise({ studentId, exercise: ex })
    setNewExercise({
      exerciseId: ex.exerciseId || '',
      setsCompleted: ex.setsCompleted?.toString() || '',
      repsCompleted: ex.repsCompleted?.toString() || '',
      weightCompleted: ex.weightCompleted?.toString() || '',
      exerciseNotes: ex.exerciseNotes || ''
    })
  }
  const submitEditExercise = async ()=> {
    if(!session || !editingExercise || !editingExercise.exercise.id) return
    const body:any = {}
    if(newExercise.exerciseId) body.exerciseId = newExercise.exerciseId
    body.setsCompleted = newExercise.setsCompleted? parseInt(newExercise.setsCompleted): undefined
    body.repsCompleted = newExercise.repsCompleted? parseInt(newExercise.repsCompleted): undefined
    body.weightCompleted = newExercise.weightCompleted? parseFloat(newExercise.weightCompleted): undefined
    body.exerciseNotes = newExercise.exerciseNotes || undefined
  await mUpdateExercise.mutateAsync({ client: apiClient, path:{ exerciseRecordId: editingExercise.exercise.id! }, body })
    setEditingExercise(null)
    invalidate()
  }
  const removeExercise = async (participantExerciseId:string)=> {
    if(!session) return
  await mRemoveExercise.mutateAsync({ client: apiClient, path:{ exerciseRecordId: participantExerciseId } })
    invalidate()
  }

  if(sessionQuery.isLoading) return <Layout><div className="p-6 text-sm">Carregando...</div></Layout>
  if(sessionQuery.error || !session) return <Layout><div className="p-6 text-sm text-red-600">Sessão não encontrada.</div></Layout>

  return <Layout>
    <div className="space-y-5">
      <div className="flex items-center gap-3 flex-wrap">
        <Button size="icon" variant="ghost" onClick={()=> router.back()}><ArrowLeft className="w-4 h-4"/></Button>
        <h1 className="text-xl font-bold flex items-center gap-3">Aula • {session.seriesName}{session.canceled && <Badge variant="destructive">Cancelada</Badge>}</h1>
        <div className="ml-auto flex gap-2">
          <Button size="sm" variant={session.canceled? 'secondary':'outline'} onClick={toggleCancel}>{session.canceled? 'Restaurar':'Cancelar'}</Button>
        </div>
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        <Card className="order-1">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Instrutor</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <Select value={trainer} onValueChange={updateTrainer}>
              <SelectTrigger className="w-full h-9"><SelectValue placeholder="Selecione"/></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">(Sem instrutor)</SelectItem>
                {(trainersQuery.data||[])
                  .filter((t:any)=> !!t?.id)
                  .map((t:any)=> <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <p className="text-[10px] text-muted-foreground">Alterar o instrutor afeta apenas esta instância.</p>
          </CardContent>
        </Card>
        <Card className="order-3 md:order-2">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Anotações</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Textarea value={notes} onChange={e=> setNotes(e.target.value)} placeholder="Observações" className="min-h-[120px]" />
            <div className="flex justify-end">
                  <Button size="sm" onClick={updateNotes} disabled={mUpdateNotes.isPending} className="bg-green-600 hover:bg-green-700">{mUpdateNotes.isPending? 'Salvando...':'Salvar'}</Button>
            </div>
          </CardContent>
        </Card>
        <Card className="order-2 md:order-3 md:row-span-2">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold flex items-center gap-2">Participantes <Badge variant="outline" className="font-normal text-[10px] ml-2">{participants.length} / {session.maxParticipants || participants.length}</Badge></CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {participants.map(p=> (
                <div key={p.studentId} className="rounded border bg-background/60">
                  <div className="flex items-center gap-2 p-2">
                    <Checkbox checked={p.present} onCheckedChange={v=> togglePresence(p.studentId, !!v)} />
                    <button className="flex-1 min-w-0 text-left text-sm font-medium truncate" onClick={()=> setExpandedStudent(s=> s===p.studentId? null: p.studentId)}>
                      {p.studentName || p.studentId}
                    </button>
                    <Badge variant={p.present? 'default':'outline'} className="text-[10px] flex items-center gap-1">{p.present? <CheckCircle className="w-3 h-3"/>:<XCircle className="w-3 h-3"/>}{p.present? 'Presente':'Ausente'}</Badge>
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={()=> removeStudent(p.studentId)}><Trash2 className="w-4 h-4"/></Button>
                  </div>
                  {expandedStudent===p.studentId && (
                    <div className="px-3 pb-3 space-y-2 border-t pt-2 bg-muted/30">
                      <div className="flex justify-between items-center">
                        <span className="text-[11px] font-semibold text-muted-foreground uppercase">Exercícios</span>
                        <Button size="sm" variant="outline" className="h-6 text-[10px] px-2" onClick={()=> startAddExercise(p.studentId)}>Adicionar</Button>
                      </div>
                      <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                        {(p.participantExercises||[]).map(ex=> (
                          <div key={ex.id} className="p-2 rounded border bg-background/70 text-[11px] space-y-1">
                            <div className="flex items-center justify-between gap-2">
                              <div className="font-medium truncate flex-1">{ex.exerciseName || ex.exerciseId || 'Exercício'}</div>
                              <div className="flex gap-1">
                                <Button size="sm" variant="ghost" className="h-6 px-2" onClick={()=> startEditExercise(p.studentId, ex)}>Editar</Button>
                                <Button size="sm" variant="ghost" className="h-6 px-2" onClick={()=> ex.id && removeExercise(ex.id)} disabled={mRemoveExercise.isPending}>Remover</Button>
                              </div>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-[10px]">
                              {ex.setsCompleted!=null && <span>Series: {ex.setsCompleted}</span>}
                              {ex.repsCompleted!=null && <span>Reps: {ex.repsCompleted}</span>}
                              {ex.weightCompleted!=null && <span>Carga: {ex.weightCompleted}</span>}
                            </div>
                            {ex.exerciseNotes && <p className="text-[10px] text-muted-foreground whitespace-pre-wrap">{ex.exerciseNotes}</p>}
                          </div>
                        ))}
                        {(p.participantExercises||[]).length===0 && <p className="text-[10px] text-muted-foreground">Nenhum exercício.</p>}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {participants.length===0 && <p className="text-xs text-muted-foreground">Sem participantes.</p>}
            </div>
            <Dialog open={adding} onOpenChange={setAdding}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="w-full justify-center">Adicionar Aluno</Button>
              </DialogTrigger>
              <DialogContent className="max-w-sm">
                <DialogHeader><DialogTitle>Adicionar Aluno</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <Input placeholder="ID do aluno" value={newStudentId} onChange={e=> setNewStudentId(e.target.value)} />
                  <Button size="sm" onClick={addStudent} disabled={!newStudentId}>Adicionar</Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
        {(addingExerciseFor || editingExercise) && (
          <Card className="order-4 border-dashed">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">{editingExercise? 'Editar Exercício':'Novo Exercício'}</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <Input placeholder="ID Exercício" value={newExercise.exerciseId} onChange={e=> setNewExercise(s=> ({...s, exerciseId:e.target.value}))} />
                <Input placeholder="Séries" value={newExercise.setsCompleted} onChange={e=> setNewExercise(s=> ({...s, setsCompleted:e.target.value}))} />
                <Input placeholder="Reps" value={newExercise.repsCompleted} onChange={e=> setNewExercise(s=> ({...s, repsCompleted:e.target.value}))} />
                <Input placeholder="Carga" value={newExercise.weightCompleted} onChange={e=> setNewExercise(s=> ({...s, weightCompleted:e.target.value}))} />
              </div>
              <Textarea placeholder="Notas" value={newExercise.exerciseNotes} onChange={e=> setNewExercise(s=> ({...s, exerciseNotes:e.target.value}))} className="min-h-[80px]" />
              <div className="flex gap-2 justify-end">
                <Button variant="outline" size="sm" onClick={()=> { setAddingExerciseFor(null); setEditingExercise(null) }}>Cancelar</Button>
                {editingExercise? (
                  <Button size="sm" onClick={submitEditExercise} disabled={mUpdateExercise.isPending}>{mUpdateExercise.isPending? 'Salvando...':'Salvar'}</Button>
                ): (
                  <Button size="sm" onClick={submitAddExercise} disabled={mAddExercise.isPending || !newExercise.exerciseId}>{mAddExercise.isPending? 'Adicionando...':'Adicionar'}</Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      <div className="flex justify-end pt-2">
        <Button variant="outline" onClick={()=> router.back()}>Voltar</Button>
      </div>
    </div>
  </Layout>
}
