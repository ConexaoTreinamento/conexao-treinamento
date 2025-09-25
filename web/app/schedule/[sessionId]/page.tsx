"use client"

import {useSearchParams, useParams, useRouter} from "next/navigation"
import Layout from "@/components/layout"
import {useMemo, useState, useEffect} from "react"
import {apiClient} from "@/lib/client"
import {getScheduleOptions, updateSessionMutation} from "@/lib/api-client/@tanstack/react-query.gen"
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card"
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {Textarea} from "@/components/textarea"
import {Checkbox} from "@/components/ui/checkbox"
import {Badge} from "@/components/ui/badge"
import {ArrowLeft, Loader2, Save, UserPlus, Dumbbell, UserCheck} from "lucide-react"
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger} from "@/components/ui/dialog"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select"
import {useQuery, useMutation, useQueryClient} from "@tanstack/react-query"

export default function SessionDetailPage(){
  const params = useParams<{sessionId:string}>()
  const router = useRouter()
  const search = useSearchParams()
  const date = search.get('date') || new Date().toISOString().slice(0,10)
  const qc = useQueryClient()
  const {data, isLoading, error} = useQuery(
    getScheduleOptions({query:{startDate:date, endDate:date}, client: apiClient})
  ) as any
  const updateSession = useMutation(updateSessionMutation({client: apiClient}))
  const [notes, setNotes] = useState('')
  const [overrideTrainer, setOverrideTrainer] = useState<string>('')
  const [exercises, setExercises] = useState<{name:string; reps?:string}[]>([])
  const [newExercise, setNewExercise] = useState('')
  const [newReps, setNewReps] = useState('')
  const [adding, setAdding] = useState(false)
  const [newStudentId, setNewStudentId] = useState('')

  const session = useMemo(()=> (data?.sessions||[]).find((s:any)=> s.sessionId === params.sessionId), [data, params.sessionId])

  const [participants, setParticipants] = useState<any[]>([])

  // Populate participants when session arrives the first time
  useEffect(()=>{
    if(session && participants.length === 0){
      setParticipants(session.students?.map((sp:any)=> ({...sp, present:false})) || [])
      setOverrideTrainer(session.trainerName || '')
      // Parse exercises from notes if previously encoded (#EX: name|reps lines)
      if(session.notes){
        const lines = (session.notes as string).split('\n').filter(l=> l.startsWith('#EX:'))
        const parsed = lines.map(l=> {
          const body = l.replace('#EX:','').trim()
          const [n,r] = body.split('|')
            return {name:n.trim(), reps:r?.trim()}
        }).filter(e=> e.name)
        setExercises(parsed)
        setNotes(session.notes)
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session])

  const togglePresence = (sid:string) => {
    setParticipants(prev=> prev.map(p=> p.studentId===sid ? {...p, present: !p.present}: p))
  }

  const addStudent = () => {
    if(!newStudentId) return
    if(participants.some(p=> p.studentId===newStudentId)) return
    setParticipants(prev=> [...prev, {studentId:newStudentId, participationType:'INCLUDED', present:false}])
    setNewStudentId('')
    setAdding(false)
  }

  const addExercise = () => {
    if(!newExercise.trim()) return
    setExercises(prev=> [...prev, {name:newExercise.trim(), reps:newReps.trim()|| undefined}])
    setNewExercise(''); setNewReps('')
  }

  const removeExercise = (idx:number) => {
    setExercises(prev=> prev.filter((_,i)=> i!==idx))
  }

  const handleSave = async () => {
    if(!session) return
    // Encode exercises inside notes (temporary strategy) appended after a delimiter
    const exerciseLines = exercises.map(e=> `#EX: ${e.name}${e.reps? `|${e.reps}`:''}`)
    const combinedNotes = [notes, ...exerciseLines].filter(Boolean).join('\n')
    await updateSession.mutateAsync({
      path:{sessionId: session.sessionId},
      body:{
        participants: participants.map(p=> ({
          studentId: p.studentId,
          participationType: p.participationType,
          present: p.present
        })),
        notes: combinedNotes
      }
    })
    await qc.invalidateQueries({queryKey:['getSchedule']})
    router.back()
  }

  if(isLoading) return <Layout><div className="p-6 text-sm">Carregando...</div></Layout>
  if(error || !session) return <Layout><div className="p-6 text-sm text-red-600">Sessão não encontrada.</div></Layout>

  return (
    <Layout>
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Button size="icon" variant="ghost" onClick={()=> router.back()}><ArrowLeft className="w-4 h-4"/></Button>
          <h1 className="text-xl font-bold">Aula • {session.seriesName}</h1>
        </div>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Participantes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {participants.map(p=> (
              <div key={p.studentId} className="flex items-center justify-between p-2 rounded border">
                <div className="flex items-center gap-3">
                  <Checkbox checked={p.present} onCheckedChange={()=> togglePresence(p.studentId)} />
                  <span className="text-sm font-medium">{p.studentName || p.studentId}</span>
                </div>
                <Badge variant={p.present? 'default':'outline'} className="text-xs">{p.present? 'Presente':'Ausente'}</Badge>
              </div>
            ))}
            {participants.length===0 && <p className="text-sm text-muted-foreground">Nenhum participante.</p>}
            <Dialog open={adding} onOpenChange={setAdding}>
              <DialogTrigger asChild>
                <Button type="button" variant="outline" className="w-full justify-center"><UserPlus className="w-4 h-4 mr-2"/> Adicionar Aluno</Button>
              </DialogTrigger>
              <DialogContent className="max-w-sm">
                <DialogHeader><DialogTitle>Adicionar Aluno</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <Input placeholder="ID do aluno" value={newStudentId} onChange={e=> setNewStudentId(e.target.value)}/>
                  <Button onClick={addStudent} disabled={!newStudentId}>Adicionar</Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Anotações</CardTitle></CardHeader>
          <CardContent>
            <Textarea value={notes} onChange={e=> setNotes(e.target.value)} placeholder="Observações da aula"/>
          </CardContent>
        </Card>
        {/* Trainer override UI removed until backend supports updating trainer for a session */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Dumbbell className="w-4 h-4"/> Exercícios</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {exercises.length===0 && <p className="text-xs text-muted-foreground">Nenhum exercício adicionado.</p>}
            <div className="space-y-2">
              {exercises.map((ex,idx)=> (
                <div key={idx} className="flex items-center gap-2 text-sm">
                  <span className="flex-1 truncate">{ex.name}{ex.reps? ` • ${ex.reps}`:''}</span>
                  <Button type="button" variant="outline" size="sm" className="h-7 px-2" onClick={()=> removeExercise(idx)}>Remover</Button>
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-2">
              <Input placeholder="Nome do exercício" value={newExercise} onChange={e=> setNewExercise(e.target.value)}/>
              <Input placeholder="Séries/Reps (opcional)" value={newReps} onChange={e=> setNewReps(e.target.value)}/>
              <Button type="button" variant="outline" onClick={addExercise} disabled={!newExercise.trim()}>Adicionar</Button>
            </div>
            <p className="text-[10px] text-muted-foreground">Temporário: exercícios são armazenados dentro das anotações (#EX: linhas).</p>
          </CardContent>
        </Card>
        <div className="flex gap-2 pt-2">
          <Button variant="outline" onClick={()=> router.back()} className="flex-1">Cancelar</Button>
          <Button onClick={handleSave} className="flex-1 bg-green-600 hover:bg-green-700" disabled={updateSession.isPending}>{updateSession.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin"/>}<Save className="w-4 h-4 mr-2"/> Salvar</Button>
        </div>
      </div>
    </Layout>
  )
}
