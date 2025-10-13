"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { CheckCircle, X, Loader2 } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { getTrainersForLookupOptions } from "@/lib/api-client/@tanstack/react-query.gen"
import { apiClient } from "@/lib/client"
import type { TrainerLookupDto } from "@/lib/api-client/types.gen"
import { StudentPicker, type StudentSummary } from "@/components/student-picker"
import { Controller, useForm } from "react-hook-form"

export interface EventFormData {
  name: string
  date: string
  startTime: string
  endTime: string
  location: string
  description: string
  trainerId: string
  participantIds: string[]
  attendance?: Record<string, boolean>
  participantDetails?: Record<string, StudentSummary | undefined>
}

interface EventModalProps {
  open: boolean
  mode: "create" | "edit"
  initialData?: Partial<EventFormData>
  onClose: () => void
  onSubmit: (data: EventFormData) => void
}

const buildInitialValues = (data?: Partial<EventFormData>): EventFormData => ({
  name: data?.name ?? "",
  date: data?.date ?? "",
  startTime: data?.startTime ?? "",
  endTime: data?.endTime ?? "",
  location: data?.location ?? "",
  description: data?.description ?? "",
  trainerId: data?.trainerId ?? "",
  participantIds: [...(data?.participantIds ?? [])],
  attendance: { ...(data?.attendance ?? {}) },
  participantDetails: { ...(data?.participantDetails ?? {}) },
})

