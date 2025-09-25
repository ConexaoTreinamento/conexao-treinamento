"use client"

import {useState, useMemo} from "react"
import Layout from "@/components/layout"
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card"
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {Badge} from "@/components/ui/badge"
import {Plus, Loader2, Users, Clock, User, CalendarDays, Save, X} from "lucide-react"
import {useRouter} from "next/navigation"
import {apiClient} from "@/lib/client"
import {getScheduleOptions} from "@/lib/api-client/@tanstack/react-query.gen"
import {useQuery, useQueryClient} from "@tanstack/react-query"
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger} from "@/components/ui/dialog"
import {useForm} from "react-hook-form"
import {z} from "zod"
import {zodResolver} from "@hookform/resolvers/zod"
import {useToast} from "@/hooks/use-toast"

// One-off creation schema (creating a standalone session). Backend currently exposes updateSession only; this acts as local placeholder.
const oneOffSchema = z.object({
  seriesName: z.string().min(1, 'Obrigatório'),
  startTime: z.string().regex(/^\d{2}:\d{2}$/,'HH:MM'),
  endTime: z.string().regex(/^\d{2}:\d{2}$/,'HH:MM'),
  trainerName: z.string().optional()
}).refine(v=> v.endTime > v.startTime, {message:'Fim deve ser após início', path:['endTime']})

type OneOffForm = z.infer<typeof oneOffSchema>

export default function DailySchedulePage(){
  const [date, setDate] = useState(()=> new Date().toISOString().slice(0,10))
  const router = useRouter()
  const qc = useQueryClient()
  const { toast } = useToast()

  const startDate = date
  const endDate = date

  const scheduleQueryOptions = getScheduleOptions({query:{startDate, endDate}, client: apiClient})
  const {data, isLoading, error, refetch, isFetching} = useQuery(scheduleQueryOptions)

  // (Future) Use mutation for creating one-off sessions once backend endpoint exists.

  const [openNew, setOpenNew] = useState(false)
  const form = useForm<OneOffForm>({resolver: zodResolver(oneOffSchema), defaultValues:{seriesName:'Nova Aula', startTime:'08:00', endTime:'09:00', trainerName:''}})

  const submitOneOff = (values: OneOffForm) => {
    // Since create session endpoint not present in SDK, we optimistically inject a local item.
    // This prevents blocking UI until backend supports one-off creation.
    const fakeId = `oneoff-${Date.now()}`
    const startISO = `${date}T${values.startTime}:00`
    const endISO = `${date}T${values.endTime}:00`
    const optimistic = {sessionId: fakeId, startTime: startISO, endTime: endISO, seriesName: values.seriesName, trainerName: values.trainerName, students: []}
    qc.setQueryData(scheduleQueryOptions.queryKey, (old: any)=> ({...old, sessions:[...(old?.sessions||[]), optimistic]}))
    toast({title:'Aula criada', description:'Aula avulsa adicionada localmente.'})
    setOpenNew(false)
  }

  const sessions = useMemo(()=> data?.sessions || [], [data])

  return (
    <Layout>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold flex items-center gap-2"><CalendarDays className="w-5 h-5"/> Agenda</h1>
            <p className="text-sm text-muted-foreground">Visualize e gerencie as aulas do dia</p>
          </div>
          <div className="flex gap-2 items-center">
            <Input type="date" value={date} onChange={(e)=> setDate(e.target.value)} className="w-44"/>
            <Button onClick={()=>refetch?.()} variant="outline" disabled={isFetching}>{isFetching? <Loader2 className="w-4 h-4 animate-spin"/>: 'Atualizar'}</Button>
            <Dialog open={openNew} onOpenChange={(o)=> {setOpenNew(o); if(!o) form.reset()}}>
              <DialogTrigger asChild>
                <Button className="bg-green-600 hover:bg-green-700">
                  <Plus className="w-4 h-4 mr-2"/> Nova Aula
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-sm">
                <DialogHeader><DialogTitle>Nova Aula Avulsa</DialogTitle></DialogHeader>
                <form onSubmit={form.handleSubmit(submitOneOff)} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Nome</label>
                    <Input {...form.register('seriesName')}/>
                    {form.formState.errors.seriesName && <p className="text-xs text-red-600">{form.formState.errors.seriesName.message}</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-medium">Início</label>
                      <Input type="time" {...form.register('startTime')}/>
                      {form.formState.errors.startTime && <p className="text-xs text-red-600">{form.formState.errors.startTime.message}</p>}
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium">Fim</label>
                      <Input type="time" {...form.register('endTime')}/>
                      {form.formState.errors.endTime && <p className="text-xs text-red-600">{form.formState.errors.endTime.message}</p>}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Instrutor (opcional)</label>
                    <Input {...form.register('trainerName')}/>
                  </div>
                  <DialogFooter className="flex gap-2 sm:justify-end">
                    <Button type="button" variant="outline" onClick={()=> setOpenNew(false)}><X className="w-4 h-4 mr-1"/> Cancelar</Button>
                    <Button type="submit" className="bg-green-600 hover:bg-green-700"><Save className="w-4 h-4 mr-1"/> Salvar</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {isLoading && (
          <div className="space-y-2">{[...Array(4)].map((_,i)=> <Card key={i} className="animate-pulse"><CardContent className="h-20"/></Card>)}</div>
        )}
        {error && (
          <Card><CardContent className="p-6 text-sm text-red-600">Erro ao carregar agenda.</CardContent></Card>
        )}

        <div className="space-y-3">
          {sessions.sort((a:any,b:any)=> (a.startTime||'').localeCompare(b.startTime||'')).map((s:any)=> {
            const start = s.startTime?.slice(11,16)
            const end = s.endTime?.slice(11,16)
            const total = (s.students||[]).length
            const attending = (s.students||[]).filter((st:any)=> st.commitmentStatus==='ATTENDING').length
            const occupancy = `${attending}/${total}`
            return (
              <Card key={s.sessionId} onClick={()=> router.push(`/schedule/${encodeURIComponent(s.sessionId)}?date=${date}`)} className="cursor-pointer hover:shadow-md transition border-l-4 border-l-green-600">
                <CardHeader className="py-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Clock className="w-4 h-4"/> {start} - {end} • {s.seriesName}
                    </CardTitle>
                    <div className="flex items-center gap-3 text-xs">
                      <Badge variant="outline" className="flex items-center gap-1"><User className="w-3 h-3"/>{s.trainerName || '—'}</Badge>
                      <Badge variant="outline" className="flex items-center gap-1"><Users className="w-3 h-3"/>{occupancy}</Badge>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            )
          })}
          {!isLoading && sessions.length===0 && <Card><CardContent className="p-6 text-sm text-muted-foreground">Nenhuma aula para este dia.</CardContent></Card>}
        </div>
      </div>
    </Layout>
  )
}
