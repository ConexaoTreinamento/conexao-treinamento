"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { X } from "lucide-react"

interface ClassModalData {
  name: string
  instructor: string
  maxStudents: string
  description: string
  weekDays: string[]
  times: { day: string; startTime: string; endTime: string }[]
}

interface ClassModalProps {
  open: boolean
  mode: "create" | "edit"
  initialData?: ClassModalData
  trainers: string[]
  onClose: () => void
  onSubmitData: (data: ClassModalData) => void
}

export default function ClassModal({
  open,
  mode,
  initialData,
  trainers,
  onClose,
  onSubmitData,
}: ClassModalProps) {
  const [form, setForm] = useState<ClassModalData>({
    name: "",
    instructor: "",
    maxStudents: "2",
    description: "",
    weekDays: [],
    times: [],
  })

  const weekDays = [
    { value: "monday", label: "Segunda" },
    { value: "tuesday", label: "Terça" },
    { value: "wednesday", label: "Quarta" },
    { value: "thursday", label: "Quinta" },
    { value: "friday", label: "Sexta" },
    { value: "saturday", label: "Sábado" },
    { value: "sunday", label: "Domingo" },
  ]

  // Initialize form with initial data when editing
  useEffect(() => {
    if (initialData) {
      setForm(initialData)
    } else {
      setForm({
        name: "",
        instructor: "",
        maxStudents: "2",
        description: "",
        weekDays: [],
        times: [],
      })
    }
  }, [initialData, mode, open])

  const handleWeekDayToggle = (dayValue: string) => {
    setForm((prev) => {
      const isSelected = prev.weekDays.includes(dayValue)

      if (isSelected) {
        // Remove day and its time
        return {
          ...prev,
          weekDays: prev.weekDays.filter((d) => d !== dayValue),
          times: prev.times.filter((t) => t.day !== dayValue),
        }
      } else {
        // Add day and copy time from first day if exists
        const firstTime = prev.times[0]
        const newTime = firstTime
          ? { day: dayValue, startTime: firstTime.startTime, endTime: firstTime.endTime }
          : { day: dayValue, startTime: "", endTime: "" }

        return {
          ...prev,
          weekDays: [...prev.weekDays, dayValue],
          times: [...prev.times, newTime],
        }
      }
    })
  }

  const handleTimeChange = (dayValue: string, field: "startTime" | "endTime", value: string) => {
    setForm((prev) => ({
      ...prev,
      times: prev.times.map((t) => {
        if (t.day === dayValue) {
          const updatedTime = { ...t, [field]: value }

          // Validate times
          if (updatedTime.startTime && updatedTime.endTime) {
            const start = new Date(`2000-01-01T${updatedTime.startTime}`)
            const end = new Date(`2000-01-01T${updatedTime.endTime}`)

            if (end < start) {
              // If end time is earlier than start time, set end time to start time
              updatedTime.endTime = updatedTime.startTime
            }
          }

          return updatedTime
        }
        return t
      }),
    }))
  }

  const handleSubmit = () => {
    if (form.name && form.instructor && (mode === "edit" || form.weekDays.length > 0)) {
      onSubmitData(form)
      if (mode === "create") {
        setForm({
          name: "",
          instructor: "",
          maxStudents: "2",
          description: "",
          weekDays: [],
          times: [],
        })
      }
      onClose()
    }
  }

  const handleClose = () => {
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Nova Turma" : "Editar Modalidade"}</DialogTitle>
          <DialogDescription>
            {mode === "create" ? "Crie uma nova turma regular" : "Edite as informações da modalidade"}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="className">Nome da {mode === "create" ? "Turma" : "Modalidade"}</Label>
            <Input
              id="className"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Ex: Pilates Iniciante"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="instructor">Professor</Label>
              <Select
                value={form.instructor}
                onValueChange={(value) => setForm((prev) => ({ ...prev, instructor: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {trainers.map((trainer) => (
                    <SelectItem key={trainer} value={trainer}>
                      {trainer}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Dias da Semana</Label>
            <div className="grid grid-cols-2 gap-2">
              {weekDays.map((day) => (
                <div key={day.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={day.value}
                    checked={form.weekDays.includes(day.value)}
                    onCheckedChange={() => handleWeekDayToggle(day.value)}
                  />
                  <Label htmlFor={day.value} className="text-sm">
                    {day.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {form.weekDays.length > 0 && (
            <div className="space-y-3">
              <Label>Horários por Dia</Label>
              {form.weekDays.map((dayValue) => {
                const dayLabel = weekDays.find((d) => d.value === dayValue)?.label
                const timeForDay = form.times.find((t) => t.day === dayValue)

                return (
                  <div key={dayValue} className="p-3 border rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="font-medium">{dayLabel}</Label>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleWeekDayToggle(dayValue)}
                        className="h-6 w-6 p-0"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label className="text-xs">Início</Label>
                        <Input
                          type="time"
                          value={timeForDay?.startTime || ""}
                          onChange={(e) => handleTimeChange(dayValue, "startTime", e.target.value)}
                          className="h-8"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Fim</Label>
                        <Input
                          type="time"
                          value={timeForDay?.endTime || ""}
                          onChange={(e) => handleTimeChange(dayValue, "endTime", e.target.value)}
                          className="h-8"
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {mode === "create" && (
            <div className="space-y-2">
              <Label htmlFor="maxStudents">Máx. Alunos</Label>
              <Input
                id="maxStudents"
                type="number"
                value={form.maxStudents}
                onChange={(e) => setForm((prev) => ({ ...prev, maxStudents: e.target.value }))}
                placeholder="2"
              />
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={handleClose} className="flex-1">
              Cancelar
            </Button>
            <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700 flex-1">
              {mode === "create" ? "Criar Turma" : "Salvar Alterações"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
