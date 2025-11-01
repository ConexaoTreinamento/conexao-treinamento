"use client"

import {useEffect, useMemo, useState} from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Save, Calendar, Clock, User, Loader2 } from "lucide-react"
import { useRouter, useParams } from "next/navigation"
import Layout from "@/components/layout"
import { TrainerSelect } from "@/components/trainer-select"
import {apiClient} from "@/lib/client"
import {getAvailableSessionSeriesOptions, getStudentCommitmentsOptions, bulkUpdateCommitmentsMutation, getCurrentStudentPlanOptions, getSessionSeriesCommitmentsOptions, getCommitmentHistoryOptions, getCurrentActiveCommitmentsOptions, updateCommitmentMutation, getStudentCommitmentsQueryKey, getCurrentActiveCommitmentsQueryKey, getScheduleQueryKey, getTrainersForLookupOptions} from "@/lib/api-client/@tanstack/react-query.gen"
import {useQueryClient, useMutation, useQuery} from "@tanstack/react-query"
import { TrainerSchedule, CommitmentDetailResponseDto } from "@/lib/api-client"
import type { TrainerLookupDto } from "@/lib/api-client/types.gen"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { History, Users, AlertTriangle } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const weekdayMap: Record<number,string> = {0:"Domingo",1:"Segunda-feira",2:"Terça-feira",3:"Quarta-feira",4:"Quinta-feira",5:"Sexta-feira",6:"Sábado"}

const toHHmm = (s?: string) => (s || '').slice(0,5) || ''
const pad2 = (n:number) => (n<10? `0${n}`: `${n}`)
const addMinutesHHmm = (hhmm: string, minutes: number): string => {
  const [h,m] = hhmm.split(":").map(Number)
  const total = h*60 + m + minutes
  const h2 = Math.floor((total% (24*60) + (24*60)) % (24*60) / 60)
  const m2 = ((total%60)+60)%60
  return `${pad2(h2)}:${pad2(m2)}`
}
const deriveEndTime = (start?: string, intervalDuration?: number): string | undefined => {
  const base = toHHmm(start)
  if(!base) return undefined
  const duration = intervalDuration ?? 60
  return `${addMinutesHHmm(base, duration)}:00`
}

