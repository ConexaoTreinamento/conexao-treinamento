"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import Layout from "@/components/layout"
import { StudentPlanResponseDto } from "@/lib/api-client/types.gen"

import { usePlans, useCreatePlan, useDeletePlan } from "@/lib/hooks/plan-queries"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { toast } from "@/hooks/use-toast"

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  maxDays: z.number().min(1, "Max days must be positive"),
  durationDays: z.number().min(1, "Duration days must be positive"),
  costBrl: z.number().min(0, "Cost must be non-negative"),
  description: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

interface PlanFormData {
  name: string
  maxDays: number
  durationDays: number
  costBrl: number
  description: string
}

export default function PlansPage() {
  const [isOpen, setIsOpen] = useState(false)
  const form = useForm<PlanFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      maxDays: 30,
      durationDays: 30,
      costBrl: 0,
      description: "",
    },
  })

  const { data: plans, isLoading } = usePlans()

  const createMutation = useCreatePlan()

  const deleteMutation = useDeletePlan()

  const onSubmit = (data: PlanFormData) => {
    // Coerce numeric inputs to numbers (HTML inputs return strings)
    const request = {
      name: data.name,
      maxDays: Number(data.maxDays),
      durationDays: Number(data.durationDays),
      costBrl: Number(data.costBrl),
      description: data.description,
    }
    createMutation.mutate(request, {
      onSuccess: () => {
        toast({
          title: "Plan created",
          description: "The plan has been created successfully.",
        })
        setIsOpen(false)
        form.reset()
      },
      onError: () => {
        toast({
          title: "Error creating plan",
          description: "Failed to create plan.",
          variant: "destructive",
        })
      },
    })
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="space-y-4">
          <h1 className="text-2xl font-bold">Planos</h1>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="h-4 bg-muted rounded w-1/4 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Planos</h1>
            <p className="text-muted-foreground">Gerencie os planos de treino disponíveis</p>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Novo Plano
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
                    <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={(createMutation as any).isLoading}>
                      Criar Plano
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
        <div className="space-y-3">
          {plans?.map((plan: StudentPlanResponseDto) => (
            <Card key={plan.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground">Máx: {plan.maxDays} dias</p>
                    <p className="text-sm text-muted-foreground">Duração: {plan.durationDays} dias</p>
                    <p className="text-sm text-muted-foreground">Custo: R$ {plan.costBrl}</p>
                    {plan.description && <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>}
                  </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        deleteMutation.mutate(plan.id!, {
                          onSuccess: () => {
                            toast({
                              title: "Plan deleted",
                              description: "The plan has been soft-deleted.",
                            })
                          },
                          onError: () => {
                            toast({
                              title: "Error deleting plan",
                              description: "Failed to delete plan.",
                              variant: "destructive",
                            })
                          },
                        })
                      }
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Deletar
                    </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  )
}
