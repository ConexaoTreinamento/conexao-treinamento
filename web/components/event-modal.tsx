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
import { CheckCircle, X } from "lucide-react"
import AddStudentDialog from "@/components/add-student-dialog"

interface EventFormData {
  name: string
  date: string
  startTime: string
  endTime: string
  location: string
  description: string
  instructor: string
  students: string[]
  attendance?: Record<string, boolean>
}

interface EventModalProps {
  open: boolean
  mode: "create" | "edit"
  initialData?: Partial<EventFormData>
  onClose: () => void
  onSubmit: (data: EventFormData) => void
  availableStudents: string[]
  instructors: string[]
}

export default function EventModal({
  open,
  mode,
  initialData,
  onClose,
  onSubmit,
  availableStudents,
  instructors,
}: EventModalProps) {
  const [formData, setFormData] = useState<EventFormData>({
    name: "",
    date: "",
    startTime: "",
    endTime: "",
    location: "",
    description: "",
    instructor: "",
    students: [],
    attendance: {},
  })

  // Initialize form data when modal opens or initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        date: initialData.date || "",
        startTime: initialData.startTime || "",
        endTime: initialData.endTime || "",
        location: initialData.location || "",
        description: initialData.description || "",
        instructor: initialData.instructor || "",
        students: initialData.students || [],
        attendance: initialData.attendance || {},
      })
    } else {
      // Reset form for create mode
      setFormData({
        name: "",
        date: "",
        startTime: "",
        endTime: "",
        location: "",
        description: "",
        instructor: "",
        students: [],
        attendance: {},
      })
    }
  }, [initialData, open])

  const handleTimeChange = (field: "startTime" | "endTime", value: string) => {
    setFormData((prev) => {
      const newForm = { ...prev, [field]: value }

      // Validate times
      if (newForm.startTime && newForm.endTime) {
        const start = new Date(`2000-01-01T${newForm.startTime}`)
        const end = new Date(`2000-01-01T${newForm.endTime}`)

        if (end < start) {
          // If end time is earlier than start time, set end time to start time
          newForm.endTime = newForm.startTime
        }
      }

      return newForm
    })
  }

  const handleAddStudent = (student: string) => {
    if (!formData.students.includes(student)) {
      setFormData(prev => ({
        ...prev,
        students: [...prev.students, student],
        attendance: {
          ...prev.attendance,
          [student]: false,
        },
      }))
    }
  }

  const handleRemoveStudent = (student: string) => {
    setFormData(prev => {
      const newAttendance = { ...prev.attendance }
      delete newAttendance[student]
      return {
        ...prev,
        students: prev.students.filter(s => s !== student),
        attendance: newAttendance,
      }
    })
  }

  const toggleAttendance = (student: string) => {
    setFormData(prev => ({
      ...prev,
      attendance: {
        ...prev.attendance,
        [student]: !prev.attendance?.[student],
      },
    }))
  }

  const handleSubmit = () => {
    onSubmit(formData)
    onClose()
  }

  const isFormValid = () => {
    return formData.name.trim() &&
           formData.date &&
           formData.startTime &&
           formData.endTime &&
           formData.location.trim() &&
           formData.instructor
  }

  const currentParticipants = formData.students.length

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
              : "Edite as informações do evento"
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
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

          {/* Date and Time */}
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

          {/* Location and Instructor */}
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
                value={formData.instructor}
                onValueChange={(value) => setFormData(prev => ({ ...prev, instructor: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o instrutor" />
                </SelectTrigger>
                <SelectContent>
                  {instructors.map((instructor) => (
                    <SelectItem key={instructor} value={instructor}>
                      {instructor}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description */}
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

          {/* Participants */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
              <Label>
                Participantes ({currentParticipants})
              </Label>
              <AddStudentDialog
                students={availableStudents}
                onAddStudent={handleAddStudent}
                excludeStudents={formData.students}
              />
            </div>

            {formData.students.length > 0 && (
              <div className="border rounded-lg p-3 max-h-40 overflow-y-auto space-y-2">
                {formData.students.map((student) => (
                  <div key={student} className="flex items-center justify-between p-2 bg-muted rounded">
                    <span className="text-sm">{student}</span>
                    <div className="flex items-center gap-1">
                      {/* Only show attendance toggle in edit mode */}
                      {mode === "edit" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => toggleAttendance(student)}
                          className={`h-6 w-6 p-0 ${formData.attendance?.[student] ? "text-green-600" : "text-muted-foreground"}`}
                        >
                          <CheckCircle className="w-3 h-3" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemoveStudent(student)}
                        className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
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
            disabled={!isFormValid()}
          >
            {mode === "create" ? "Criar Evento" : "Salvar Alterações"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