export default function ClassSchedulePage() {
  const router = useRouter()
  const params = useParams<{id:string}>()
  const studentId = params.id as string
  const qc = useQueryClient()
  const [selectedSeries, setSelectedSeries] = useState<string[]>([])
  const [initializedSelection, setInitializedSelection] = useState(false)
  const [openParticipantsFor, setOpenParticipantsFor] = useState<string | null>(null)
  const [openHistoryFor, setOpenHistoryFor] = useState<string | null>(null)
  const [participantsFilter, setParticipantsFilter] = useState<'ALL'|'ATTENDING'>('ALL')
  const [trainerFilter, setTrainerFilter] = useState<string>("all")

  // Queries
  const availableQuery = useQuery(getAvailableSessionSeriesOptions({client: apiClient}))
  const studentIdQueryOptions = { path: { studentId }, client: apiClient }

  const commitmentsQuery = useQuery(getStudentCommitmentsOptions(studentIdQueryOptions))
  const planQuery = useQuery(getCurrentStudentPlanOptions(studentIdQueryOptions))
  const mutation = useMutation(bulkUpdateCommitmentsMutation({client: apiClient}))
  const singleMutation = useMutation(updateCommitmentMutation({client: apiClient}))
  const activeCommitmentsQuery = useQuery(getCurrentActiveCommitmentsOptions(studentIdQueryOptions))
  const trainersQuery = useQuery(getTrainersForLookupOptions({ client: apiClient }))
  const participantsQuery = useQuery({
    ...getSessionSeriesCommitmentsOptions({
      path: { sessionSeriesId: openParticipantsFor || "placeholder" },
      client: apiClient,
    }),
    enabled: !!openParticipantsFor,
    queryKey: [
      {
        path: { sessionSeriesId: openParticipantsFor || "placeholder" },
        _id: `sessionSeriesCommitments-${openParticipantsFor || 'none'}`,
      },
    ],
  })
  const historyQuery = useQuery({
    ...getCommitmentHistoryOptions({
      path: { studentId, sessionSeriesId: openHistoryFor || "placeholder" },
      client: apiClient,
    }),
    enabled: !!openHistoryFor,
    queryKey: [
      {
        path: { studentId, sessionSeriesId: openHistoryFor || "placeholder" },
        _id: `commitmentHistory-${openHistoryFor || 'none'}`,
      },
    ],
  })

  const participantsData: CommitmentDetailResponseDto[] = Array.isArray(participantsQuery.data) ? participantsQuery.data : []
  const historyData: CommitmentDetailResponseDto[] = Array.isArray(historyQuery.data) ? historyQuery.data : []
  const activeSeriesIds = new Set((Array.isArray(activeCommitmentsQuery.data)? activeCommitmentsQuery.data: []).filter(c=> c.commitmentStatus==='ATTENDING').map(c=> c.sessionSeriesId))

  const planDays = planQuery.data?.planMaxDays || 3

  // Pre-select based on CURRENT active commitments (latest event per series) rather than raw history
  useEffect(()=> {
    if(!initializedSelection && activeCommitmentsQuery.data){
      const attending = (activeCommitmentsQuery.data).filter(c=> c.commitmentStatus==='ATTENDING').map(c=> c.sessionSeriesId!)
      setSelectedSeries(attending)
      setInitializedSelection(true)
    }
  }, [activeCommitmentsQuery.data, initializedSelection])

  interface NormalizedSeries {
    id: string
    weekday: number
    startTime?: string
    endTime?: string
    seriesName: string
    active: boolean
    intervalDuration?: number
    capacity?: number
    enrolledCount?: number
    trainerId?: string
    trainerName?: string
  }

  interface WeekdayGroup { weekday: number; day: string; classes: NormalizedSeries[] }

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

  const normalizedSeries: NormalizedSeries[] = useMemo(()=> {
    interface LegacyTrainerSchedule { dayOfWeek?: number; name?: string }
    const synonym = {
      weekday: (s: TrainerSchedule & LegacyTrainerSchedule) => s.weekday ?? s.dayOfWeek,
      seriesName: (s: TrainerSchedule & LegacyTrainerSchedule) => s.seriesName ?? s.name ?? 'Série'
    }
    const pickString = <K extends string>(s: unknown, key: K): string | undefined => (
      typeof s === 'object' && s !== null && key in (s as Record<string, unknown>) && typeof (s as Record<string, unknown>)[key] === 'string'
        ? (s as Record<string, string>)[key]
        : undefined
    )
    const pickNumber = <K extends string>(s: unknown, key: K): number | undefined => (
      typeof s === 'object' && s !== null && key in (s as Record<string, unknown>) && typeof (s as Record<string, unknown>)[key] === 'number'
        ? (s as Record<string, number>)[key]
        : undefined
    )
    const raw = (availableQuery.data || []) as (TrainerSchedule & LegacyTrainerSchedule)[]
    return raw
      .filter(s => !!s && !!s.id && !!s.active && typeof synonym.weekday(s) === 'number')
      .map(s => {
        const intervalDuration = pickNumber(s, 'intervalDuration')
        const trainerId = pickString(s, 'trainerId')
        const trainerName = pickString(s as unknown, 'trainerName') ?? (trainerId ? trainerNameById.get(trainerId) : undefined)
        return {
          id: s.id!,
          weekday: synonym.weekday(s)!,
          startTime: s.startTime,
          endTime: deriveEndTime(s.startTime, intervalDuration),
          seriesName: synonym.seriesName(s),
          active: true,
          intervalDuration,
          capacity: pickNumber(s, 'capacity'),
          enrolledCount: pickNumber(s, 'enrolledCount'),
          trainerId,
          trainerName
        }
      })
  }, [availableQuery.data, trainerNameById])

  const filteredSeries = useMemo(() => {
    if (trainerFilter === "all") return normalizedSeries
    return normalizedSeries.filter(series => series.trainerId === trainerFilter)
  }, [normalizedSeries, trainerFilter])

  const weeklyByWeekday: WeekdayGroup[] = useMemo(()=> {
    const grouped: Record<number, NormalizedSeries[]> = {}
    for (const s of filteredSeries) {
      if (!grouped[s.weekday]) grouped[s.weekday] = []
      grouped[s.weekday].push(s)
    }
    return Object.keys(grouped)
      .map(k => Number(k))
      .sort((a,b)=> a-b)
      .map(weekday => ({
        weekday,
        day: weekdayMap[weekday],
        classes: grouped[weekday].slice().sort((x,y)=> (x.startTime||'').localeCompare(y.startTime||''))
      }))
  }, [filteredSeries])

  const seriesById = useMemo(()=> {
    const m = new Map<string, NormalizedSeries>()
    for (const s of normalizedSeries) m.set(s.id, s)
    return m
  }, [normalizedSeries])

  const selectedDays = useMemo(()=> {
    const selectedWeekdays = new Set<number>()
    for (const id of selectedSeries) {
      const s = seriesById.get(id)
      if (s) selectedWeekdays.add(s.weekday)
    }
    return Array.from(selectedWeekdays).map(w=> weekdayMap[w])
  }, [selectedSeries, seriesById])

  const canSelectSeries = (seriesId: string) => {
    if(selectedSeries.includes(seriesId)) return true
    const series = seriesById.get(seriesId)
    if(!series) return false
    // If day already selected
    if(selectedSeries.some(id=> {
      const other = seriesById.get(id)
      return other?.weekday === series.weekday
    })) return true
    return selectedDays.length < planDays
  }

  // Detect time conflicts for visual warnings
  // Poll active commitments & participants when dialogs open (simple refetch interval)
  useEffect(()=> {
    const interval = setInterval(()=> {
      if(openParticipantsFor){ participantsQuery.refetch() }
      if(openHistoryFor){ historyQuery.refetch() }
      activeCommitmentsQuery.refetch()
    }, 15000)
    return ()=> clearInterval(interval)
  }, [openParticipantsFor, openHistoryFor, participantsQuery, historyQuery, activeCommitmentsQuery])

  const hasConflict = (series: NormalizedSeries) => {
    if(!series.startTime || !series.endTime) return false
    return selectedSeries.some(id=> {
      if(id===series.id) return false
      const other = seriesById.get(id)
      if(!other || other.weekday !== series.weekday) return false
      if(!other.startTime || !other.endTime) return false
      return (other.startTime < (series.endTime||'')) && ((series.startTime||'') < other.endTime)
    })
  }

  // Global conflict flag: any selected series overlaps with another on the same weekday
  const anyConflict = useMemo(() => {
    for (const id of selectedSeries) {
      const s = seriesById.get(id)
      if (!s || !s.startTime || !s.endTime) continue
      for (const otherId of selectedSeries) {
        if (otherId === id) continue
        const o = seriesById.get(otherId)
        if (!o || o.weekday !== s.weekday || !o.startTime || !o.endTime) continue
        if ((o.startTime < (s.endTime || '')) && ((s.startTime || '') < o.endTime)) return true
      }
    }
    return false
  }, [selectedSeries, seriesById])

  const handleQuickToggle = async (seriesId: string, currentlySelected: boolean) => {
    const target = seriesById.get(seriesId)
    if(!target) return
    try {
      await singleMutation.mutateAsync({ path:{ studentId, sessionSeriesId: seriesId}, body:{ commitmentStatus: currentlySelected? 'NOT_ATTENDING':'ATTENDING' }, client: apiClient })
      // Invalidate student commitments & active commitments
      await qc.invalidateQueries({queryKey: getStudentCommitmentsQueryKey(studentIdQueryOptions)})
      await qc.invalidateQueries({queryKey: getCurrentActiveCommitmentsQueryKey(studentIdQueryOptions)})
      // Also invalidate schedule views for the month containing today (broad refresh)
      const today = new Date()
      const monthStart = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1))
      const monthEnd = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth()+1, 0))
      const monthStartIso = monthStart.toISOString().slice(0,10)
      const monthEndIso = monthEnd.toISOString().slice(0,10)
  await qc.invalidateQueries({ queryKey: getScheduleQueryKey({ client: apiClient, query: { startDate: monthStartIso, endDate: monthEndIso } }) })
    // Also invalidate recent 7-day window used by Student > Recent Classes
    const fmt = (dt: Date) => `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')}`
    const todayLocal = new Date()
    const recentEnd = fmt(todayLocal)
    const recentStart = fmt(new Date(todayLocal.getFullYear(), todayLocal.getMonth(), todayLocal.getDate()-7))
    await qc.invalidateQueries({ queryKey: getScheduleQueryKey({ client: apiClient, query: { startDate: recentStart, endDate: recentEnd } }) })
      setSelectedSeries(prev=> currentlySelected? prev.filter(i=> i!==seriesId): [...prev, seriesId])
    } catch(e){/* ignore */}
  }

  const toggleSeries = (seriesId: string) => {
    setInitializedSelection(true) // user is manually editing
    setSelectedSeries(prev=> prev.includes(seriesId)? prev.filter(i=> i!==seriesId): canSelectSeries(seriesId)? [...prev, seriesId]: prev)
  }

  const handleSave = async () => {
    // Determine adds/removals
    // Determine latest active ATTENDING set from activeCommitmentsQuery (already filtered server-side)
    const currentAttending = (activeCommitmentsQuery.data||[])
      .filter(c=> c.commitmentStatus==='ATTENDING')
      .map(c=> c.sessionSeriesId)
      .filter((id): id is string => !!id)
    const toAttend = selectedSeries.filter(id=> !currentAttending.includes(id))
    const toRemove = currentAttending.filter(id => !selectedSeries.includes(id))
    try {
      // Process removals first (frees weekday slots) then additions
      if(toRemove.length){
        await mutation.mutateAsync({path:{studentId}, body:{sessionSeriesIds: toRemove, commitmentStatus:'NOT_ATTENDING'}, client: apiClient})
      }
      if(toAttend.length){
        await mutation.mutateAsync({path:{studentId}, body:{sessionSeriesIds: toAttend, commitmentStatus:'ATTENDING'}, client: apiClient})
      }
      await qc.invalidateQueries({queryKey: getStudentCommitmentsQueryKey(studentIdQueryOptions)})
      await qc.invalidateQueries({queryKey: getCurrentActiveCommitmentsQueryKey(studentIdQueryOptions)})
      // Invalidate monthly schedule cache as commitments affect session rosters and occupancy
      const today = new Date()
      const monthStart = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1))
      const monthEnd = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth()+1, 0))
      const monthStartIso = monthStart.toISOString().slice(0,10)
      const monthEndIso = monthEnd.toISOString().slice(0,10)
  await qc.invalidateQueries({ queryKey: getScheduleQueryKey({ client: apiClient, query: { startDate: monthStartIso, endDate: monthEndIso } }) })
    // Also invalidate recent 7-day window used by Student > Recent Classes
    const fmt = (dt: Date) => `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')}`
    const todayLocal = new Date()
    const recentEnd = fmt(todayLocal)
    const recentStart = fmt(new Date(todayLocal.getFullYear(), todayLocal.getMonth(), todayLocal.getDate()-7))
    await qc.invalidateQueries({ queryKey: getScheduleQueryKey({ client: apiClient, query: { startDate: recentStart, endDate: recentEnd } }) })
      router.back()
    } catch(e){/* no-op */}
  }

  // Friendly Portuguese labels for commitment status
  const statusLabel = (status?: string) => {
    switch (status) {
      case 'ATTENDING': return 'Ativo'
      case 'NOT_ATTENDING': return 'Inativo'
      case 'TENTATIVE': return 'Talvez'
      default: return '—'
    }
  }

  const getOccupancyColor = (current: number, max: number) => {
    if(max===0) return "bg-muted"
    const pct = (current/max)*100
    if(pct>=90) return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
    if(pct>=70) return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
    return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
  }

  return (
    <Layout>
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={()=> router.back()}><ArrowLeft className="w-4 h-4"/></Button>
          <div>
            <h1 className="text-2xl font-bold">Cronograma de Aulas</h1>
            <p className="text-sm text-muted-foreground">Selecione as séries que deseja frequentar</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Plano Atual</h3>
              <p className="text-sm text-muted-foreground">Limite de {planDays} dias por semana</p>
            </div>
            <div className="text-right">
              <Badge variant="outline" className="mb-1">{selectedDays.length}/{planDays} dias</Badge>
              <p className="text-xs text-muted-foreground">{selectedSeries.length} séries</p>
            </div>
          </CardContent>
        </Card>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-start">
          <div className="w-full sm:w-72 space-y-1">
            <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Instrutor</Label>
            <TrainerSelect
              value={trainerFilter}
              onValueChange={(value) => setTrainerFilter(value)}
              trainers={trainerOptions}
              isLoading={trainersQuery.isLoading}
              disabled={trainersQuery.isError}
              placeholder="Selecione ou busque"
              className="w-full"
            />
          </div>
        </div>
        {availableQuery.isLoading && <div className="space-y-2">{[...Array(3)].map((_,i)=><Card key={i} className="animate-pulse"><CardContent className="h-16"/></Card>)}</div>}
        <div className="space-y-3">
          {weeklyByWeekday.map(day=> {
            const isDaySelected = selectedSeries.some(id=> {
              const s = seriesById.get(id)
              return s?.weekday === day.weekday
            })
            const canSelectDay = selectedDays.includes(day.day) || selectedDays.length < planDays
            return (
              <Card key={day.weekday}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Calendar className="w-4 h-4"/> {day.day}
                    </CardTitle>
                    <Badge variant="outline" className="text-xs">{day.classes.length} séries</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {day.classes.map(cls=> {
                    const isSelected = selectedSeries.includes(cls.id)
                    const canSelect = canSelectSeries(cls.id)
                    const max =  cls.capacity ?? 0
                    const current = cls.enrolledCount ?? 0
                    const conflict = isSelected && hasConflict(cls)
                    const trainerLabel = cls.trainerName ?? (cls.trainerId ? trainerNameById.get(cls.trainerId) : undefined) ?? 'Instrutor não definido'
                    return (
                      <div key={cls.id} className={`p-3 rounded border transition-colors space-y-2 ${isSelected? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800':'hover:bg-muted/50'}`}>
                        <div className="flex items-start gap-3">
                          <Checkbox checked={isSelected} onCheckedChange={()=> toggleSeries(cls.id)} disabled={!isSelected && !canSelect} className="mt-0.5"/>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-sm">{cls.seriesName}</h4>
                              {max>0 && (
                                <TooltipProvider delayDuration={300}>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Badge className={`${getOccupancyColor(current, max)} text-xs ${current>=max? 'ring-2 ring-red-500':''}`}>{current}/{max}{current>=max? ' • Cheia':''}</Badge>
                                    </TooltipTrigger>
                                    <TooltipContent>Inscritos/Capacidade (informativo)</TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                              {activeSeriesIds.has(cls.id) && (
                                <TooltipProvider delayDuration={300}>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Badge variant="secondary" className="text-[10px] cursor-help">Ativo</Badge>
                                    </TooltipTrigger>
                                    <TooltipContent>Compromisso atual do aluno nesta série</TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                              {conflict && (
                                <TooltipProvider delayDuration={300}>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Badge variant="destructive" className="flex items-center gap-1 text-[10px] cursor-help"><AlertTriangle className="w-3 h-3"/> Conflito</Badge>
                                    </TooltipTrigger>
                                    <TooltipContent>Conflito de horário com outra série selecionada no mesmo dia</TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1"><Clock className="w-3 h-3"/><span>{cls.startTime?.slice(0,5)} - {cls.endTime?.slice(0,5)}</span></div>
                              <div className="flex items-center gap-1"><User className="w-3 h-3"/><span className="truncate max-w-[14rem]" title={trainerLabel}>{trainerLabel}</span></div>
                            </div>
                          </div>
                          <div className="flex flex-col gap-1">
                            <Button variant="outline" size="icon" className="h-7 w-7" onClick={()=> setOpenParticipantsFor(cls.id)} title="Participantes">
                              <Users className="w-3 h-3"/>
                            </Button>
                            {isSelected && (
                              <Button variant="outline" size="icon" className="h-7 w-7" onClick={()=> setOpenHistoryFor(cls.id)} title="Histórico">
                                <History className="w-3 h-3"/>
                              </Button>
                            )}
                          </div>
                        </div>
                        {max>0 && <div className="h-1.5 rounded bg-muted overflow-hidden" aria-hidden>
                          <div className="h-full bg-green-600 transition-all" style={{width: `${Math.min(100, Math.round((current/(max||1))*100))}%`}} />
                        </div>}
                      </div>
                    )
                  })}
                </CardContent>
              </Card>
            )
          })}
          {weeklyByWeekday.length === 0 && !availableQuery.isLoading && (
            <Card>
              <CardContent className="p-6 text-sm text-muted-foreground">
                Nenhuma série disponível para este filtro.
              </CardContent>
            </Card>
          )}
        </div>
        <div className="flex flex-col gap-3 pt-6 border-t mt-6">
          <div className="flex flex-wrap gap-4 text-xs">
            <span><span className="font-medium">Dias selecionados:</span> {selectedDays.length}/{planDays}</span>
            <span><span className="font-medium">Séries:</span> {selectedSeries.length}</span>
            <span><span className="font-medium">Ativas:</span> {activeSeriesIds.size}</span>
            {activeCommitmentsQuery.isLoading && <span>Compromissos: carregando...</span>}
            {activeCommitmentsQuery.data && <span>Atualizado: {new Date().toLocaleTimeString('pt-BR')}</span>}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={()=> router.back()}>Cancelar</Button>
            <Button onClick={handleSave} className="flex-1 bg-green-600 hover:bg-green-700" disabled={mutation.isPending || anyConflict}>{mutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin"/>}<Save className="w-4 h-4 mr-2"/> {`Salvar${anyConflict ? ' (Resolva os conflitos)' : ''}`}</Button>
          </div>
        </div>
        {/* Participants Dialog */}
        <Dialog open={!!openParticipantsFor} onOpenChange={(o)=> { if(!o) setOpenParticipantsFor(null)}}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Participantes da Série</DialogTitle>
            </DialogHeader>
            <div className="flex items-center justify-between mb-2 text-xs">
              <div className="flex gap-2">
                <Button variant={participantsFilter==='ALL'?'secondary':'outline'} size="sm" className="h-6 px-2" onClick={()=> setParticipantsFilter('ALL')}>Todos</Button>
                <Button variant={participantsFilter==='ATTENDING'?'secondary':'outline'} size="sm" className="h-6 px-2" onClick={()=> setParticipantsFilter('ATTENDING')}>Ativos</Button>
              </div>
              <Badge variant="outline" className="text-[10px]">{participantsData.length} total</Badge>
            </div>
            <div className="space-y-2 max-h-72 overflow-auto pr-1 text-sm">
              {participantsQuery.isLoading && <p className="text-xs text-muted-foreground">Carregando...</p>}
              {!participantsQuery.isLoading && participantsData.filter(p=> participantsFilter==='ALL' || p.commitmentStatus==='ATTENDING').length===0 && <p className="text-xs text-muted-foreground">Nenhum participante.</p>}
              {participantsData.filter(p=> participantsFilter==='ALL' || p.commitmentStatus==='ATTENDING').map(p=> (
                <div key={p.id} className="flex items-center justify-between p-2 rounded border">
                  <span className="truncate font-medium" title={p.seriesName}>{p.studentName || p.seriesName}</span>
                  <Badge variant={p.commitmentStatus==='ATTENDING'? 'secondary':'outline'} className="text-[10px]">{statusLabel(p.commitmentStatus)}</Badge>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
        {/* History Dialog */}
        <Dialog open={!!openHistoryFor} onOpenChange={(o)=> { if(!o) setOpenHistoryFor(null)}}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Histórico de Compromissos</DialogTitle>
            </DialogHeader>
            <div className="space-y-2 max-h-72 overflow-auto pr-1 text-sm">
              {historyQuery.isLoading && <p className="text-xs text-muted-foreground">Carregando...</p>}
              {!historyQuery.isLoading && historyData.length===0 && <p className="text-xs text-muted-foreground">Sem histórico.</p>}
              {historyData.map(h=> (
                <div key={h.id} className="p-2 rounded border space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-xs">{h.seriesName}</span>
                    <Badge variant={h.commitmentStatus==='ATTENDING'? 'secondary':'outline'} className="text-[10px]">{statusLabel(h.commitmentStatus)}</Badge>
                  </div>
                  <p className="text-[10px] text-muted-foreground">Atualizado: {h.createdAt ? new Date(h.createdAt).toLocaleDateString('pt-BR'): '—'}</p>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  )
}
