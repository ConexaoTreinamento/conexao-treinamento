"use client"

import {useState, useMemo, useEffect} from "react"
import {useParams} from "next/navigation"
import Layout from "@/components/layout"
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card"
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {Badge} from "@/components/ui/badge"
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger} from "@/components/ui/dialog"
import {Checkbox} from "@/components/ui/checkbox"
import {Save, Loader2, Calendar as CalendarIcon, Clock, Settings2, Square, SquareCheck} from "lucide-react"
import {useQueryClient, useMutation} from "@tanstack/react-query"
import {apiClient} from "@/lib/client"
import {getSchedulesByTrainerOptions, getSchedulesByTrainerQueryKey, createScheduleMutation, updateScheduleMutation, deleteScheduleMutation, getAvailableSessionSeriesQueryKey, getScheduleQueryKey} from "@/lib/api-client/@tanstack/react-query.gen"
import {useQuery} from "@tanstack/react-query"
import {type TrainerScheduleResponseDto, type TrainerScheduleRequestDto} from "@/lib/api-client/types.gen"

const weekdayNames: Record<number,string> = {0:"Domingo",1:"Segunda",2:"Terça",3:"Quarta",4:"Quinta",5:"Sexta",6:"Sábado"}

interface WeekConfigRow {
  weekday: number
  enabled: boolean
  seriesName: string
  shiftStart: string // HH:mm
  shiftEnd: string // HH:mm
  // Map slot start => schedule id (active) if exists
  existingActive: Map<string,string>
  // Selected slot starts for this weekday (user picks which blocks exist)
  selectedStarts: Set<string>
}

const toHHmm = (s?: string) => (s || '').slice(0,5) || ''
const pad2 = (n:number) => (n<10? `0${n}`: `${n}`)
const addMinutesHHmm = (hhmm: string, minutes: number): string => {
  const [h,m] = hhmm.split(":").map(Number)
  const total = h*60 + m + minutes
  const h2 = Math.floor((total% (24*60) + (24*60)) % (24*60) / 60)
  const m2 = ((total%60)+60)%60
  return `${pad2(h2)}:${pad2(m2)}`
}
const cmpHHmm = (a:string,b:string) => a.localeCompare(b)

interface WeekTimetableProps { schedules: TrainerScheduleResponseDto[] }

