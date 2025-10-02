"use client"

import { useEffect, useMemo } from "react"
import { useForm, Controller } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useQuery } from "@tanstack/react-query"
import { findAllTrainersOptions } from "@/lib/api-client/@tanstack/react-query.gen"
import { apiClient } from "@/lib/client"

interface OneOffClassData {
  name: string
  trainerId: string
  trainerName?: string
  startTime: string
  endTime: string
}

interface ClassModalProps {
  open: boolean
  mode?: "create" | "edit"
  initialData?: Partial<OneOffClassData>
  onClose: () => void
  onSubmitData: (data: OneOffClassData) => void
}

export default function ClassModal({ open, mode = "create", initialData, onClose, onSubmitData }: ClassModalProps) {
  const { control, register, handleSubmit, reset, watch } = useForm<OneOffClassData>({
    defaultValues: {
      name: initialData?.name || "",
      trainerId: initialData?.trainerId || "",
      trainerName: initialData?.trainerName || undefined,
      startTime: initialData?.startTime || "",
      endTime: initialData?.endTime || "",
    }
  })

  const trainersQuery = useQuery({
    ...findAllTrainersOptions({ client: apiClient })
  })
  const trainerOptions = useMemo(
    () => (trainersQuery.data || []).map(t => ({ id: t.id || "", name: t.name || "—" })).filter(t => t.id),
    [trainersQuery.data]
  )

  useEffect(() => {
    if (open) {
      reset({
        name: initialData?.name || "",
        trainerId: initialData?.trainerId || "",
        trainerName: initialData?.trainerName,
        startTime: initialData?.startTime || "",
        endTime: initialData?.endTime || "",
      })
    }
  }, [open, initialData, reset])

  const name = watch("name")
  const trainerId = watch("trainerId")
  const startTime = watch("startTime")
  const endTime = watch("endTime")
  const isValid = useMemo(() => {
    if (!name || !trainerId || !startTime || !endTime) return false
    return endTime >= startTime
  }, [name, trainerId, startTime, endTime])

  const onSubmit = (data: OneOffClassData) => {
    if (!isValid) return
    const tn = trainerOptions.find(t => t.id === data.trainerId)?.name
    onSubmitData({ ...data, trainerName: tn })
    if (mode === "create") {
      reset({ name: "", trainerId: "", startTime: "", endTime: "" })
    }
    onClose()
  }

  const handleClose = () => onClose()

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-sm max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Nova Aula" : "Editar Aula"}</DialogTitle>
          <DialogDescription>Aula avulsa para o dia selecionado</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="className">Nome</Label>
            <Input id="className" placeholder="Ex: Pilates Iniciante" {...register("name")} />
          </div>
          <div className="space-y-2">
            <Label>Professor</Label>
            <Controller
              name="trainerId"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder={trainersQuery.isLoading ? "Carregando..." : "Selecione"} />
                  </SelectTrigger>
                  <SelectContent>
                    {trainerOptions.map(t => (
                      <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="space-y-3">
            <Label>Horário</Label>
            <div className="p-3 border rounded-lg space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Início</Label>
                  <Input type="time" className="h-8" {...register("startTime")} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Fim</Label>
                  <Input type="time" className="h-8" {...register("endTime")} />
                </div>
              </div>
              {startTime && endTime && endTime < startTime && (
                <p className="text-xs text-red-500">Horário final deve ser após o inicial.</p>
              )}
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={handleClose} className="flex-1">Cancelar</Button>
            <Button onClick={handleSubmit(onSubmit)} disabled={!isValid || trainersQuery.isLoading} className="bg-green-600 hover:bg-green-700 flex-1 disabled:opacity-60">
              {mode === "create" ? "Criar Aula" : "Salvar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
