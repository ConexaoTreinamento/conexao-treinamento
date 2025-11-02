"use client"

import {useState, useMemo} from 'react'
import Layout from '@/components/layout'
import {useQuery, useMutation, useQueryClient, type DefaultError} from '@tanstack/react-query'
import {apiClient} from '@/lib/client'
import {getAllPlansOptions, createPlanMutation, deletePlanMutation} from '@/lib/api-client/@tanstack/react-query.gen'
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card'
import {Button} from '@/components/ui/button'
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger} from '@/components/ui/dialog'
import {Input} from '@/components/ui/input'
import {Badge} from '@/components/ui/badge'
import {Plus, Loader2, Save, Trash2} from 'lucide-react'
import ConfirmDeleteButton from '@/components/confirm-delete-button'
import {useForm} from 'react-hook-form'
import {z} from 'zod'
import {zodResolver} from '@hookform/resolvers/zod'
import {useToast} from '@/hooks/use-toast'
import { PageHeader } from '@/components/base/page-header'
import type { StudentPlanResponseDto, Options, DeletePlanData, CreatePlanData } from '@/lib/api-client'

const planSchema = z.object({
  name: z.string().min(2,'Nome obrigatório'),
  maxDays: z.coerce.number().int().min(1).max(7),
  durationDays: z.coerce.number().int().min(7).max(365)
})

type PlanForm = z.infer<typeof planSchema>

type DeletePlanContext = {
  prev?: StudentPlanResponseDto[]
}

type RawPlan = StudentPlanResponseDto & {
  planId?: string
  planName?: string
  planMaxDays?: number
  planDurationDays?: number
}

type NormalizedPlan = {
  id: string
  name: string
  maxDays: number
  durationDays: number
}

export default function PlansPage(){
  const qc = useQueryClient()
  const {toast} = useToast()
  const plansQueryOptions = getAllPlansOptions({client: apiClient})
  const {data, isLoading, error} = useQuery(plansQueryOptions)

  const createPlan = useMutation<StudentPlanResponseDto, DefaultError, Options<CreatePlanData>>({
    ...createPlanMutation({client: apiClient}),
    onSuccess: async () => {
      // invalidate after successful create
      await qc.invalidateQueries({queryKey: plansQueryOptions.queryKey})
      toast({title:'Plano criado', variant: 'success'})
      form.reset({name:'', maxDays:3, durationDays:30})
      setOpen(false)
    },
    onError: () => toast({title:'Erro ao criar plano', variant:'destructive'})
  })

  const deletePlan = useMutation<unknown, DefaultError, Options<DeletePlanData>, DeletePlanContext>({
    ...deletePlanMutation({client: apiClient}),
    // optimistic update
    onMutate: async (vars) => {
      await qc.cancelQueries({queryKey: plansQueryOptions.queryKey})
      const prev = qc.getQueryData<StudentPlanResponseDto[]>(plansQueryOptions.queryKey)
      if(prev){
        const filtered = prev.filter(plan => plan?.id !== vars.path.planId)
        qc.setQueryData<StudentPlanResponseDto[]>(plansQueryOptions.queryKey, filtered)
      }
      return {prev}
    },
    onError: (_err, _vars, context) => {
      if(context?.prev){
        qc.setQueryData<StudentPlanResponseDto[] | undefined>(plansQueryOptions.queryKey, context.prev)
      }
      toast({title:'Erro ao excluir plano', variant:'destructive'})
    },
    onSuccess: () => toast({title:'Plano excluído'}),
    onSettled: () => qc.invalidateQueries({queryKey: plansQueryOptions.queryKey})
  })

  // Normalize plans: support both API field naming variants (planId/planName or id/name)
  const plans = useMemo(()=> {
    const list = Array.isArray(data) ? (data as RawPlan[]) : []

    const normalized = list.reduce<NormalizedPlan[]>((acc, plan) => {
      const id = plan.planId ?? plan.id
      if(!id) return acc

      acc.push({
        id,
        name: plan.planName ?? plan.name ?? '',
        maxDays: plan.planMaxDays ?? plan.maxDays ?? 0,
        durationDays: plan.planDurationDays ?? plan.durationDays ?? 0
      })
      return acc
    }, [])

    normalized.sort((a,b)=> a.name.localeCompare(b.name))
    return normalized
  },[data])

  const [open,setOpen] = useState(false)
  const form = useForm<PlanForm>({resolver: zodResolver(planSchema), defaultValues:{name:'', maxDays:3, durationDays:30}})

  const submit = (v:PlanForm)=>{
    createPlan.mutate({body:{name: v.name, maxDays: v.maxDays, durationDays: v.durationDays}, client: apiClient})
  }

  return (
    <Layout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <PageHeader 
            title="Planos" 
            description="Gerencie os planos de assinatura" 
          />
          <div className="flex gap-2">
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
          {plans.map(({id, name, maxDays, durationDays})=> {
            return (
              <Card key={id} className={'border-l-4 border-l-green-600'}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center justify-between gap-2">
                      <span className="truncate" title={name}>{name}</span>
                    <Badge variant="outline" className="text-xs whitespace-nowrap">{maxDays}d/sem</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Duração: {durationDays} dias</span>
                  </div>
                  <div className="flex gap-2 pt-1">
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
                  </div>
                </CardContent>
              </Card>
            )
          })}
          {!isLoading && plans.length === 0 && (
            <Card>
              <CardContent className="p-6 text-sm text-muted-foreground">Nenhum plano cadastrado.</CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  )
}