function WeekTimetable({schedules}: WeekTimetableProps){
  // Map by weekday (allow multiple per day future-proofing)
  const byDay: Record<number, TrainerScheduleResponseDto[]> = {}
  schedules.forEach(s=> {
    const wd = s.weekday ?? 0
    byDay[wd] = byDay[wd] ? [...byDay[wd], s] : [s]
  })

  // Determine time range
  const toMinutes = (t?: string) => {
    if(!t) return 0 // expect HH:MM:SS or HH:MM
    const base = t.length>=5 ? t.slice(0,5) : t
    const [h,m] = base.split(':').map(Number)
    return h*60 + (m||0)
  }
  const starts = schedules.map(s=> toMinutes(s.startTime))
  const ends = schedules.map(s=> toMinutes(s.endTime))
  const minStart = Math.min(...starts)
  const maxEnd = Math.max(...ends)
  const startHour = isFinite(minStart) ? Math.floor(minStart/60) : 8
  const endHour = isFinite(maxEnd) ? Math.ceil(maxEnd/60) : 18 // exclusive
  const hours: number[] = []
  for(let h=startHour; h<=endHour; h++){ hours.push(h) }

  const rowHeight = 56 // px per hour row
  const totalHeight = Math.max(1, (endHour-startHour)) * rowHeight

  return (
    <div className="relative mt-2 border rounded-md overflow-auto bg-background timetable-desktop">
      <div className="min-w-[980px]">
        {/* Header */}
        <div className="grid sticky top-0 z-30" style={{gridTemplateColumns:'80px repeat(7,1fr)'}}>
          <div className="h-10 border-r flex items-center justify-center text-xs font-medium bg-muted/60 backdrop-blur supports-[backdrop-filter]:bg-muted/50 sticky left-0 z-40">Hora</div>
          {Array.from({length:7}, (_,i)=>(
            <div key={i} className="h-10 flex items-center justify-center text-xs font-semibold border-r last:border-r-0 bg-muted/60 backdrop-blur supports-[backdrop-filter]:bg-muted/50">{weekdayNames[i]}</div>
          ))}
        </div>
        {/* Body container */}
        <div className="relative" style={{height: totalHeight}}>
          {/* Horizontal hour lines spanning all day columns (behind content) */}
          {hours.map((h,i)=>(
            <div key={h} className="absolute left-0 right-0 border-t border-border" style={{top: i*rowHeight}} />
          ))}
          {/* Hour labels column */}
          <div className="absolute top-0 left-0 w-20 bg-background/70 backdrop-blur sticky left-0" style={{height: totalHeight}}>
            {hours.slice(0,-1).map((h,i)=>(
              <div key={h} className="absolute w-full text-[10px] pr-1 flex items-start justify-end text-muted-foreground" style={{top:i*rowHeight}}>
                {String(h).padStart(2,'0')}:00
              </div>
            ))}
          </div>
          {/* Day columns grid (7) offset by hour column */}
          <div className="absolute top-0 left-20 right-0 h-full grid" style={{gridTemplateColumns:'repeat(7,1fr)'}}>
            {Array.from({length:7}, (_,day)=>{
              const daySchedules = (byDay[day]||[]).sort((a,b)=> toMinutes(a.startTime)-toMinutes(b.startTime))
              return (
                <div key={day} className="relative border-r last:border-r-0">
                  {/* blocks */}
                  {daySchedules.map(s=>{
                    const start = toMinutes(s.startTime)
                    const end = toMinutes(s.endTime)
                    const top = ((start/60)-startHour)*rowHeight
                    const height = ((end-start)/60)*rowHeight
                    return (
                      <div key={s.id} className="absolute mx-1 rounded-md shadow-sm border border-green-500 bg-green-500/15 hover:bg-green-500/25 cursor-default overflow-hidden"
                        style={{top, height, left: '2px', right: '2px'}}>
                        <div className="text-[10px] px-1 pt-0.5 font-semibold truncate text-green-800 dark:text-green-200">{s.seriesName}</div>
                        <div className="text-[10px] px-1 pb-0.5 text-muted-foreground">{s.startTime?.slice(0,5)} - {s.endTime?.slice(0,5)}</div>
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

// --- Mobile Timetable (stacked days) ---
function MobileTimetable({schedules}: WeekTimetableProps){
  const byDay: Record<number, TrainerScheduleResponseDto[]> = {}
  schedules.forEach(s=> { const wd=s.weekday??0; byDay[wd]=byDay[wd]?[...byDay[wd],s]:[s] })
  const order = Object.keys(byDay).map(Number).sort((a,b)=>a-b)

  const formatRange = (s:TrainerScheduleResponseDto) => `${s.startTime?.slice(0,5)} - ${s.endTime?.slice(0,5)}`

  return (
    <div className="space-y-3">
      {order.map(day=> (
        <Card key={day} className="border border-green-600/40">
          <CardHeader className="py-3 pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <CalendarIcon className="w-4 h-4"/> {weekdayNames[day]}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-2">
            {byDay[day].map(s=> (
              <div key={s.id} className="rounded-md border border-green-500 bg-green-500/15 p-2 text-[11px] leading-tight">
                <div className="font-semibold text-green-700 dark:text-green-200 text-xs mb-0.5">{s.seriesName}</div>
                <div className="text-muted-foreground">{formatRange(s)}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default function TrainerSchedulePage(){
  const params = useParams<{id:string}>()
  const trainerId = params.id as string
  const qc = useQueryClient()
  const [bulkOpen, setBulkOpen] = useState(false)
  const [weekConfig, setWeekConfig] = useState<WeekConfigRow[]>([])
  const [classDuration, setClassDuration] = useState<number>(60)
  const [saving, setSaving] = useState(false)

  const schedulesQueryOptions = getSchedulesByTrainerOptions({path:{trainerId}, client: apiClient})
  const {data, isLoading:loadingList, error: listError, isFetching: fetchingList} = useQuery(schedulesQueryOptions)

  const createMutation = useMutation(createScheduleMutation({client: apiClient}))
  const updateMutation = useMutation(updateScheduleMutation({client: apiClient}))
  const deleteMutation = useMutation(deleteScheduleMutation({client: apiClient}))

  // Initialize weekConfig from backend schedules when dialog opens
  useEffect(()=>{
    if(!bulkOpen) return
    const list: TrainerScheduleResponseDto[] = (data as TrainerScheduleResponseDto[] | undefined) || []
    // Group all active schedules by weekday and collect their slot starts
    const grouped: Record<number, TrainerScheduleResponseDto[]> = {}
    for(const s of list){
      const wd = s.weekday ?? 0
      if(!grouped[wd]) grouped[wd] = []
      grouped[wd].push(s)
    }
    const defaults: WeekConfigRow[] = Array.from({length:7}, (_,i)=>{
      const slots = (grouped[i]||[]).slice().sort((a,b)=> (a.startTime||'').localeCompare(b.startTime||''))
      const firstStart = toHHmm(slots[0]?.startTime) || '08:00'
      const lastEnd = toHHmm(slots[slots.length-1]?.endTime) || '12:00'
      const existingActive = new Map<string,string>()
      const selectedStarts = new Set<string>()
      for(const s of slots){
        const st = toHHmm(s.startTime)
        if(st){ existingActive.set(st, s.id||''); selectedStarts.add(st) }
      }
      const any = slots.length>0
      // Best-effort infer duration from first slot
      const inferredDur = slots.length>0 && slots[0]?.startTime && slots[0]?.endTime
        ? Math.max(15, (Number(slots[0].endTime?.slice(0,2))*60 + Number(slots[0].endTime?.slice(3,5))) - (Number(slots[0].startTime?.slice(0,2))*60 + Number(slots[0].startTime?.slice(3,5))))
        : 60
      setClassDuration(prev=> prev || inferredDur)
      return {
        weekday: i,
        enabled: any,
        seriesName: (slots[0]?.seriesName) || 'Treino',
        shiftStart: firstStart,
        shiftEnd: lastEnd,
        existingActive,
        selectedStarts,
      }
    })
    setWeekConfig(defaults)
  }, [bulkOpen, data])

  // When classDuration changes, auto-select newly generated slots for enabled days
  useEffect(()=>{
    setWeekConfig(prev=> prev.map(r=>{
      if(!r.enabled) return r
      const slots = genSlots(r)
      const sel = new Set(r.selectedStarts)
      let changed = false
      for(const s of slots){ if(!sel.has(s)){ sel.add(s); changed = true } }
      return changed ? {...r, selectedStarts: sel} : r
    }))
  }, [classDuration])

  const toggleEnabled = (weekday:number) => setWeekConfig(prev=> prev.map(r=> {
    if(r.weekday!==weekday) return r
    const nextEnabled = !r.enabled
    if(!nextEnabled) return {...r, enabled: nextEnabled}
    // When enabling, select all generated slots by default
    const slots = genSlots(r)
    return {...r, enabled: nextEnabled, selectedStarts: new Set(slots)}
  }))
  const updateRow = (weekday:number, patch: Partial<WeekConfigRow>) => setWeekConfig(prev=> prev.map(r=> {
    if(r.weekday!==weekday) return r
    const next = {...r, ...patch}
    // If shift times changed or classDuration changed elsewhere, auto-select new slots
    const slots = genSlots(next)
    // Keep existing selections and add any newly generated slots
    const selected = new Set(next.selectedStarts)
    let changed = false
    for(const s of slots){ if(!selected.has(s)){ selected.add(s); changed = true } }
    return changed ? {...next, selectedStarts: selected} : next
  }))

  // Generate slots for UI preview
  const genSlots = (row: WeekConfigRow): string[] => {
    if(!row.enabled) return []
    const out: string[] = []
    let cur = row.shiftStart
    while(cur && row.shiftEnd && cmpHHmm(addMinutesHHmm(cur, classDuration), row.shiftEnd) <= 0){
      out.push(cur)
      cur = addMinutesHHmm(cur, classDuration)
    }
    return out
  }
  const toggleSlot = (weekday:number, start:string) => setWeekConfig(prev=> prev.map(r=> {
    if(r.weekday!==weekday) return r
    const sel = new Set(r.selectedStarts)
    if(sel.has(start)) sel.delete(start); else sel.add(start)
    return {...r, selectedStarts: sel}
  }))

  const weekdayLabel = (n:number)=> weekdayNames[n]

  const rowsInvalid = useMemo(
    () => weekConfig.some(r=> r.enabled && (!r.seriesName || !r.shiftStart || !r.shiftEnd || r.shiftEnd <= r.shiftStart)) || classDuration < 15,
    [weekConfig, classDuration]
  )

  const handleSaveWeek = async () => {
    setSaving(true)
    try {
      for(const row of weekConfig){
        // Compute desired slots for this day
        const desired = row.enabled ? new Set(genSlots(row)) : new Set<string>()
        // Existing active slots
        const existingActive = row.existingActive
        // 1) Deletions: remove if not desired OR user deselected it
        for(const [start,id] of existingActive){
          const isSelected = row.selectedStarts.has(start)
          if(!desired.has(start) || !isSelected){
            await deleteMutation.mutateAsync({path:{id}})
          }
        }
        // 2) Creations: desired starts not existing and selected by user
        for(const start of desired){
          const isSelected = row.selectedStarts.has(start)
          if(!existingActive.has(start) && isSelected){
            const end = addMinutesHHmm(start, classDuration)
            const payload: TrainerScheduleRequestDto = {
              trainerId,
              weekday: row.weekday,
              startTime: `${start}:00`,
              endTime: `${end}:00`,
              intervalDuration: classDuration,
              seriesName: row.seriesName || 'Treino'
            }
            await createMutation.mutateAsync({body: payload})
          }
        }
      }
      // Invalidate impacted queries so UI reflects new availability
      await qc.invalidateQueries({queryKey: getSchedulesByTrainerQueryKey({path:{trainerId}, client: apiClient})})
      await qc.invalidateQueries({queryKey: getAvailableSessionSeriesQueryKey({client: apiClient})})
      // Also refresh the monthly schedule view
      const today = new Date()
      const monthStart = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1))
      const monthEnd = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth()+1, 0))
      const monthStartIso = monthStart.toISOString().slice(0,10)
      const monthEndIso = monthEnd.toISOString().slice(0,10)
      await qc.invalidateQueries({ queryKey: getScheduleQueryKey({ client: apiClient, query: { startDate: monthStartIso, endDate: monthEndIso } }) })
      setBulkOpen(false)
    } finally {
      setSaving(false)
    }
  }

  const grouped = useMemo(()=>{
    const list: TrainerScheduleResponseDto[] = (data as TrainerScheduleResponseDto[] | undefined) || []
    return list.slice().sort((a,b)=>(a.weekday??0)-(b.weekday??0) || (a.startTime||'').localeCompare(b.startTime||''))
  },[data])

  return (
    <Layout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Agenda do Instrutor</h1>
            <p className="text-muted-foreground text-sm">Configure os horários semanais e séries geradas</p>
          </div>
          <div className="flex gap-2">
            <Dialog open={bulkOpen} onOpenChange={(o)=>{setBulkOpen(o)}}>
              <DialogTrigger asChild>
                <Button className="bg-green-600 hover:bg-green-700">
                  <Settings2 className="w-4 h-4 mr-2"/> Configurar Semana
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-6xl">
                <DialogHeader>
                  <DialogTitle>Configuração Semanal</DialogTitle>
                </DialogHeader>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-medium">Duração da aula (min)</label>
                    <Input type="number" className="h-8 w-24 text-xs" value={classDuration} onChange={e=> setClassDuration(Math.max(15, Number(e.target.value||"60")))} />
                  </div>
                  <div className="flex flex-col gap-2 max-h-[65vh] overflow-y-auto pr-1 -mr-1 md:max-h-none md:flex-row md:flex-nowrap md:overflow-x-auto md:overflow-y-visible md:px-1 md:gap-2">
                    {weekConfig.map(r=> (
                      <div key={r.weekday} className={`rounded-md border p-1.5 ${!r.enabled? 'opacity-60':''} flex-1 min-w-[100px] max-w-[360px] md:flex-[1_1_280px] lg:flex-[1_1_340px]`}>
                        <div className="mb-2">
                          <div className="flex items-center gap-2">
                            <Checkbox checked={r.enabled} onCheckedChange={()=>toggleEnabled(r.weekday)} />
                            <span className="text-[13px] font-medium">{weekdayLabel(r.weekday)}</span>
                          </div>
                          <div className="mt-1 flex items-center gap-1.5 text-[10px] text-muted-foreground">
                            <Clock className="w-3 h-3"/>
                            <span>{r.shiftStart} – {r.shiftEnd}</span>
                          </div>
                        </div>
                        {r.enabled && (
                          <div className="space-y-2">
                            <div className="grid grid-cols-1 gap-2 text-[11px]">
                              <div>
                                <label className="block text-[10px] font-medium mb-0.5">Série</label>
                                <Input value={r.seriesName} onChange={e=>updateRow(r.weekday,{seriesName:e.target.value})} className="h-8 text-xs" placeholder="Treino" />
                              </div>
                              <div>
                                <label className="block text-[10px] font-medium mb-0.5">Início do turno</label>
                                <Input type="time" value={r.shiftStart} onChange={e=>updateRow(r.weekday,{shiftStart:e.target.value})} className="h-8 text-xs" />
                              </div>
                              <div>
                                <label className="block text-[10px] font-medium mb-0.5">Fim do turno</label>
                                <Input type="time" value={r.shiftEnd} onChange={e=>updateRow(r.weekday,{shiftEnd:e.target.value})} className="h-8 text-xs" />
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {genSlots(r).length===0 && <span className="text-xs text-muted-foreground">Sem blocos no horário informado.</span>}
                              {genSlots(r).map(start=>{
                                const end = addMinutesHHmm(start, classDuration)
                                const selected = r.selectedStarts.has(start)
                                return (
                                  <button key={start} onClick={()=> toggleSlot(r.weekday, start)} type="button" className={`px-2 py-1 rounded border text-[11px] flex items-center gap-1 ${selected? 'bg-green-50 border-green-300 dark:bg-green-950 dark:border-green-800':'hover:bg-muted'}`}>
                                    {selected? <SquareCheck className="w-3 h-3"/>: <Square className="w-3 h-3"/>}
                                    {start}–{end}
                                  </button>
                                )
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-end gap-2 pt-2">
                    <Button variant="outline" onClick={()=> setBulkOpen(false)}>Cancelar</Button>
                    <Button onClick={handleSaveWeek} disabled={rowsInvalid || saving} className="bg-green-600 hover:bg-green-700">
                      {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : <Save className="w-4 h-4 mr-2"/>}
                      Salvar
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Current timetable preview */}
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Horários Ativos</h2>
          {loadingList && (
            <div className="text-sm text-muted-foreground flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin"/> Carregando...</div>
          )}
          {!loadingList && (
            <>
              <div className="hidden md:block">
                <WeekTimetable schedules={grouped} />
              </div>
              <div className="md:hidden">
                <MobileTimetable schedules={grouped} />
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  )
}
0
