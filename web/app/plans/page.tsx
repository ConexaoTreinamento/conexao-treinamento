"use client"

import {useCallback, useMemo, useState} from 'react'
import Layout from '@/components/layout'
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'
import {apiClient} from '@/lib/client'
import {getAllPlansOptions, getAllPlansQueryKey, createPlanMutation, deletePlanMutation, restorePlanMutation} from '@/lib/api-client/@tanstack/react-query.gen'
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card'
import {Button} from '@/components/ui/button'
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger} from '@/components/ui/dialog'
import {Input} from '@/components/ui/input'
import {Badge} from '@/components/ui/badge'
import {Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger} from '@/components/ui/sheet'
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select'
import {Plus, Loader2, Save, Filter} from 'lucide-react'
import PlanCard from '@/components/plans/plan-card'
import {useForm} from 'react-hook-form'
import {z} from 'zod'
import {zodResolver} from '@hookform/resolvers/zod'
import {useToast} from '@/hooks/use-toast'
import { StudentPlanResponseDto } from '@/lib/api-client'
import { PageHeader } from '@/components/base/page-header'
import { handleHttpError } from '@/lib/error-utils'

const planSchema = z.object({
  name: z.string().min(2,'Nome obrigatório'),
  maxDays: z.coerce.number().int().min(1).max(7),
  durationDays: z.coerce.number().int().min(7).max(365)
})

type PlanForm = z.infer<typeof planSchema>

type StatusFilter = 'all' | 'active' | 'inactive'

export default function PlansPage(){
  const qc = useQueryClient()
  const {toast} = useToast()
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  const invalidateAllStatusVariants = useCallback(() => Promise.all([
    qc.invalidateQueries({ queryKey: getAllPlansQueryKey({ client: apiClient, query: { status: 'active' } }) }),
    qc.invalidateQueries({ queryKey: getAllPlansQueryKey({ client: apiClient, query: { status: 'inactive' } }) }),
    qc.invalidateQueries({ queryKey: getAllPlansQueryKey({ client: apiClient, query: { status: 'all' } }) }),
  ]), [qc])

  // Server-side filtering using the new status param
  const plansQueryOptions = useMemo(() => getAllPlansOptions({ client: apiClient, query: { status: statusFilter } }), [statusFilter])
  const {data, isLoading, error} = useQuery(plansQueryOptions)

  const createPlan = useMutation({
    ...createPlanMutation({client: apiClient}),
    onSuccess: async () => {
      // invalidate after successful create
      await qc.invalidateQueries({queryKey: plansQueryOptions.queryKey})
      toast({title:'Plano criado', variant: 'success'})
      form.reset({name:'', maxDays:3, durationDays:30})
      setOpen(false)
    },
    onError: (err: any) => {
      if (err?.status === 409) {
        toast({
          title: 'Nome já utilizado',
          description: 'Já existe um plano com este nome. Escolha outro nome e tente novamente.',
          variant: 'destructive'
        })
      } else {
        handleHttpError(err, 'criar plano', 'Erro ao criar plano')
      }
    }
  })

  const deletePlan = useMutation({
    ...deletePlanMutation({client: apiClient}),
    // optimistic update: mark as inactive locally instead of removing to allow restore from UI
    onMutate: async (vars) => {
      await qc.cancelQueries({queryKey: plansQueryOptions.queryKey})
      const prev = qc.getQueryData<StudentPlanResponseDto[]>(plansQueryOptions.queryKey)
      if(prev){
        const next = prev.map(p => p.id === vars.path.planId ? ({...p, active: false}) : p)
        qc.setQueryData(plansQueryOptions.queryKey, next)
      }
      return {prev}
    },
    onError: (_err: Error, context: any) => {
      if(context?.prev) qc.setQueryData(plansQueryOptions.queryKey, context.prev)
      toast({title:'Erro ao excluir plano', variant:'destructive'})
    },
    onSuccess: () => toast({title:'Plano excluído'}),
    onSettled: async () => {
      await invalidateAllStatusVariants()
    }
  })

  const restorePlan = useMutation({
    ...restorePlanMutation({client: apiClient}),
    onMutate: async () => {
      await qc.cancelQueries({queryKey: plansQueryOptions.queryKey})
    },
    onSuccess: async () => {
      toast({title:'Plano restaurado'})
      await invalidateAllStatusVariants()
    },
    onError: (err: any) => handleHttpError(err, 'restaurar plano', 'Erro ao restaurar plano'),
    onSettled: async () => {
      await invalidateAllStatusVariants()
    }
  })

  // Normalize plans: support both API field naming variants (planId/planName or id/name)
  const plans = useMemo(() => {
    const list = Array.isArray(data) ? data : []

    const normalized = list
      .map<{
        _raw: StudentPlanResponseDto
        id: string
        name: string
        maxDays: number
        durationDays: number
        active: boolean
        description?: string | null
      } | null>(p => {
        const id = (p.id ?? (p as any).planId) as string | undefined
        if (!id) return null

        return {
          _raw: p,
          id,
          name: p.name ?? (p as any).planName ?? '',
          maxDays: (p.maxDays ?? (p as any).planMaxDays ?? 0) as number,
          durationDays: (p.durationDays ?? (p as any).planDurationDays ?? 0) as number,
          active: Boolean(p.active ?? (p as any).planActive ?? true),
          description: p.description ?? (p as any).planDescription ?? null
        }
      })
      .filter(Boolean) as Array<{
        _raw: StudentPlanResponseDto
        id: string
        name: string
        maxDays: number
        durationDays: number
        active: boolean
        description?: string | null
      }>

    normalized.sort((a, b) => a.name.localeCompare(b.name))
    return normalized
  }, [data])

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
          <div className="flex items-center gap-2">
            <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="h-9"><Filter className="w-4 h-4 mr-2"/>Filtros</Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 sm:w-96">
                <SheetHeader>
                  <SheetTitle>Filtros</SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-medium">Status</label>
                    <Select value={statusFilter} onValueChange={(v)=> setStatusFilter(v as StatusFilter)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todos"/>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="active">Ativos</SelectItem>
                        <SelectItem value="inactive">Inativos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
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
          {plans.map(({_raw: p, id, name, maxDays, durationDays, active, description}) => (
            <PlanCard
              key={id}
              id={id}
              name={name}
              maxDays={maxDays}
              durationDays={durationDays}
              active={!!active}
              description={description}
              onDelete={() => deletePlan.mutate({ path: { planId: id }, client: apiClient })}
              onRestore={() => restorePlan.mutate({ path: { planId: id }, client: apiClient })}
              deleting={deletePlan.isPending}
              restoring={restorePlan.isPending}
            />
          ))}
          {!isLoading && plans.length===0 && (
            <Card>
              <CardContent className="p-6 text-sm text-muted-foreground">
                {statusFilter === 'inactive' ? 'Nenhum plano inativo.' : statusFilter === 'active' ? 'Nenhum plano ativo.' : 'Nenhum plano cadastrado.'}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  )
}
