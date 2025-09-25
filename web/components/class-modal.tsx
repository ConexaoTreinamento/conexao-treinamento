"use client"

import { useState, useEffect, useMemo } from "react"
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
  maxStudents: string
}

interface ClassModalProps {
  open: boolean
  mode?: "create" | "edit"
  initialData?: Partial<OneOffClassData>
  onClose: () => void
  onSubmitData: (data: OneOffClassData) => void
}

export default function ClassModal({ open, mode = "create", initialData, onClose, onSubmitData }: ClassModalProps) {
  const [form, setForm] = useState<OneOffClassData>({
    name: initialData?.name || "",
    trainerId: initialData?.trainerId || "",
    trainerName: initialData?.trainerName || undefined,
    startTime: initialData?.startTime || "",
    endTime: initialData?.endTime || "",
    maxStudents: initialData?.maxStudents || "2",
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
      setForm({
        name: initialData?.name || "",
        trainerId: initialData?.trainerId || "",
        trainerName: initialData?.trainerName,
        startTime: initialData?.startTime || "",
        endTime: initialData?.endTime || "",
        maxStudents: initialData?.maxStudents || "2",
      })
    }
  }, [open, initialData])

  const isValid = useMemo(() => {
    if (!form.name || !form.trainerId || !form.startTime || !form.endTime) return false
    return form.endTime >= form.startTime
  }, [form])

  const handleSubmit = () => {
    if (!isValid) return
    const trainerName = trainerOptions.find(t => t.id === form.trainerId)?.name
    onSubmitData({ ...form, trainerName })
    if (mode === "create") {
      setForm({ name: "", trainerId: "", startTime: "", endTime: "", maxStudents: "2" })
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
            <Input
              id="className"
              value={form.name}
              onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Ex: Pilates Iniciante"
            />
          </div>
          <div className="space-y-2">
            <Label>Professor</Label>
            <Select value={form.trainerId} onValueChange={value => setForm(prev => ({ ...prev, trainerId: value }))}>
              <SelectTrigger>
                <SelectValue placeholder={trainersQuery.isLoading ? "Carregando..." : "Selecione"} />
              </SelectTrigger>
              <SelectContent>
                {trainerOptions.map(t => (
                  <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-3">
            <Label>Horário</Label>
            <div className="p-3 border rounded-lg space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Início</Label>
                  <Input type="time" value={form.startTime} onChange={e => setForm(prev => ({ ...prev, startTime: e.target.value }))} className="h-8" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Fim</Label>
                  <Input type="time" value={form.endTime} onChange={e => setForm(prev => ({ ...prev, endTime: e.target.value }))} className="h-8" />
                </div>
              </div>
              {form.startTime && form.endTime && form.endTime < form.startTime && (
                <p className="text-xs text-red-500">Horário final deve ser após o inicial.</p>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="maxStudents">Máx. Alunos</Label>
            <Input
              id="maxStudents"
              type="number"
              value={form.maxStudents}
              onChange={e => setForm(prev => ({ ...prev, maxStudents: e.target.value }))}
              placeholder="2"
              min={1}
            />
          </div>
          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={handleClose} className="flex-1">Cancelar</Button>
            <Button onClick={handleSubmit} disabled={!isValid || trainersQuery.isLoading} className="bg-green-600 hover:bg-green-700 flex-1 disabled:opacity-60">
              {mode === "create" ? "Criar Aula" : "Salvar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
