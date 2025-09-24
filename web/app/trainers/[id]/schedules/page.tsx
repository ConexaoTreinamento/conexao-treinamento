"use client"

import React, { useMemo, useState } from "react"
import { useParams } from "next/navigation"
import Layout from "@/components/layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Clock } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "@/hooks/use-toast"
import { useTrainerSeries, useCreateTrainerSeries, useUpdateTrainerSeries, useTrainersList } from "@/lib/hooks/trainer-schedule-queries"
import { useMutation } from "@tanstack/react-query"
import { splitWeekMutation } from "@/lib/api-client/@tanstack/react-query.gen"
import { apiClient } from "@/lib/client"

const formSchema = z.object({
  weekday: z.number().min(0).max(6),
  startTime: z.string().min(1, "Horário de início obrigatório"),
  endTime: z.string().min(1, "Horário de fim obrigatório"),
  intervalDuration: z.number().min(15).max(240).optional(),
  seriesName: z.string().min(1, "Nome da série obrigatório"),
})

type FormData = z.infer<typeof formSchema>

const WEEKDAYS = [
  { value: 0, label: "Domingo" },
  { value: 1, label: "Segunda-feira" },
  { value: 2, label: "Terça-feira" },
  { value: 3, label: "Quarta-feira" },
  { value: 4, label: "Quinta-feira" },
  { value: 5, label: "Sexta-feira" },
  { value: 6, label: "Sábado" },
]