export default function EventModal({
  open,
  mode,
  initialData,
  onClose,
  onSubmit,
}: EventModalProps) {
  const trainersQuery = useQuery(getTrainersForLookupOptions({ client: apiClient }))

  const trainersData = trainersQuery.data ?? []
  const trainersLoading = trainersQuery.isLoading

  const trainers = (trainersData ?? []).filter(
    (trainer): trainer is TrainerLookupDto & { id: string } => Boolean(trainer?.id)
  )

  const [isAddParticipantDialogOpen, setIsAddParticipantDialogOpen] = useState(false)

  const { control, handleSubmit, watch, setValue, reset, getValues, register } = useForm<EventFormData>({
    mode: "onChange",
    defaultValues: buildInitialValues(initialData),
  })

  useEffect(() => {
    if (open) {
      reset(buildInitialValues(initialData))
    }
  }, [initialData, open, reset])

  useEffect(() => {
    if (!open) {
      setIsAddParticipantDialogOpen(false)
    }
  }, [open])

  const formValues = watch()
  const participantIds = formValues.participantIds ?? []
  const attendance = formValues.attendance ?? {}
  const participantDetails = formValues.participantDetails ?? {}

  const handleTimeChange = (
    field: "startTime" | "endTime",
    value: string,
    onChange: (value: string) => void
  ) => {
    const otherField = field === "startTime" ? "endTime" : "startTime"
    const otherValue = getValues(otherField)
    const hasCompleteStart = (field === "startTime" ? value : otherValue)?.length === 5
    const hasCompleteEnd = (field === "endTime" ? value : otherValue)?.length === 5

    if (hasCompleteStart && hasCompleteEnd && value && otherValue) {
      const start = field === "startTime" ? value : otherValue
      const end = field === "endTime" ? value : otherValue
      const startDate = new Date(`2000-01-01T${start}`)
      const endDate = new Date(`2000-01-01T${end}`)
      if (endDate < startDate) {
        if (field === "startTime") {
          onChange(value)
          setValue(otherField, value, { shouldDirty: true, shouldValidate: true })
        }
        return
      }
    }

    onChange(value)
  }

  const addParticipant = (student: StudentSummary): boolean => {
    const ids = getValues("participantIds") ?? []
    if (ids.includes(student.id)) {
      return false
    }

    const nextAttendance = { ...(getValues("attendance") ?? {}) }
    const nextDetails = { ...(getValues("participantDetails") ?? {}) }

    nextAttendance[student.id] = nextAttendance[student.id] ?? false
    nextDetails[student.id] = student

    setValue("participantIds", [...ids, student.id], { shouldDirty: true, shouldValidate: true })
    setValue("attendance", nextAttendance, { shouldDirty: true })
    setValue("participantDetails", nextDetails, { shouldDirty: true })
    return true
  }

  const handleAddStudent = (student: StudentSummary) => {
    addParticipant(student)
  }

  const handleRemoveStudent = (studentId: string) => {
    const ids = getValues("participantIds") ?? []
    const nextAttendance = { ...(getValues("attendance") ?? {}) }
    const nextDetails = { ...(getValues("participantDetails") ?? {}) }

    delete nextAttendance[studentId]
    delete nextDetails[studentId]

    setValue(
      "participantIds",
      ids.filter(id => id !== studentId),
      { shouldDirty: true, shouldValidate: true }
    )
    setValue("attendance", nextAttendance, { shouldDirty: true })
    setValue("participantDetails", nextDetails, { shouldDirty: true })
  }

  const toggleAttendance = (studentId: string) => {
    const nextAttendance = { ...(getValues("attendance") ?? {}) }
    nextAttendance[studentId] = !nextAttendance[studentId]
    setValue("attendance", nextAttendance, { shouldDirty: true })
  }

  const submitForm = handleSubmit((data) => {
    onSubmit(data)
    onClose()
  })

  const isFormValid = Boolean(
    formValues.name?.trim() &&
    formValues.date &&
    formValues.startTime &&
    formValues.endTime &&
    formValues.location?.trim() &&
    formValues.trainerId
  )

  const currentParticipants = participantIds.length

    return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          onClose()
        }
      }}
    >
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {mode === "create" ? "Criar Novo Evento" : "Editar Evento"}
            </DialogTitle>
            <DialogDescription>
              {mode === "create"
                ? "Preencha as informações para criar um novo evento"
                : "Edite as informações do evento"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="w-full">
              <div className="space-y-2">
                <Label htmlFor="eventName">Nome do Evento *</Label>
                <Input
                  id="eventName"
                  placeholder="Ex: Corrida no Parque"
                  {...register("name", { required: true })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="eventDate">Data *</Label>
                <Input
                  id="eventDate"
                  type="date"
                  {...register("date", { required: true })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="eventStartTime">Horário de Início *</Label>
                <Controller
                  control={control}
                  name="startTime"
                  rules={{ required: true }}
                  render={({ field }) => (
                    <Input
                      id="eventStartTime"
                      type="time"
                      value={field.value}
                      onChange={(e) => handleTimeChange("startTime", e.target.value, field.onChange)}
                    />
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="eventEndTime">Horário de Fim *</Label>
                <Controller
                  control={control}
                  name="endTime"
                  rules={{ required: true }}
                  render={({ field }) => (
                    <Input
                      id="eventEndTime"
                      type="time"
                      value={field.value}
                      onChange={(e) => handleTimeChange("endTime", e.target.value, field.onChange)}
                    />
                  )}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="eventLocation">Local *</Label>
              <Input
                id="eventLocation"
                placeholder="Ex: Parque Ibirapuera"
                {...register("location", { required: true })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="eventInstructor">Instrutor *</Label>
                <Controller
                  control={control}
                  name="trainerId"
                  rules={{ required: true }}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder={trainersLoading ? "Carregando..." : "Selecione o instrutor"} />
                      </SelectTrigger>
                      <SelectContent>
                        {trainers.map((trainer) => (
                          <SelectItem key={trainer.id} value={trainer.id}>
                            {trainer.name || "Nome não informado"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="eventDescription">Descrição</Label>
              <Textarea
                id="eventDescription"
                placeholder="Descreva o evento..."
                rows={3}
                {...register("description")}
              />
            </div>

            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <Label>Participantes ({currentParticipants})</Label>
                  <p className="text-sm text-muted-foreground">
                    Adicione ou gerencie os participantes desta aula especial.
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={() => setIsAddParticipantDialogOpen(true)}>
                  Adicionar Aluno
                </Button>
              </div>

              <Dialog open={isAddParticipantDialogOpen} onOpenChange={setIsAddParticipantDialogOpen}>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Adicionar aluno ao evento</DialogTitle>
                    <DialogDescription>Escolha um aluno da lista paginada.</DialogDescription>
                  </DialogHeader>
                  <StudentPicker
                    excludedStudentIds={participantIds}
                    onSelect={handleAddStudent}
                    pageSize={10}
                  />
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddParticipantDialogOpen(false)}>
                      Fechar
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {participantIds.length > 0 ? (
                <div className="border rounded-lg p-3 max-h-40 overflow-y-auto space-y-2">
                  {participantIds.map((studentId) => {
                    const summary = participantDetails?.[studentId]
                    const displayName = summary ? `${summary.name ?? ""} ${summary.surname ?? ""}`.trim() : ""
                    const fallbackName = displayName || summary?.id || studentId

                    return (
                      <div key={studentId} className="flex items-center justify-between p-2 bg-muted rounded">
                        <span className="text-sm">{fallbackName}</span>
                        <div className="flex items-center gap-1">
                          {mode === "edit" && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => toggleAttendance(studentId)}
                              className={`h-6 w-6 p-0 ${
                                attendance?.[studentId] ? "text-green-600" : "text-muted-foreground"
                              }`}
                            >
                              <CheckCircle className="w-3 h-3" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRemoveStudent(studentId)}
                            className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Nenhum participante adicionado ainda.
                </p>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              onClick={submitForm}
              className="bg-green-600 hover:bg-green-700"
              disabled={!isFormValid || trainersLoading}
            >
              {trainersLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Carregando...
                </>
              ) : (
                mode === "create" ? "Criar Evento" : "Salvar Alterações"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }
