"use client"

import { useState, useEffect } from "react"
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

    const [formData, setFormData] = useState<EventFormData>({
      name: "",
      date: "",
      startTime: "",
      endTime: "",
      location: "",
      description: "",
      trainerId: "",
      participantIds: [],
      attendance: {},
      participantDetails: {},
    })
    const [isAddParticipantDialogOpen, setIsAddParticipantDialogOpen] = useState(false)
    useEffect(() => {
      if (initialData) {
        setFormData({
          name: initialData.name || "",
          date: initialData.date || "",
          startTime: initialData.startTime || "",
          endTime: initialData.endTime || "",
          location: initialData.location || "",
          description: initialData.description || "",
          trainerId: initialData.trainerId || "",
          participantIds: initialData.participantIds || [],
          attendance: initialData.attendance || {},
          participantDetails: initialData.participantDetails || {},
        })
      } else {
        setFormData({
          name: "",
          date: "",
          startTime: "",
          endTime: "",
          location: "",
          description: "",
          trainerId: "",
          participantIds: [],
          attendance: {},
          participantDetails: {},
        })
      }
    }, [initialData, open])

    const handleTimeChange = (field: "startTime" | "endTime", value: string) => {
      setFormData(prev => {
        const next = { ...prev, [field]: value }

        const hasCompleteStart = next.startTime?.length === 5
        const hasCompleteEnd = next.endTime?.length === 5

        if (hasCompleteStart && hasCompleteEnd) {
          const start = new Date(`2000-01-01T${next.startTime}`)
          const end = new Date(`2000-01-01T${next.endTime}`)

          if (end < start) {
            if (field === "startTime") {
              next.endTime = value
            } else {
              return prev
            }
          }
        }

        return next
      })
    }

    const addParticipant = (student: StudentSummary): boolean => {
      let added = false
      setFormData(prev => {
        if (prev.participantIds.includes(student.id)) {
          return prev
        }
        added = true
        return {
          ...prev,
          participantIds: [...prev.participantIds, student.id],
          attendance: {
            ...prev.attendance,
            [student.id]: prev.attendance?.[student.id] ?? false,
          },
          participantDetails: {
            ...(prev.participantDetails || {}),
            [student.id]: student,
          },
        }
      })
      return added
    }

    const handleAddStudent = (student: StudentSummary) => {
      addParticipant(student)
    }

    const handleRemoveStudent = (studentId: string) => {
      setFormData(prev => {
        const nextAttendance = { ...prev.attendance }
        delete nextAttendance[studentId]
        const nextDetails = { ...(prev.participantDetails || {}) }
        delete nextDetails[studentId]

        return {
          ...prev,
          participantIds: prev.participantIds.filter(id => id !== studentId),
          attendance: nextAttendance,
          participantDetails: nextDetails,
        }
      })
    }

    const toggleAttendance = (studentId: string) => {
      setFormData(prev => {
        return {
          ...prev,
          attendance: {
            ...prev.attendance,
            [studentId]: !prev.attendance?.[studentId],
          },
        }
      })
    }

    const handleSubmit = () => {
      onSubmit(formData)
      onClose()
    }

    const isFormValid = () => {
      return (
        formData.name.trim() &&
        formData.date &&
        formData.startTime &&
        formData.endTime &&
        formData.location.trim() &&
        formData.trainerId
      )
    }

    const currentParticipants = formData.participantIds.length

    return (
      <Dialog open={open} onOpenChange={onClose}>
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
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Corrida no Parque"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="eventDate">Data *</Label>
                <Input
                  id="eventDate"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="eventStartTime">Horário de Início *</Label>
                <Input
                  id="eventStartTime"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => handleTimeChange("startTime", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="eventEndTime">Horário de Fim *</Label>
                <Input
                  id="eventEndTime"
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => handleTimeChange("endTime", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="eventLocation">Local *</Label>
              <Input
                id="eventLocation"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Ex: Parque Ibirapuera"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="eventInstructor">Instrutor *</Label>
                <Select
                  value={formData.trainerId}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, trainerId: value }))}
                >
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
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="eventDescription">Descrição</Label>
              <Textarea
                id="eventDescription"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descreva o evento..."
                rows={3}
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
                    excludedStudentIds={formData.participantIds}
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

              {formData.participantIds.length > 0 ? (
                <div className="border rounded-lg p-3 max-h-40 overflow-y-auto space-y-2">
                  {formData.participantIds.map((studentId) => {
                    const summary = formData.participantDetails?.[studentId]
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
                                formData.attendance?.[studentId] ? "text-green-600" : "text-muted-foreground"
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
              onClick={handleSubmit}
              className="bg-green-600 hover:bg-green-700"
              disabled={!isFormValid() || trainersLoading}
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
