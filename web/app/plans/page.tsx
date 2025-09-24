"use client"

import React, { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Layout from "@/components/layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "@/hooks/use-toast"
import { Plus, RotateCcw, Trash2 } from "lucide-react"
import { useCreatePlan, useDeletePlan, usePlans, useRestorePlan } from "@/lib/hooks/plan-queries"
import type { StudentPlanResponseDto } from "@/lib/api-client/types.gen"

const formSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  maxDays: z.preprocess((v) => (v === "" ? undefined : Number(v)), z.number().min(1, "Dias máximos deve ser > 0")),
  durationDays: z.preprocess((v) => (v === "" ? undefined : Number(v)), z.number().min(1, "Duração deve ser > 0")),
  costBrl: z.preprocess((v) => (v === "" ? undefined : Number(v)), z.number().min(0, "Custo deve ser >= 0")),
  description: z.string().optional(),
})

type PlanFormData = z.infer<typeof formSchema>

function PlansPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [isOpen, setIsOpen] = useState(false)
  const [showInactive, setShowInactive] = useState(() => searchParams.get("showInactive") === "true")

  const form = useForm<PlanFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", maxDays: 30, durationDays: 30, costBrl: 0, description: "" },
  })

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())
    if (showInactive) params.set("showInactive", "true"); else params.delete("showInactive")
    router.replace(`?${params.toString()}`, { scroll: false })
  }, [showInactive, searchParams, router])

  const { data: plans = [], isLoading } = usePlans(showInactive)
  const createMutation = useCreatePlan()
  const deleteMutation = useDeletePlan()
  const restoreMutation = useRestorePlan()

  const onSubmit = (data: PlanFormData) => {
    createMutation.mutate(
      {
        name: data.name,
        maxDays: Number(data.maxDays),
        durationDays: Number(data.durationDays),
        costBrl: Number(data.costBrl),
        description: data.description,
      },
      {
        onSuccess: () => {
          toast({ title: "Plano criado", description: "O plano foi criado com sucesso." })
          setIsOpen(false)
          form.reset()
        },
        onError: () => {
          toast({ title: "Erro ao criar plano", description: "Falha ao criar o plano.", variant: "destructive" })
        },
      }
    )
  }

  return (
    <Layout>
      <div className="space-y-6">
        <header className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Planos</h1>
            <p className="text-sm text-muted-foreground mt-1">Crie e gerencie os planos de treino — planos são imutáveis e podem ser desativados.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => setShowInactive((v) => !v)}>
              {showInactive ? "Ocultar excluídos" : "Mostrar excluídos"}
            </Button>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" /> Novo Plano
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Criar Novo Plano</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome</FormLabel>
                          <FormControl>
                            <Input placeholder="Nome do plano" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-3 gap-2">
                      <FormField
                        control={form.control}
                        name="maxDays"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Dias Máximos</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="30" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="durationDays"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Duração (dias)</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="30" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="costBrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Custo (BRL)</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.01" placeholder="100.00" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descrição</FormLabel>
                          <FormControl>
                            <Input placeholder="Descrição do plano" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>
                        Cancelar
                      </Button>
                      <Button type="submit" disabled={createMutation.isPending}>
                        Criar Plano
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </header>

        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-muted-foreground">
              {showInactive ? "Exibindo planos ativos e inativos" : "Exibindo apenas planos ativos"}
            </div>
            <div className="text-sm text-muted-foreground">{isLoading ? "Carregando..." : `${plans.length} plano(s)`}</div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {isLoading && (
              <>
                {[...Array(6)].map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-4">
                      <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                      <div className="h-3 bg-muted rounded w-1/2" />
                    </CardContent>
                  </Card>
                ))}
              </>
            )}

            {!isLoading && plans.length === 0 && (
              <div className="col-span-full p-8 text-center text-muted-foreground">Nenhum plano encontrado.</div>
            )}

            {plans.map((plan: StudentPlanResponseDto) => (
              <Card key={plan.id} className={`hover:shadow-md transition-shadow ${!plan.active ? "bg-muted/60 border-dashed" : ""}`}>
                <CardHeader className="px-4 pt-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <CardTitle className="text-lg">{plan.name}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{plan.description}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {!plan.active && <Badge variant="destructive" className="self-start sm:self-end">Inativo</Badge>}
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">Máx {plan.maxDays} dias</Badge>
                        <Badge variant="secondary">{plan.durationDays}d</Badge>
                      </div>
                      <div className="text-sm font-semibold">R$ {plan.costBrl?.toFixed(2)}</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-2">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col text-sm text-muted-foreground">
                      <span>Criado: {plan.createdAt ? new Date(plan.createdAt).toLocaleDateString() : "—"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {plan.active === false ? (
                        <>
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation()
                              restoreMutation.mutate(plan.id!, {
                                onSuccess: () => toast({ title: "Plano reativado", description: "O plano foi reativado com sucesso." }),
                                onError: () => toast({ title: "Erro ao reativar plano", description: "Falha ao reativar o plano.", variant: "destructive" }),
                              })
                            }}
                            className="h-8 w-8 sm:hidden"
                            disabled={restoreMutation.isPending}
                            aria-label="Reativar plano"
                          >
                            <RotateCcw className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation()
                              restoreMutation.mutate(plan.id!, {
                                onSuccess: () => toast({ title: "Plano reativado", description: "O plano foi reativado com sucesso." }),
                                onError: () => toast({ title: "Erro ao reativar plano", description: "Falha ao reativar o plano.", variant: "destructive" }),
                              })
                            }}
                            className="hidden sm:inline-flex"
                            disabled={restoreMutation.isPending}
                          >
                            <RotateCcw className="w-3 h-3 mr-1" /> Reativar
                          </Button>
                        </>
                      ) : (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteMutation.mutate(plan.id!, {
                              onSuccess: () => toast({ title: "Plano removido", description: "O plano foi desativado." }),
                              onError: () => toast({ title: "Erro ao remover plano", description: "Falha ao remover o plano.", variant: "destructive" }),
                            })
                          }}
                        >
                          <Trash2 className="w-4 h-4 mr-1" /> Remover
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </Layout>
  )
}

export default function PlansPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <PlansPageContent />
    </Suspense>
  )
}
