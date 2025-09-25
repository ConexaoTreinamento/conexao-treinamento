"use client"

import {useState, useMemo} from "react"
import {useParams, useRouter} from "next/navigation"
import Layout from "@/components/layout"
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card"
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select"
import {Badge} from "@/components/ui/badge"
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger} from "@/components/ui/dialog"
import {Trash2, Plus, Save, Loader2, Calendar as CalendarIcon, Clock, RefreshCcw} from "lucide-react"
import {useForm, FormProvider, Controller} from "react-hook-form"
import {z} from "zod"
import {zodResolver} from "@hookform/resolvers/zod"
import {useQueryClient, useMutation} from "@tanstack/react-query"
import {apiClient} from "@/lib/client"
import {getSchedulesByTrainerOptions, createScheduleMutation, updateScheduleMutation, deleteScheduleMutation} from "@/lib/api-client/@tanstack/react-query.gen"
import {useQuery} from "@tanstack/react-query"
import {type TrainerScheduleResponseDto, type TrainerScheduleRequestDto} from "@/lib/api-client/types.gen"

const weekdayNames: Record<number,string> = {0:"Domingo",1:"Segunda",2:"Terça",3:"Quarta",4:"Quinta",5:"Sexta",6:"Sábado"}

const scheduleSchema = z.object({
  weekday: z.number().int().min(0).max(6),
  startTime: z.string(),
  endTime: z.string(),
  intervalDuration: z.coerce.number().int().min(15).max(240).default(60),
  seriesName: z.string().min(1, "Obrigatório")
})

type ScheduleFormData = z.infer<typeof scheduleSchema>

export default function TrainerSchedulePage(){
  const params = useParams<{id:string}>()
  const trainerId = params.id as string
  const router = useRouter()
  const qc = useQueryClient()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<TrainerScheduleResponseDto | null>(null)

  const schedulesQueryOptions = getSchedulesByTrainerOptions({path:{trainerId}, client: apiClient})
  const {data, isLoading:loadingList, error: listError, refetch: refetchList, isFetching: fetchingList} = useQuery(schedulesQueryOptions)

  const createMutation = useMutation(createScheduleMutation({client: apiClient}))
  const updateMutation = useMutation(updateScheduleMutation({client: apiClient}))
  const deleteMutation = useMutation(deleteScheduleMutation({client: apiClient}))

  const methods = useForm<ScheduleFormData>({resolver: zodResolver(scheduleSchema), defaultValues:{weekday:1,startTime:"08:00", endTime:"12:00", intervalDuration:60, seriesName:"Treino"}})

  const onSubmit = async (values: ScheduleFormData) => {
    const payload: TrainerScheduleRequestDto = {trainerId, ...values}
    try {
      if(editing?.id){
        await updateMutation.mutateAsync({path:{id: editing.id}, body: payload})
      } else {
        await createMutation.mutateAsync({body: payload})
      }
      setOpen(false); setEditing(null); methods.reset()
      await qc.invalidateQueries({queryKey:['getSchedulesByTrainer']})
    } catch(e){/* no-op */}
  }

  const handleEdit = (sch: TrainerScheduleResponseDto) => { 
    setEditing(sch)
    methods.reset({weekday: sch.weekday ?? 1, startTime: sch.startTime?.slice(0,5) || "08:00", endTime: sch.endTime?.slice(0,5) || "09:00", intervalDuration: sch.intervalDuration ?? 60, seriesName: sch.seriesName || ""})
    setOpen(true)
  }

  const handleDelete = async (id?: string) => {
    if(!id) return
  await deleteMutation.mutateAsync({path:{id}})
    await qc.invalidateQueries({queryKey:['getSchedulesByTrainer']})
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
            <Button variant="outline" onClick={()=>refetchList?.()} disabled={fetchingList}>
              {fetchingList ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/>:<RefreshCcw className="w-4 h-4 mr-2"/>}
              Atualizar
            </Button>
            <Dialog open={open} onOpenChange={(o)=>{setOpen(o); if(!o){setEditing(null); methods.reset()}}}>
              <DialogTrigger asChild>
                <Button className="bg-green-600 hover:bg-green-700">
                  <Plus className="w-4 h-4 mr-2"/> Novo Horário
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>{editing? 'Editar Horário':'Novo Horário'}</DialogTitle>
                </DialogHeader>
                <FormProvider {...methods}>
                  <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-medium">Dia</label>
                        <Controller name="weekday" control={methods.control} render={({field})=> (
                          <Select value={String(field.value)} onValueChange={(v)=>field.onChange(Number(v))}>
                            <SelectTrigger><SelectValue/></SelectTrigger>
                            <SelectContent>
                              {Object.entries(weekdayNames).map(([n,label])=> <SelectItem key={n} value={n}>{label}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        )}/>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium">Série</label>
                        <Input {...methods.register('seriesName')}/>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium">Início</label>
                        <Input type="time" {...methods.register('startTime')}/>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium">Fim</label>
                        <Input type="time" {...methods.register('endTime')}/>
                      </div>
                      <div className="space-y-1 col-span-2">
                        <label className="text-xs font-medium">Duração por aula (min)</label>
                        <Input type="number" {...methods.register('intervalDuration',{valueAsNumber:true})}/>
                      </div>
                    </div>
                    <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={createMutation.isPending || updateMutation.isPending}>
                      {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="w-4 h-4 mr-2 animate-spin"/>}
                      <Save className="w-4 h-4 mr-2"/> Salvar
                    </Button>
                  </form>
                </FormProvider>
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
                    <Button size="sm" variant="outline" onClick={()=>handleEdit(s)}>Editar</Button>
                    <Button size="icon" variant="outline" onClick={()=>handleDelete(s.id)} disabled={deleteMutation.isPending}><Trash2 className="w-4 h-4"/></Button>
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
