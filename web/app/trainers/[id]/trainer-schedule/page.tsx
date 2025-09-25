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
import {getSchedulesByTrainerOptions, getSchedulesByTrainerQueryKey, createScheduleMutation, updateScheduleMutation, deleteScheduleMutation} from "@/lib/api-client/@tanstack/react-query.gen"
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
  await qc.invalidateQueries({queryKey: getSchedulesByTrainerQueryKey({path:{trainerId}, client: apiClient})})
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
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="text-xs text-muted-foreground">
                          <th className="p-2 text-left">Ativo</th>
                          <th className="p-2 text-left">Dia</th>
                          <th className="p-2 text-left">Série</th>
                          <th className="p-2 text-left">Início</th>
                          <th className="p-2 text-left">Fim</th>
                          <th className="p-2 text-left">Duração (min)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {weekConfig.map(r=> (
                          <tr key={r.weekday} className={r.enabled ? "" : "opacity-50"}>
                            <td className="p-2 align-middle">
                              <Checkbox checked={r.enabled} onCheckedChange={()=>toggleEnabled(r.weekday)}/>
                            </td>
                            <td className="p-2 align-middle font-medium">{weekdayLabel(r.weekday)}</td>
                            <td className="p-2 align-middle">
                              <Input disabled={!r.enabled} value={r.seriesName} onChange={e=>updateRow(r.weekday,{seriesName:e.target.value})} className="h-8"/>
                            </td>
                            <td className="p-2 align-middle">
                              <Input type="time" disabled={!r.enabled} value={r.startTime} onChange={e=>updateRow(r.weekday,{startTime:e.target.value})} className="h-8"/>
                            </td>
                            <td className="p-2 align-middle">
                              <Input type="time" disabled={!r.enabled} value={r.endTime} onChange={e=>updateRow(r.weekday,{endTime:e.target.value})} className="h-8"/>
                            </td>
                            <td className="p-2 align-middle">
                              <Input type="number" disabled={!r.enabled} value={r.intervalDuration} onChange={e=>updateRow(r.weekday,{intervalDuration:Number(e.target.value)})} className="h-8 w-24"/>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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
        <div className="space-y-3">
          {grouped.map(s=> (
            <Card key={s.id} className="border-l-4 border-l-green-600">
              <CardHeader className="py-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4"/> {weekdayNames[s.weekday ?? 0]} • {s.seriesName}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="text-xs flex items-center gap-1"><Clock className="w-3 h-3"/> {s.startTime?.slice(0,5)} - {s.endTime?.slice(0,5)}</Badge>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
          {!loadingList && grouped.length===0 && (
            <Card><CardContent className="p-6 text-sm text-muted-foreground">Nenhum horário cadastrado ainda.</CardContent></Card>
          )}
        </div>
      </div>
    </Layout>
  )
}
