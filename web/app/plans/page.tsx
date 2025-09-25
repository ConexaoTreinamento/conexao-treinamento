"use client"

import {useState, useMemo} from 'react'
import Layout from '@/components/layout'
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query'
import {apiClient} from '@/lib/client'
import {getAllPlansOptions, createPlanMutation, deletePlanMutation} from '@/lib/api-client/@tanstack/react-query.gen'
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card'
import {Button} from '@/components/ui/button'
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger} from '@/components/ui/dialog'
import {Input} from '@/components/ui/input'
import {Badge} from '@/components/ui/badge'
import {Plus, Loader2, RefreshCcw, Save, Pencil, Trash2, X} from 'lucide-react'
import ConfirmDeleteButton from '@/components/confirm-delete-button'
import {useForm} from 'react-hook-form'
import {z} from 'zod'
import {zodResolver} from '@hookform/resolvers/zod'
import {useToast} from '@/hooks/use-toast'
import { StudentPlanResponseDto } from '@/lib/api-client'

const planSchema = z.object({
  name: z.string().min(2,'Nome obrigatório'),
  maxDays: z.coerce.number().int().min(1).max(7),
  durationDays: z.coerce.number().int().min(7).max(365)
})

type PlanForm = z.infer<typeof planSchema>

export default function PlansPage(){
  const qc = useQueryClient()
  const {toast} = useToast()
  const plansQueryOptions = getAllPlansOptions({client: apiClient})
  const {data, isLoading, isFetching, refetch, error} = useQuery(plansQueryOptions)

  const createPlan = useMutation({
    ...createPlanMutation({client: apiClient}),
    onSuccess: async () => {
      // invalidate after successful create
      await qc.invalidateQueries({queryKey: plansQueryOptions.queryKey})
      toast({title:'Plano criado'})
      form.reset({name:'', maxDays:3, durationDays:30})
      setOpen(false)
    },
    onError: () => toast({title:'Erro ao criar plano', variant:'destructive'})
  })

  const deletePlan = useMutation({
    ...deletePlanMutation({client: apiClient}),
    // optimistic update
    onMutate: async (vars) => {
      await qc.cancelQueries({queryKey: plansQueryOptions.queryKey})
      const prev = qc.getQueryData(plansQueryOptions.queryKey)
      if(prev){
        qc.setQueryData(plansQueryOptions.queryKey, prev.filter(p=> p.id !== vars.path.planId))
      }
      return {prev}
    },
    onError: (_err: Error, context: any) => {
      if(context?.prev) qc.setQueryData(plansQueryOptions.queryKey, context.prev)
      toast({title:'Erro ao excluir plano', variant:'destructive'})
    },
    onSuccess: () => toast({title:'Plano excluído'}),
    onSettled: () => qc.invalidateQueries({queryKey: plansQueryOptions.queryKey})
  })

  // Editing state
  const [editingId, setEditingId] = useState<string|null>(null)
  const [editValues, setEditValues] = useState<{name:string; maxDays:number; durationDays:number}>({name:'', maxDays:1, durationDays:30})

  const startEdit = (p: StudentPlanResponseDto)=> {
    setEditingId(p.id!)
    setEditValues({name: p.name!, maxDays: p.maxDays!, durationDays: p.durationDays!})
  }

  const cancelEdit = ()=> {
    setEditingId(null)
  }

  // Normalize plans: support both API field naming variants (planId/planName or id/name)
  const plans = useMemo(()=> {
    const list = (data||[]) as any[]
    const normalized = list.map(p => ({
      _raw: p,
      id: p.planId ?? p.id,
      name: p.planName ?? p.name ?? '',
      maxDays: p.planMaxDays ?? p.maxDays,
      durationDays: p.planDurationDays ?? p.durationDays
    })).filter(p=> !!p.id)
    normalized.sort((a,b)=> a.name.localeCompare(b.name))
    return normalized
  },[data])

  const [open,setOpen] = useState(false)
  const form = useForm<PlanForm>({resolver: zodResolver(planSchema), defaultValues:{name:'', maxDays:3, durationDays:30}})

  const submit = (v:PlanForm)=>{
    createPlan.mutate({body:{name: v.name, maxDays: v.maxDays, durationDays: v.durationDays}})
  }

  const saveEdit = () => {
    if(!editingId) return
    // Optimistic update only (no update endpoint yet) - in future replace with real update mutation
    const prev = qc.getQueryData<any[]>(plansQueryOptions.queryKey)
    if(prev){
      qc.setQueryData<any[]>(plansQueryOptions.queryKey, prev.map(p=> p.planId===editingId? {...p, planName: editValues.name, planMaxDays: editValues.maxDays, planDurationDays: editValues.durationDays}: p))
      toast({title:'Plano atualizado (local)', description:'Endpoint de atualização não implementado'})
    }
    setEditingId(null)
  }

  return (
    <Layout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Planos</h1>
            <p className="text-sm text-muted-foreground">Gerencie os planos de assinatura</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={()=>refetch()} disabled={isFetching}>{isFetching? <Loader2 className="w-4 h-4 animate-spin"/>:<RefreshCcw className="w-4 h-4"/>}</Button>
            <Dialog open={open} onOpenChange={(o)=> {setOpen(o); if(!o) form.reset()}}>
              <DialogTrigger asChild>
                <Button className="bg-green-600 hover:bg-green-700"><Plus className="w-4 h-4 mr-2"/> Novo Plano</Button>
              </DialogTrigger>
              <DialogContent className="max-w-sm">
                <DialogHeader><DialogTitle>Novo Plano</DialogTitle></DialogHeader>
                <form onSubmit={form.handleSubmit(submit)} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Nome</label>
                    <Input {...form.register('name')}/>
                    {form.formState.errors.name && <p className="text-xs text-red-600">{form.formState.errors.name.message}</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-medium">Dias/semana</label>
                      <Input type="number" {...form.register('maxDays',{valueAsNumber:true})}/>
                      {form.formState.errors.maxDays && <p className="text-xs text-red-600">{form.formState.errors.maxDays.message}</p>}
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium">Duração (dias)</label>
                      <Input type="number" {...form.register('durationDays',{valueAsNumber:true})}/>
                      {form.formState.errors.durationDays && <p className="text-xs text-red-600">{form.formState.errors.durationDays.message}</p>}
                    </div>
                  </div>
                  <Button type="submit" disabled={createPlan.isPending} className="w-full bg-green-600 hover:bg-green-700">{createPlan.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin"/>}<Save className="w-4 h-4 mr-2"/> Salvar</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        {error && <Card><CardContent className="p-6 text-sm text-red-600">Erro ao carregar planos.</CardContent></Card>}
        {isLoading && <div className="space-y-2">{[...Array(3)].map((_,i)=><Card key={i} className="animate-pulse"><CardContent className="h-16"/></Card>)}</div>}
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {plans.map(({_raw: p, id, name, maxDays, durationDays})=> {
            const isEditing = editingId === id
            return (
              <Card key={id} className={`border-l-4 ${isEditing? 'border-l-orange-500':'border-l-green-600'}`}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center justify-between gap-2">
                    {isEditing ? (
                      <Input
                        value={editValues.name}
                        onChange={e=> setEditValues(v=> ({...v, name: e.target.value}))}
                        className="h-8 text-sm"
                      />
                    ) : (
                      <span className="truncate" title={name}>{name}</span>
                    )}
                    <Badge variant="outline" className="text-xs whitespace-nowrap">{isEditing? editValues.maxDays : maxDays}d/sem</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Duração: {isEditing? editValues.durationDays : durationDays} dias</span>
                  </div>
                  {isEditing && (
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="space-y-1">
                        <label className="text-[10px] font-medium">Dias/sem</label>
                        <Input type="number" value={editValues.maxDays} onChange={e=> setEditValues(v=> ({...v, maxDays: Number(e.target.value)}))} className="h-8 text-xs" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-medium">Duração</label>
                        <Input type="number" value={editValues.durationDays} onChange={e=> setEditValues(v=> ({...v, durationDays: Number(e.target.value)}))} className="h-8 text-xs" />
                      </div>
                    </div>
                  )}
                  <div className="flex gap-2 pt-1">
                    {isEditing ? (
                      <>
                        <Button size="sm" className="h-8 px-2 bg-green-600 hover:bg-green-700" onClick={saveEdit} disabled={createPlan.isPending}>Salvar</Button>
                        <Button size="sm" variant="outline" className="h-8 px-2" onClick={cancelEdit}><X className="w-3 h-3"/></Button>
                      </>
                    ) : (
                      <>
                        <Button size="sm" variant="outline" className="h-8 px-2" onClick={()=> startEdit({id, name, maxDays, durationDays})}><Pencil className="w-3 h-3"/></Button>
                        <ConfirmDeleteButton
                          size="sm"
                          variant="outline"
                          className="h-8 px-2"
                          title="Excluir Plano"
                          description={`Tem certeza que deseja excluir o plano "${name}"?`}
                          onConfirm={()=> deletePlan.mutate({path:{planId: id}, client: apiClient})}
                          disabled={deletePlan.isPending}
                        >
                          <Trash2 className="w-3 h-3"/>
                        </ConfirmDeleteButton>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
          {!isLoading && (data||[]).length===0 && <Card><CardContent className="p-6 text-sm text-muted-foreground">Nenhum plano cadastrado.</CardContent></Card>}
        </div>
      </div>
    </Layout>
  )
}