export default function TrainerSchedulesPage() {
  const params = useParams()
  const trainerId = params.id as string

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editing, setEditing] = useState<any | null>(null)

  const seriesQuery = useTrainerSeries(trainerId)
  const createMutation = useCreateTrainerSeries(trainerId)
  const updateMutation = useUpdateTrainerSeries(trainerId)
  const trainersQ = useTrainersList()

  // Shift-based generator state
  const [generatorOpen, setGeneratorOpen] = useState(false)
  const [genSeriesName, setGenSeriesName] = useState("Aula")
  const [genDuration, setGenDuration] = useState<number>(60)
  const [genDays, setGenDays] = useState<Record<number, { enabled: boolean; startTime: string; endTime: string }>>({
    0: { enabled: false, startTime: "09:00", endTime: "12:00" },
    1: { enabled: true, startTime: "09:00", endTime: "12:00" },
    2: { enabled: true, startTime: "09:00", endTime: "12:00" },
    3: { enabled: true, startTime: "09:00", endTime: "12:00" },
    4: { enabled: true, startTime: "09:00", endTime: "12:00" },
    5: { enabled: true, startTime: "09:00", endTime: "12:00" },
    6: { enabled: false, startTime: "09:00", endTime: "12:00" },
  })

  const enabledCount = useMemo(() => Object.values(genDays).filter(d => d.enabled).length, [genDays])

  const createForm = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      weekday: 1,
      startTime: "09:00",
      endTime: "10:00",
      intervalDuration: 60,
      seriesName: "",
    },
  })

  const editForm = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      weekday: 1,
      startTime: "09:00",
      endTime: "10:00",
      intervalDuration: 60,
      seriesName: "",
    },
  })

  const onSubmitCreate = (data: FormData) => {
    const request = {
      trainerId,
      weekday: data.weekday,
      startTime: data.startTime,
      endTime: data.endTime,
      intervalDuration: data.intervalDuration || 60,
      seriesName: data.seriesName,
      effectiveFromTimestamp: new Date().toISOString(), // Backend sets this
    }

    createMutation.mutate(request, {
      onSuccess: () => {
        toast({ title: "Série criada", description: "Horário da série foi criado com sucesso." })
        createForm.reset()
        setIsCreateOpen(false)
      },
      onError: (err: any) => {
        toast({
          title: "Erro ao criar série",
          description: err?.message || "Falha ao criar a série",
          variant: "destructive",
        })
      },
    })
  }

  const onSubmitEdit = (data: FormData) => {
    if (!editing?.id) return

    const request = {
      trainerId,
      weekday: data.weekday,
      startTime: data.startTime,
      endTime: data.endTime,
      intervalDuration: data.intervalDuration || 60,
      seriesName: data.seriesName,
      effectiveFromTimestamp: editing.effectiveFromTimestamp || new Date().toISOString(),
    }

    updateMutation.mutate(
      {
        seriesId: String(editing.id),
        body: request,
        newEffectiveFrom: new Date().toISOString(),
      },
      {
        onSuccess: () => {
          toast({ title: "Série atualizada", description: "Horário da série foi atualizado com sucesso." })
          setIsEditOpen(false)
          setEditing(null)
        },
        onError: (err: any) => {
          toast({
            title: "Erro ao atualizar série",
            description: err?.message || "Falha ao atualizar a série",
            variant: "destructive",
          })
        },
      }
    )
  }

  const openEdit = (series: any) => {
    setEditing(series)
    editForm.reset({
      weekday: Number(series.weekday ?? 1),
      startTime: String(series.startTime ?? "09:00"),
      endTime: String(series.endTime ?? "10:00"),
      intervalDuration: Number(series.intervalDuration ?? 60),
      seriesName: String(series.seriesName ?? ""),
    })
    setIsEditOpen(true)
  }

  const formatTime = (time: string) => {
    try {
      return new Date(`2000-01-01T${time}`).toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch {
      return time
    }
  }

  const splitWeekBase = splitWeekMutation({ client: apiClient })
  const splitWeekMut = useMutation(splitWeekBase)

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Horários do Instrutor</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Gerencie as séries recorrentes de horários na visualização semanal
            </p>
          </div>
        </div>

        {/* Weekly Schedule Grid */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border">
          {/* Generator toolbar */}
          <div className="flex items-center justify-between p-4 border-b gap-2 flex-wrap">
            <div className="space-y-0.5">
              <h2 className="font-semibold">Gerador de turnos</h2>
              <p className="text-xs text-muted-foreground">Defina horários por dia e a duração da aula; criaremos as séries automaticamente</p>
            </div>
            <div className="flex items-center gap-2">
              <Input
                value={genSeriesName}
                onChange={(e) => setGenSeriesName(e.target.value)}
                placeholder="Nome da série (ex: Pilates, CrossFit)"
                className="w-56"
              />
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Duração</span>
                <Input
                  type="number"
                  value={genDuration}
                  min={15}
                  step={15}
                  onChange={(e) => setGenDuration(Math.max(15, Number(e.target.value) || 60))}
                  className="w-24"
                />
                <span className="text-sm text-muted-foreground">min</span>
              </div>
              <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={async () => {
                  const nowIso = new Date().toISOString()
                  const daysToCreate = WEEKDAYS.filter(d => genDays[d.value]?.enabled)
                  if (daysToCreate.length === 0) {
                    toast({ title: "Selecione ao menos um dia", variant: "destructive" })
                    return
                  }
                  try {
                    // Single atomic split request including active and inactive days
                    await splitWeekMut.mutateAsync({
                      body: {
                        trainerId,
                        seriesName: genSeriesName || "Aula",
                        intervalDuration: genDuration,
                        newEffectiveFrom: nowIso,
                        days: WEEKDAYS.map(d => ({
                          weekday: d.value,
                          active: Boolean(genDays[d.value]?.enabled),
                          startTime: genDays[d.value].startTime,
                          endTime: genDays[d.value].endTime,
                        }))
                      }
                    })
                    toast({ title: "Horários atualizados", description: `Semana configurada (${enabledCount} dia(s) ativo(s)).` })
                    // Ensure latest data is fetched immediately
                    await seriesQuery.refetch()
                  } catch (e: any) {
                    toast({ title: "Erro ao atualizar semana", description: e?.message || String(e), variant: "destructive" })
                  }
                }}
              >
                <Plus className="w-4 h-4 mr-1" /> Atualizar semana ({enabledCount} ativos)
              </Button>
            </div>
          </div>

          {/* Day-by-day inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 p-4 border-b">
            {WEEKDAYS.map((day) => (
              <Card key={`gen-${day.value}`}>
                <CardHeader className="py-3">
                  <CardTitle className="text-sm flex items-center justify-between">
                    <span>{day.label}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant={genDays[day.value]?.enabled ? "default" : "outline"} className="cursor-pointer"
                        onClick={() => setGenDays(prev => ({ ...prev, [day.value]: { ...prev[day.value], enabled: !prev[day.value].enabled } }))}
                      >{genDays[day.value]?.enabled ? "Ativo" : "Inativo"}</Badge>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-2">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Início</div>
                    <Input type="time" value={genDays[day.value].startTime} onChange={(e) => setGenDays(prev => ({ ...prev, [day.value]: { ...prev[day.value], startTime: e.target.value } }))} />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Fim</div>
                    <Input type="time" value={genDays[day.value].endTime} onChange={(e) => setGenDays(prev => ({ ...prev, [day.value]: { ...prev[day.value], endTime: e.target.value } }))} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {/* Days Header */}
          <div className="grid grid-cols-8 border-b">
            <div className="p-4 font-medium text-center bg-gray-50 dark:bg-gray-700">
              Horário
            </div>
            {WEEKDAYS.map((day) => (
              <div key={day.value} className="p-4 font-medium text-center bg-gray-50 dark:bg-gray-700 border-l">
                {day.label}
              </div>
            ))}
          </div>

          {/* Time Slots */}
          <div className="divide-y">
            {Array.from({ length: 14 }, (_, i) => {
              const hour = 6 + i
              const timeSlot = `${hour.toString().padStart(2, '0')}:00`
              
              return (
                <div key={timeSlot} className="grid grid-cols-8 min-h-[60px]">
                  {/* Time Column */}
                  <div className="p-3 text-sm font-medium text-center bg-gray-25 dark:bg-gray-800 border-r">
                    {timeSlot}
                  </div>
                  
                  {/* Day Columns */}
                  {WEEKDAYS.map((day) => {
                    const daySchedules = seriesQuery.data?.filter((series: any) => 
                      Number(series.weekday) === day.value &&
                      series.startTime <= timeSlot &&
                      series.endTime > timeSlot
                    ) || []

                    return (
                      <div key={`${day.value}-${timeSlot}`} className="p-2 border-l relative min-h-[60px]">
                        {daySchedules.map((schedule: any) => (
                          <Card 
                            key={schedule.id} 
                            className="mb-1 p-2 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/30 cursor-pointer transition-colors"
                            onClick={() => openEdit(schedule)}
                          >
                            <div className="text-xs font-medium text-blue-700 dark:text-blue-300 truncate">
                              {schedule.seriesName}
                            </div>
                            <div className="text-xs text-blue-600 dark:text-blue-400">
                              {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
                            </div>
                            {schedule.intervalDuration && (
                              <div className="text-xs text-blue-500 dark:text-blue-500">
                                Intervalo: {schedule.intervalDuration}min
                              </div>
                            )}
                          </Card>
                        ))}
                        
                        {/* Add Button for empty slots */}
                        {daySchedules.length === 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full h-full min-h-[48px] opacity-0 hover:opacity-100 transition-opacity"
                            onClick={() => {
                              createForm.setValue('weekday', day.value)
                              createForm.setValue('startTime', timeSlot)
                              createForm.setValue('endTime', `${(hour + 1).toString().padStart(2, '0')}:00`)
                              setIsCreateOpen(true)
                            }}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </div>

        {/* Legacy list and quick add removed: keep only the weekly view */}

        {/* Edit Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Editar Série de Horários</DialogTitle>
            </DialogHeader>
            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(onSubmitEdit)} className="space-y-4">
                <FormField
                  control={editForm.control}
                  name="seriesName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome da Série</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Yoga, Pilates, Musculação" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="weekday"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dia da Semana</FormLabel>
                      <Select
                        value={String(field.value)}
                        onValueChange={(value) => field.onChange(Number(value))}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o dia" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {WEEKDAYS.map((day) => (
                            <SelectItem key={day.value} value={String(day.value)}>
                              {day.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={editForm.control}
                    name="startTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Início</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editForm.control}
                    name="endTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fim</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={editForm.control}
                  name="intervalDuration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duração do Intervalo (minutos)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="15"
                          max="240"
                          step="15"
                          placeholder="60"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value) || undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="ghost" onClick={() => setIsEditOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={updateMutation.isPending}>
                    Atualizar Série
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  )
}