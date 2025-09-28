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
import {Save, Loader2, Calendar as CalendarIcon, Clock, RefreshCcw, Settings2} from "lucide-react"
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
  startTime: string
  endTime: string
  intervalDuration: number
  existingId?: string
  dirty?: boolean
}

export default function TrainerSchedulePage(){
  const params = useParams<{id:string}>()
  const trainerId = params.id as string
  const qc = useQueryClient()
  const [bulkOpen, setBulkOpen] = useState(false)
  const [weekConfig, setWeekConfig] = useState<WeekConfigRow[]>([])
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
    const byWeekday: Record<number, TrainerScheduleResponseDto> = {}
    list.forEach(s=> { if(s.weekday!==undefined) byWeekday[s.weekday]=s })
    const defaults: WeekConfigRow[] = Array.from({length:7}, (_,i)=>{
      const existing = byWeekday[i]
      return {
        weekday: i,
        enabled: !!existing,
        seriesName: existing?.seriesName || 'Treino',
        startTime: existing?.startTime?.slice(0,5) || '08:00',
        endTime: existing?.endTime?.slice(0,5) || '09:00',
        intervalDuration: existing?.intervalDuration || 60,
        existingId: existing?.id,
        dirty: false
      }
    })
    setWeekConfig(defaults)
  }, [bulkOpen, data])

  const toggleEnabled = (weekday:number) => setWeekConfig(prev=> prev.map(r=> r.weekday===weekday ? {...r, enabled:!r.enabled, dirty:true}: r))
  const updateRow = (weekday:number, patch: Partial<WeekConfigRow>) => setWeekConfig(prev=> prev.map(r=> r.weekday===weekday ? {...r, ...patch, dirty:true}: r))

  const weekdayLabel = (n:number)=> weekdayNames[n]

  const rowsInvalid = useMemo(()=> weekConfig.some(r=> r.enabled && (!r.seriesName || !r.startTime || !r.endTime || r.endTime <= r.startTime)), [weekConfig])

  const handleSaveWeek = async () => {
    setSaving(true)
    try {
      for(const row of weekConfig){
        // Delete disabled existing
        if(!row.enabled && row.existingId){
          await deleteMutation.mutateAsync({path:{id: row.existingId}})
          continue
        }
        if(!row.enabled) continue
        const payload: TrainerScheduleRequestDto = {
          trainerId,
          weekday: row.weekday,
          startTime: row.startTime+':00',
          endTime: row.endTime+':00',
          intervalDuration: row.intervalDuration,
          seriesName: row.seriesName
        }
        if(row.existingId){
          await updateMutation.mutateAsync({path:{id: row.existingId}, body: payload})
        } else {
          await createMutation.mutateAsync({body: payload})
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
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>Configuração Semanal</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  {/* Desktop / larger screens table */}
                  <div className="hidden sm:block overflow-x-auto">
                    <table className="w-full text-xs border-collapse">
                      <thead>
                        <tr className="text-[11px] text-muted-foreground">
                          <th className="p-2 text-left w-12">Ativo</th>
                          <th className="p-2 text-left w-24">Dia</th>
                          <th className="p-2 text-left w-28">Série</th>
                          <th className="p-2 text-left w-28">Início</th>
                          <th className="p-2 text-left w-28">Fim</th>
                          <th className="p-2 text-left w-28">Duração</th>
                        </tr>
                      </thead>
                      <tbody>
                        {weekConfig.map(r=> (
                          <tr key={r.weekday} className={r.enabled ? "" : "opacity-40"}>
                            <td className="p-1 align-middle">
                              <Checkbox checked={r.enabled} onCheckedChange={()=>toggleEnabled(r.weekday)} className="scale-90" />
                            </td>
                            <td className="p-1 align-middle font-medium">{weekdayLabel(r.weekday)}</td>
                            <td className="p-1 align-middle">
                              <Input disabled={!r.enabled} value={r.seriesName} onChange={e=>updateRow(r.weekday,{seriesName:e.target.value})} className="h-8 text-xs" placeholder="Treino"/>
                            </td>
                            <td className="p-1 align-middle">
                              <Input type="time" disabled={!r.enabled} value={r.startTime} onChange={e=>updateRow(r.weekday,{startTime:e.target.value})} className="h-8 text-xs"/>
                            </td>
                            <td className="p-1 align-middle">
                              <Input type="time" disabled={!r.enabled} value={r.endTime} onChange={e=>updateRow(r.weekday,{endTime:e.target.value})} className="h-8 text-xs"/>
                            </td>
                            <td className="p-1 align-middle">
                              <Input type="number" disabled={!r.enabled} value={r.intervalDuration} onChange={e=>updateRow(r.weekday,{intervalDuration:Number(e.target.value)})} className="h-8 text-xs"/>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {/* Mobile stacked layout */}
                  <div className="sm:hidden space-y-2 max-h-[60vh] overflow-y-auto pr-1 -mr-1">
                    {weekConfig.map(r=> (
                      <div key={r.weekday} className={`rounded-md border p-2 bg-muted/30 ${!r.enabled ? 'opacity-50' : ''}`}>
                        <div className="flex items-center justify-between mb-1">
                          <div
                            role="button"
                            tabIndex={0}
                            onClick={()=>toggleEnabled(r.weekday)}
                            onKeyDown={(e)=>{ if(e.key==='Enter' || e.key===' '){ e.preventDefault(); toggleEnabled(r.weekday)} }}
                            className={`flex items-center gap-2 text-left cursor-pointer select-none ${r.enabled?'text-foreground':'text-muted-foreground'}`}
                            aria-pressed={r.enabled}
                          >
                            <Checkbox checked={r.enabled} className="scale-90 pointer-events-none" />
                            <span className="text-sm font-medium">{weekdayLabel(r.weekday)}</span>
                          </div>
                          <span className="text-[10px] text-muted-foreground">{r.startTime} – {r.endTime}</span>
                        </div>
                        {r.enabled && (
                          <div className="grid grid-cols-2 gap-2 text-[11px]">
                            <div className="col-span-2">
                              <label className="block text-[10px] font-medium mb-0.5">Série</label>
                              <Input value={r.seriesName} onChange={e=>updateRow(r.weekday,{seriesName:e.target.value})} className="h-8 text-xs" placeholder="Treino" />
                            </div>
                            <div>
                              <label className="block text-[10px] font-medium mb-0.5">Início</label>
                              <Input type="time" value={r.startTime} onChange={e=>updateRow(r.weekday,{startTime:e.target.value})} className="h-8 text-xs" />
                            </div>
                            <div>
                              <label className="block text-[10px] font-medium mb-0.5">Fim</label>
                              <Input type="time" value={r.endTime} onChange={e=>updateRow(r.weekday,{endTime:e.target.value})} className="h-8 text-xs" />
                            </div>
                            <div>
                              <label className="block text-[10px] font-medium mb-0.5">Duração</label>
                              <Input type="number" value={r.intervalDuration} onChange={e=>updateRow(r.weekday,{intervalDuration:Number(e.target.value)})} className="h-8 text-xs"/>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  {rowsInvalid && <p className="text-xs text-red-500">Verifique horários e séries: fim deve ser após início e todos os campos obrigatórios preenchidos.</p>}
                  <div className="flex justify-end gap-2 pt-2">
                    <Button variant="outline" onClick={()=>setBulkOpen(false)} disabled={saving}>Cancelar</Button>
                    <Button onClick={handleSaveWeek} disabled={saving || rowsInvalid} className="bg-green-600 hover:bg-green-700 min-w-[140px]">
                      {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin"/>}
                      <Save className="w-4 h-4 mr-2"/> Salvar Semana
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {loadingList && (
          <div className="space-y-2">
            {[...Array(3)].map((_,i)=> <Card key={i} className="animate-pulse"><CardContent className="h-16"/></Card>)}
          </div>
        )}
        {listError && (
          <Card><CardContent className="p-6 text-sm text-red-600">Erro ao carregar horários.</CardContent></Card>
        )}
        {/* Timetable Week View */}
        {!loadingList && grouped.length===0 && (
          <Card><CardContent className="p-6 text-sm text-muted-foreground">Nenhum horário cadastrado ainda.</CardContent></Card>
        )}
        {grouped.length>0 && (
          <>
            <div className="hidden sm:block">
              <WeekTimetable schedules={grouped} />
            </div>
            <div className="block sm:hidden">
              <MobileTimetable schedules={grouped} />
            </div>
          </>
        )}
      </div>
    </Layout>
  )
}

// --- Timetable Component ---
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
    if(!t) return 0; // expect HH:MM:SS or HH:MM
    const base = t.length>=5 ? t.slice(0,5) : t
    const [h,m] = base.split(':').map(Number)
    return h*60 + (m||0)
  }
  const starts = schedules.map(s=> toMinutes(s.startTime))
  const ends = schedules.map(s=> toMinutes(s.endTime))
  const minStart = Math.min(...starts)
  const maxEnd = Math.max(...ends)
  const startHour = Math.floor(minStart/60)
  const endHour = Math.ceil(maxEnd/60) // exclusive
  const hours: number[] = []
  for(let h=startHour; h<=endHour; h++){ hours.push(h) }

  const rowHeight = 56 // px per hour row (round number for better grid alignment)
  const totalHeight = (endHour-startHour)*rowHeight

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
